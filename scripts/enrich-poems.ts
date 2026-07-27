/**
 * 离线批量为 generated 诗词补全 tags / theme / motifs，并写回 JSON。
 *
 * 用法：
 *   npm run enrich:motifs
 *   npx tsx scripts/enrich-poems.ts --force
 *   npx tsx scripts/enrich-poems.ts --force --include-locked
 *   npx tsx scripts/enrich-poems.ts --dry-run
 *   npx tsx scripts/enrich-poems.ts --llm --limit 5 --dry-run
 *   npx tsx scripts/enrich-poems.ts --llm --concurrency 1 --delay-ms 1500
 *   # 补跑上次 429 回退的（跳过已是 llm 的）
 *   npx tsx scripts/enrich-poems.ts --llm --only-missing-llm --concurrency 1
 *
 * 环境变量（--llm 时）：
 *   SILICONFLOW_API_KEY   必填
 *   SILICONFLOW_BASE_URL  默认 https://api.siliconflow.cn/v1
 *   SILICONFLOW_MODEL     默认 Qwen/Qwen2.5-14B-Instruct
 *
 * 推荐主路径：npm run data:build（规则 enrich）。
 * LLM 仅离线批跑，勿在页面请求路径调用。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateMotifsRule,
  generateTagsRule,
  inferThemeFromText,
} from "../lib/generate-motifs";
import {
  getTagLabel,
  pickThemeFromTags,
  TAG_SELECT_MAX,
} from "../lib/imagery-taxonomy";
import { formatMotifs } from "../lib/types";
import type { Poem, PoemTag, PoemTheme } from "../lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const poemsPath = join(__dirname, "..", "data", "generated", "poems.json");

const force = process.argv.includes("--force");
const includeLocked = process.argv.includes("--include-locked");
const dryRun = process.argv.includes("--dry-run");
const useLlm = process.argv.includes("--llm");
/** 只处理尚未 motifsSource=llm 的条目（补跑 429 回退） */
const onlyMissingLlm = process.argv.includes("--only-missing-llm");
/** 失败时不写 rule，保留原数据，便于下次再试 */
const keepOnFail = process.argv.includes("--keep-on-fail");

function argValue(name: string, fallback: number): number {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return fallback;
  const raw = process.argv[idx + 1];
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const limit = argValue("--limit", 0); // 0 = 全部
/** LLM 默认并发 1，避免 SiliconFlow 429 */
const concurrency = Math.max(
  1,
  Math.min(16, argValue("--concurrency", useLlm ? 1 : 4)),
);
/** 两次 API 请求最小间隔（全局节流） */
const delayMs = argValue("--delay-ms", useLlm ? 1500 : 0);
/** 429/5xx 最大尝试次数 */
const maxAttempts = Math.max(1, Math.min(12, argValue("--max-attempts", 6)));

const VALID_TAGS = new Set<PoemTag>([
  "spring",
  "summer",
  "autumn",
  "winter",
  "night",
  "dawn-dusk",
  "moon",
  "rain",
  "snow",
  "wind-cloud",
  "stars",
  "mountain",
  "river-lake",
  "sea",
  "frontier",
  "pastoral",
  "city-ruins",
  "courtyard",
  "flowers",
  "trees-bamboo",
  "birds",
  "fish-aquatic",
  "insects",
  "wine",
  "parting",
  "homesickness",
  "love-longing",
  "war",
  "reclusion",
  "festival",
  "palace-court",
  "boat-travel",
  "temple-bell",
  "music",
  "lamplight",
]);

const VALID_THEMES = new Set<PoemTheme>([
  "night-moon",
  "dawn-dusk",
  "spring",
  "summer",
  "autumn",
  "winter",
  "snow-river",
  "rain",
  "mountain",
  "river-lake",
  "pastoral",
  "frontier",
  "flowers",
  "birds",
  "fish-aquatic",
  "trees-bamboo",
  "wine",
  "festival",
  "homesickness",
  "parting",
  "reclusion",
  "landscape",
]);

const TAG_LIST = [...VALID_TAGS].join(", ");
const THEME_LIST = [...VALID_THEMES].join(", ");

type LlmResult = {
  tags: PoemTag[];
  theme: PoemTheme;
  motifs: string[];
};

function enrichByRule(poem: Poem): Poem {
  const tags =
    poem.tags?.length && !force
      ? poem.tags
      : generateTagsRule(poem.title, poem.content);
  const theme =
    poem.theme && !force
      ? poem.theme
      : inferThemeFromText(poem.title, poem.content);
  const motifs = generateMotifsRule({ ...poem, tags, theme });
  return {
    ...poem,
    tags,
    theme,
    motifs,
    motifsSource: "rule",
    motifsLocked: poem.motifsLocked ?? false,
  };
}

function shouldSkip(poem: Poem): { skip: boolean; reason?: string } {
  if (poem.motifsLocked && !includeLocked) {
    return { skip: true, reason: "locked" };
  }
  // 补跑模式：已是 llm 的跳过；其余即使已有 rule motifs 也重跑
  if (onlyMissingLlm) {
    if (poem.motifsSource === "llm") {
      return { skip: true, reason: "already-llm" };
    }
    return { skip: false };
  }
  if (poem.motifs?.length >= 3 && poem.tags?.length && !force) {
    return { skip: true, reason: "already-has-motifs" };
  }
  return { skip: false };
}

/** 全局请求节流：保证任意两次 chat 调用至少间隔 delayMs */
let throttleChain: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

async function throttleRequest(): Promise<void> {
  if (delayMs <= 0) return;
  const run = async () => {
    const now = Date.now();
    const wait = Math.max(0, lastRequestAt + delayMs - now);
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  };
  const next = throttleChain.then(run, run);
  throttleChain = next.catch(() => undefined);
  await next;
}

function parseRetryAfterMs(res: Response): number | null {
  const raw = res.headers.get("retry-after");
  if (!raw) return null;
  const sec = Number(raw);
  if (Number.isFinite(sec) && sec >= 0) return Math.ceil(sec * 1000);
  const date = Date.parse(raw);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

/** 429 退避：优先 Retry-After，否则 5s → 15s → 30s → 60s → 90s → 120s… */
function backoffMs(attempt: number, res?: Response): number {
  if (res) {
    const ra = parseRetryAfterMs(res);
    if (ra != null) return Math.min(Math.max(ra, 1000), 180_000);
  }
  const table = [5_000, 15_000, 30_000, 60_000, 90_000, 120_000];
  return table[Math.min(attempt - 1, table.length - 1)];
}

function sanitizeTags(raw: unknown): PoemTag[] {
  if (!Array.isArray(raw)) return [];
  const out: PoemTag[] = [];
  const seen = new Set<PoemTag>();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item.trim() as PoemTag;
    if (!VALID_TAGS.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= TAG_SELECT_MAX) break;
  }
  return out;
}

/**
 * 纠正 LLM 常见 theme 偏置（尤其 reclusion 过用）。
 * 仅在「theme 与 tags 明显冲突」时改写。
 */
function correctThemeBias(theme: PoemTheme, tags: PoemTag[]): PoemTheme {
  const has = (t: PoemTag) => tags.includes(t);

  // reclusion 仅当标签含隐逸，或无更强画面标签时才保留
  if (theme === "reclusion" && !has("reclusion")) {
    if (has("city-ruins") || has("palace-court")) {
      return has("parting") || has("homesickness") ? "parting" : "landscape";
    }
    if (has("frontier") || has("war")) return "frontier";
    if (has("rain")) return "rain";
    if (has("snow")) return "snow-river";
    if (has("moon") || has("night")) return "night-moon";
    if (has("dawn-dusk")) return "dawn-dusk";
    if (has("love-longing") || has("flowers")) return "flowers";
    if (has("wine")) return "wine";
    if (tags.length) return pickThemeFromTags(tags);
    return "landscape";
  }

  // 怀古城阙却选了隐逸画面：改 landscape / parting
  if (theme === "reclusion" && (has("city-ruins") || has("palace-court"))) {
    return has("parting") || has("homesickness") ? "parting" : "landscape";
  }

  return theme;
}

function sanitizeTheme(raw: unknown, tags: PoemTag[]): PoemTheme | null {
  let theme: PoemTheme | null = null;
  if (typeof raw === "string" && VALID_THEMES.has(raw as PoemTheme)) {
    theme = raw as PoemTheme;
  } else if (tags.length) {
    theme = pickThemeFromTags(tags);
  }
  if (!theme) return null;
  return correctThemeBias(theme, tags);
}

/** 白话/动词短语/生硬拼接 —— 直接丢弃 */
const MOTIF_BLOCKLIST = new Set([
  "不适",
  "不忍",
  "如何",
  "何处",
  "无人",
  "无限",
  "多少",
  "此时",
  "当时",
  "说玄宗",
  "共剪烛",
  "梦时同",
  "叹凤嗟",
  "梦远别",
  "蓬山隔",
  "宫花红",
  "花红",
  "泪下",
  "怆然泪",
  "大手笔",
  "明堂",
  "清贫",
  "圣皇",
  "圣相",
  "玉检",
  "长戈",
]);

/**
 * taxonomy / 怀古模板词：仅当诗中**原文出现**才允许，禁止套用。
 */
const GENERIC_MOTIF_POOL = new Set([
  "古城",
  "废垒",
  "宫墙",
  "京华",
  "荒城",
  "远山",
  "烟水",
  "平林",
  "暮色",
  "孤影",
  "清景",
  "空山",
  "远峰",
  "层峦",
  "长风",
  "白云",
  "彩云",
  "云海",
]);

/** 允许的三字专名/定型意象（其它三字默认不收） */
const THREE_CHAR_ALLOW = new Set([
  "玉门关",
  "单于台",
  "白帝城",
  "黄鹤楼",
  "寒山寺",
  "鹳雀楼",
  "长安道",
  "扬子江",
  "巫山云",
  "洛城风",
  "未央宫",
  "铜雀台",
  "凤凰台",
  "岳阳楼",
  "山海关",
  "嘉峪关",
]);

/** 从正文抽取时的优先意象词典（二字为主） */
const ANCHOR_LEXICON = [
  "玉门关",
  "黄鹤楼",
  "寒山寺",
  "白帝城",
  "明月",
  "月光",
  "月色",
  "夜雨",
  "秋池",
  "秋雨",
  "秋风",
  "秋色",
  "夕阳",
  "黄昏",
  "斜阳",
  "日暮",
  "孤城",
  "羌笛",
  "黄河",
  "长江",
  "沧海",
  "烟雨",
  "风雨",
  "黄叶",
  "落花",
  "宫花",
  "行宫",
  "故园",
  "故乡",
  "乡关",
  "归思",
  "客心",
  "蝉声",
  "蝉鸣",
  "流萤",
  "萤火",
  "暮鸦",
  "烟霞",
  "星辰",
  "灵犀",
  "春酒",
  "酒杯",
  "金樽",
  "边关",
  "边塞",
  "关山",
  "胡马",
  "飞将",
  "阴山",
  "龙城",
  "黄沙",
  "黄砂",
  "烽火",
  "戍楼",
  "管弦",
  "琴瑟",
  "锦瑟",
  "杜鹃",
  "蝴蝶",
  "蓝田",
  "沧海",
  "巫山",
  "蓬山",
  "珠帘",
  "画楼",
  "蜡烛",
  "烛光",
  "青灯",
  "渔火",
  "钟声",
  "古原",
  "乐游",
  "嵩云",
  "秦树",
  "梁园",
  "茂陵",
  "淮西",
  "韩碑",
  "简书",
  "风云",
  "梁父",
  "天地",
  "悠悠",
  "怆然",
  "涕下",
  "白头",
  "玄鬓",
  "薄宦",
  "碧树",
  "无情",
  "高洁",
  "清苦",
  "两楹",
  "夫子",
  "梦蝶",
  "庄生",
  "望帝",
  "月斜",
  "绣罗",
  "金屋",
  "无题",
  "巴山",
  "西窗",
  "剪烛",
  "何当",
  "共话",
  "玄宗",
  "宫女",
  "白发",
  "古人",
  "来者",
  "前不见",
  "后不见",
].sort((a, b) => b.length - a.length);

function isThreeCharAllowed(word: string): boolean {
  return THREE_CHAR_ALLOW.has(word);
}

/**
 * 与本诗的贴合度：
 * 3 = 原文连续出现
 * 2 = 二字且两字均见于诗（弱锚定）
 * 1 = 未锚定的二字（仅允许极少数）
 * 0 = 丢弃
 */
function motifAnchorScore(word: string, poemText: string): number {
  if (poemText.includes(word)) return 3;
  if (word.length === 2) {
    if (poemText.includes(word[0]) && poemText.includes(word[1])) return 2;
    return 1;
  }
  // 三字专名：诗中出现专名主体即可
  if (word.length === 3 && isThreeCharAllowed(word)) {
    if (poemText.includes(word.slice(0, 2)) || poemText.includes(word.slice(1))) {
      return 2;
    }
  }
  return 0;
}

/**
 * 是否像可展示的古典意象词（非诗句切片/动宾短语/模板词）。
 */
function isGoodMotifWord(word: string, poemText: string): boolean {
  if (!/^[\u4e00-\u9fff]{2,3}$/.test(word)) return false;
  if (MOTIF_BLOCKLIST.has(word)) return false;

  // 怀古/山水模板：必须原文出现
  if (GENERIC_MOTIF_POOL.has(word) && !poemText.includes(word)) return false;

  // 白话/判断词
  if (/^(不适|无人|无限|多少|何处|如何|此时|当时|已经|清贫)/.test(word)) {
    return false;
  }

  // 动词起笔三字短语
  if (/^[说共寄问送别叹剪]/.test(word) && word.length >= 3) return false;

  // 生硬「名+单字色」
  if (word.length === 3 && /[\u4e00-\u9fff]{2}[红绿青碧白黑黄紫]$/.test(word)) {
    return false;
  }

  // 三字：仅白名单专名；正文中的三字连续片段一律视为诗句切片
  if (word.length === 3) {
    if (!isThreeCharAllowed(word)) return false;
    // 专名若以「诗句切片」形式嵌在更长句中仍可保留（专名本身合法）
    return motifAnchorScore(word, poemText) >= 2;
  }

  // 二字：拒绝明显动词短语
  if (/^(说|共|问|送|叹)/.test(word)) return false;

  return motifAnchorScore(word, poemText) >= 1;
}

/**
 * 从 LLM 输出筛选 motifs：二字优先，强锚定优先，最多 1 个弱锚定。
 */
function sanitizeMotifs(raw: unknown, poemText = ""): string[] {
  if (!Array.isArray(raw)) return [];

  type Cand = { word: string; score: number; len: number };
  const cands: Cand[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const word = item.trim().replace(/\s+/g, "");
    if (!word || seen.has(word)) continue;
    if (!isGoodMotifWord(word, poemText)) continue;
    const score = motifAnchorScore(word, poemText);
    if (score < 1) continue;
    seen.add(word);
    cands.push({ word, score, len: word.length });
  }

  // 分：锚定高 > 二字 > 原序
  cands.sort((a, b) => b.score - a.score || a.len - b.len);

  const out: string[] = [];
  let weak = 0; // score===1
  for (const c of cands) {
    if (out.length >= 3) break;
    if (c.score <= 1) {
      if (weak >= 1) continue; // 最多一个非贴文词
      weak += 1;
    }
    out.push(c.word);
  }
  return out;
}

/** 从诗题+正文抽取锚定意象，避免 taxonomy 模板回补 */
function extractAnchoredMotifs(
  title: string,
  content: string[],
  limit: number,
): string[] {
  const text = `${title}${content.join("")}`;
  const found: string[] = [];
  const seen = new Set<string>();

  const push = (w: string) => {
    const word = w.trim();
    if (!word || seen.has(word) || found.length >= limit) return;
    if (!isGoodMotifWord(word, text)) return;
    if (motifAnchorScore(word, text) < 2) return; // 抽取只要贴文
    seen.add(word);
    found.push(word);
  };

  for (const w of ANCHOR_LEXICON) {
    if (text.includes(w)) push(w);
  }

  // 标题 core（2–3 字）
  const core = title.split(/[·•\s]/).filter(Boolean).pop() ?? title;
  if (core.length >= 2 && core.length <= 3) push(core);

  // 正文高频二字：仅当落在词典或「名物」宽松模式——再扫一遍未命中的二字专名感词
  // 取诗中连续二字，若两字都是常见意象偏旁且未被收，可补（保守：只补 ANCHOR 已覆盖的）

  return found.slice(0, limit);
}

function buildSystemPrompt(): string {
  return [
    "你是古典诗词意境标注助手，只输出合法 JSON 对象，不要 markdown、不要解释。",
    '格式：{"tags":["..."],"theme":"...","motifs":["..","..",".."]}',
    `tags：从下列 id 中选 1–${TAG_SELECT_MAX} 个（按相关度降序）：${TAG_LIST}`,
    `theme：从下列 id 中恰好选 1 个（驱动主视觉背景，必须与 tags 一致）：${THEME_LIST}`,
    "",
    "【theme 选择规则——务必遵守】",
    "1. theme 表示「主视觉画面」，不是文学史主题概括；优先物候/天象/地理，情感类次之。",
    "2. reclusion（隐逸）极少用：仅当诗明确写归隐、幽居、采菊、渔樵、山居闲适等；",
    "   不得因「感伤/怀古/咏史/人生感慨/孤独」就选 reclusion。",
    "3. 怀古、废宫、行宫、隋宫、故宫、咏史、碑志、驿站凭吊：",
    "   tags 应含 city-ruins 或 palace-court；theme 用 landscape（苍茫）或 parting（兴亡感伤），",
    "   有月夜则 night-moon，有边塞烽火则 frontier——禁止默认 reclusion。",
    "4. 无题、恋情、闺怨、相思、锦书、珠帘、金翡翠等：tags 用 love-longing，",
    "   theme 多用 flowers 或 night-moon，不要 reclusion。",
    "5. 咏蝉/夏景：summer；夜雨：rain；边塞出塞关山：frontier；夕阳日暮：dawn-dusk。",
    "6. 若拿不准画面，用 landscape，不要用 reclusion 当垃圾桶。",
    "",
    "【tags 规则】",
    "- 只标诗中真正显著的意象/情感，宁少勿滥。",
    "- 咏史怀古加 city-ruins；宫廷宫殿加 palace-court；不要把怀古误标成 reclusion。",
    "- 无题相思加 love-longing；边塞加 frontier；战伐加 war。",
    "",
    "【motifs 规则——极严格】",
    "- 恰好 3 个「二字」意象词（极少数情况可有一个三字地名专名，如玉门关）。",
    "- **出处强制**：每个词应能在诗题或正文找到依据——优先诗中连续二字（如诗有「秋池」就用秋池）；",
    "  允许把诗中物象写成规范称呼，但禁止与本诗无关的套话。",
    "- 好的例子：明月、秋池、孤城、羌笛、夕阳、宫花、白头、故园、薄宦、蝉声、烟霞、萤火、暮鸦、灵犀、星辰。",
    "- 坏的例子（禁止）：",
    "  · 诗句切片：明月光、秦时月、龙城将、地上霜、思故乡、巴山夜；",
    "  · 生硬拼接：宫花红、怆然泪；",
    "  · 动宾/白话：共剪烛、说玄宗、不适、清贫、大手笔；",
    "  · 怀古模板（诗中未出现时禁用）：古城、废垒、宫墙、京华、荒城。",
    "- 像匾额题辞：名词性、典雅、可独立展示；禁止动词短语与情感评论。",
    "- 三词覆盖不同侧面，避免同义重复；必须像「这首诗自己的」意象，而非标签库默认词。",
  ].join("\n");
}

function buildUserPrompt(poem: Poem): string {
  return [
    `标题：${poem.title}`,
    `作者：${poem.author}`,
    poem.dynasty ? `朝代：${poem.dynasty}` : "",
    poem.rhythmic ? `词牌：${poem.rhythmic}` : "",
    `正文：${poem.content.join("")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callSiliconFlowChat(
  system: string,
  user: string,
  attempt = 1,
): Promise<string> {
  const apiKey = process.env.SILICONFLOW_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "缺少 SILICONFLOW_API_KEY。请设置环境变量后再使用 --llm。",
    );
  }
  const baseUrl = (
    process.env.SILICONFLOW_BASE_URL?.trim() ||
    "https://api.siliconflow.cn/v1"
  ).replace(/\/$/, "");
  const model =
    process.env.SILICONFLOW_MODEL?.trim() || "Qwen/Qwen2.5-14B-Instruct";

  await throttleRequest();

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 350,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (err) {
    // 网络抖动：同样退避重试
    if (attempt >= maxAttempts) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`fetch failed after ${attempt} attempts: ${msg}`);
    }
    const wait = backoffMs(attempt);
    console.warn(
      `  ↻ 网络错误，${Math.round(wait / 1000)}s 后重试 (${attempt}/${maxAttempts})`,
    );
    await sleep(wait);
    return callSiliconFlowChat(system, user, attempt + 1);
  }

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= maxAttempts) {
      throw new Error(`LLM HTTP ${res.status} after ${attempt} attempts`);
    }
    const wait = backoffMs(attempt, res);
    console.warn(
      `  ↻ HTTP ${res.status}，${Math.round(wait / 1000)}s 后重试 (${attempt}/${maxAttempts})`,
    );
    await sleep(wait);
    return callSiliconFlowChat(system, user, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("LLM 返回空 content");
  }
  return content;
}

function parseLlmJson(content: string): unknown {
  const trimmed = content.trim();
  // 容忍偶发 ```json 包裹
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(body);
}

/**
 * 离线 LLM 标注。失败时由调用方回退规则。
 */
export async function generateWithLlm(poem: Poem): Promise<LlmResult> {
  const content = await callSiliconFlowChat(
    buildSystemPrompt(),
    buildUserPrompt(poem),
  );
  const parsed = parseLlmJson(content) as {
    tags?: unknown;
    theme?: unknown;
    motifs?: unknown;
  };

  let tags = sanitizeTags(parsed.tags);
  if (!tags.length) {
    tags = generateTagsRule(poem.title, poem.content);
  }

  let theme = sanitizeTheme(parsed.theme, tags);
  if (!theme) {
    theme = inferThemeFromText(poem.title, poem.content);
  }

  const poemText = `${poem.title}${poem.content.join("")}`;
  let motifs = sanitizeMotifs(parsed.motifs, poemText);

  // 1) 正文锚定抽取（优先于 taxonomy 模板）
  if (motifs.length < 3) {
    for (const m of extractAnchoredMotifs(poem.title, poem.content, 6)) {
      if (motifs.length >= 3) break;
      if (!motifs.includes(m)) motifs.push(m);
    }
  }

  // 2) rule 词典命中：仅保留强锚定（原文出现）
  if (motifs.length < 3) {
    const fallback = generateMotifsRule({ ...poem, tags, theme });
    for (const m of fallback) {
      if (motifs.length >= 3) break;
      if (motifs.includes(m)) continue;
      if (GENERIC_MOTIF_POOL.has(m) && !poemText.includes(m)) continue;
      if (motifAnchorScore(m, poemText) >= 3 && isGoodMotifWord(m, poemText)) {
        motifs.push(m);
      }
    }
  }

  // 3) 仍不足：弱锚定 rule 词 / 锚定抽取已尽 → 仅二字且 score>=2
  if (motifs.length < 3) {
    const fallback = generateMotifsRule({ ...poem, tags, theme });
    for (const m of fallback) {
      if (motifs.length >= 3) break;
      if (motifs.includes(m)) continue;
      if (GENERIC_MOTIF_POOL.has(m) && !poemText.includes(m)) continue;
      if (
        /^[\u4e00-\u9fff]{2}$/.test(m) &&
        motifAnchorScore(m, poemText) >= 2 &&
        !MOTIF_BLOCKLIST.has(m)
      ) {
        motifs.push(m);
      }
    }
  }

  motifs = motifs.slice(0, 3);
  // 极端不足时不再灌模板；允许 <3 由展示层处理——但数据层仍尽量凑满
  if (motifs.length < 3) {
    for (const m of extractAnchoredMotifs(poem.title, poem.content, 8)) {
      if (motifs.length >= 3) break;
      if (!motifs.includes(m)) motifs.push(m);
    }
  }

  return { tags, theme, motifs };
}

async function enrichOneLlm(
  poem: Poem,
): Promise<{ poem: Poem; skipped: boolean; reason?: string; source: string }> {
  const { skip, reason } = shouldSkip(poem);
  if (skip) {
    return { poem, skipped: true, reason, source: poem.motifsSource ?? "rule" };
  }

  try {
    const llm = await generateWithLlm(poem);
    return {
      skipped: false,
      source: "llm",
      poem: {
        ...poem,
        tags: llm.tags,
        theme: llm.theme,
        motifs: llm.motifs,
        motifsSource: "llm",
        motifsLocked: poem.motifsLocked ?? false,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (keepOnFail) {
      console.warn(`⚠  LLM 失败，保留原文：${poem.title} — ${msg}`);
      return {
        skipped: false,
        source: "keep-on-fail",
        poem,
      };
    }
    console.warn(`⚠  LLM 失败，回退 rule：${poem.title} — ${msg}`);
    return {
      skipped: false,
      source: "rule-fallback",
      poem: enrichByRule(poem),
    };
  }
}

function enrichOneRule(
  poem: Poem,
): { poem: Poem; skipped: boolean; reason?: string; source: string } {
  const { skip, reason } = shouldSkip(poem);
  if (skip) {
    return { poem, skipped: true, reason, source: poem.motifsSource ?? "rule" };
  }
  return { skipped: false, source: "rule", poem: enrichByRule(poem) };
}

async function mapPool<T, R>(
  items: T[],
  pool: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function run(): Promise<void> {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from({ length: Math.min(pool, items.length) }, () =>
    run(),
  );
  await Promise.all(runners);
  return results;
}

async function main() {
  const poems = JSON.parse(readFileSync(poemsPath, "utf-8")) as Poem[];

  // 预筛：only-missing-llm / locked 等在 shouldSkip 里处理；这里先算候选规模
  let candidates = poems;
  if (onlyMissingLlm) {
    candidates = poems.filter(
      (p) =>
        p.motifsSource !== "llm" &&
        (includeLocked || !p.motifsLocked),
    );
  }
  const workList =
    limit > 0 ? candidates.slice(0, limit) : candidates;

  const alreadyLlm = poems.filter((p) => p.motifsSource === "llm").length;

  console.log(
    `共 ${poems.length} 首 · 已是 llm ${alreadyLlm} · 本次候选 ${workList.length} 首 · 模式 ${useLlm ? "llm" : "rule"}` +
      (useLlm
        ? ` · concurrency=${concurrency} · delay=${delayMs}ms · maxAttempts=${maxAttempts}`
        : "") +
      (onlyMissingLlm ? " · only-missing-llm" : "") +
      (keepOnFail ? " · keep-on-fail" : "") +
      "\n",
  );

  if (useLlm && !process.env.SILICONFLOW_API_KEY?.trim()) {
    console.error("错误：--llm 需要环境变量 SILICONFLOW_API_KEY");
    process.exit(1);
  }

  if (useLlm) {
    console.log(
      `model=${process.env.SILICONFLOW_MODEL?.trim() || "Qwen/Qwen2.5-14B-Instruct"}`,
    );
    console.log(
      `base=${(process.env.SILICONFLOW_BASE_URL?.trim() || "https://api.siliconflow.cn/v1").replace(/\/$/, "")}\n`,
    );
  }

  let generated = 0;
  let skipped = 0;
  let llmOk = 0;
  let ruleFallback = 0;
  let keepFail = 0;
  let done = 0;

  // 只对 workList 中需要处理的条目替换；limit 时其余原样保留
  const indexById = new Map(poems.map((p, i) => [p.id, i]));
  const next = poems.slice();

  if (useLlm) {
    const outcomes = await mapPool(workList, concurrency, async (raw) => {
      const outcome = await enrichOneLlm(raw);
      done += 1;
      if (done % 25 === 0 || done === workList.length) {
        console.log(`… 进度 ${done}/${workList.length}`);
      }
      return outcome;
    });

    for (const outcome of outcomes) {
      const idx = indexById.get(outcome.poem.id);
      if (idx !== undefined) next[idx] = outcome.poem;

      const tagStr = (outcome.poem.tags ?? []).map(getTagLabel).join(" ");
      if (outcome.skipped) {
        skipped += 1;
        if (workList.length <= 50) {
          console.log(
            `⏭  [${outcome.reason}] ${outcome.poem.title}  →  ${formatMotifs(outcome.poem.motifs)}  [${tagStr}]`,
          );
        }
      } else {
        generated += 1;
        if (outcome.source === "llm") llmOk += 1;
        if (outcome.source === "rule-fallback") ruleFallback += 1;
        if (outcome.source === "keep-on-fail") keepFail += 1;
        if (llmOk + ruleFallback + keepFail <= 30 || workList.length <= 50) {
          console.log(
            `✨ [${outcome.source}] ${outcome.poem.title}  →  ${formatMotifs(outcome.poem.motifs)}  (${outcome.poem.theme})  [${tagStr}]`,
          );
        }
      }
    }
  } else {
    for (const raw of workList) {
      const outcome = enrichOneRule(raw);
      const idx = indexById.get(outcome.poem.id);
      if (idx !== undefined) next[idx] = outcome.poem;

      const tagStr = (outcome.poem.tags ?? []).map(getTagLabel).join(" ");
      if (outcome.skipped) {
        skipped += 1;
        if (workList.length <= 50) {
          console.log(
            `⏭  [${outcome.reason}] ${outcome.poem.title}  →  ${formatMotifs(outcome.poem.motifs)}  [${tagStr}]`,
          );
        }
      } else {
        generated += 1;
        if (generated <= 30 || workList.length <= 50) {
          console.log(
            `✨ [rule] ${outcome.poem.title}  →  ${formatMotifs(outcome.poem.motifs)}  (${outcome.poem.theme})  [${tagStr}]`,
          );
        }
      }
    }
  }

  const finalLlm = next.filter((p) => p.motifsSource === "llm").length;
  console.log(
    `\n生成 ${generated} · 跳过 ${skipped}` +
      (useLlm
        ? ` · llm成功 ${llmOk} · rule回退 ${ruleFallback}` +
          (keepOnFail ? ` · 保留失败 ${keepFail}` : "") +
          ` · 库内 llm 合计 ${finalLlm}/${next.length}`
        : ""),
  );

  if (dryRun) {
    console.log("（dry-run）未写回文件。");
    return;
  }

  writeFileSync(poemsPath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
  console.log(`已写回 ${poemsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
