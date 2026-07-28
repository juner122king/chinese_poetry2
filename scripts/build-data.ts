/**
 * 从 chinese-poetry 拉取唐诗/宋词三百首，归一化、繁转简、规则 enrich，写出 generated JSON。
 *
 * 用法：
 *   npx tsx scripts/build-data.ts
 *   npx tsx scripts/build-data.ts --skip-fetch   # 使用 data/raw 已有文件
 *
 * 产物：
 *   data/raw/*           原始拉取（可 gitignore）
 *   data/generated/poems.json
 *   data/generated/authors.json
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenCC from "opencc-js";
import { pinyin } from "pinyin-pro";
import {
  generateMotifsRule,
  generateTagsRule,
  inferThemeFromText,
} from "../lib/generate-motifs";
import { TAG_SELECT_MAX } from "../lib/imagery-taxonomy";
import { resolveAuthorYears } from "../lib/author-years";
import type { Author, Poem, PoemForm, PoemSource, PoemTag } from "../lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW_DIR = join(ROOT, "data", "raw");
const OUT_DIR = join(ROOT, "data", "generated");
const OVERRIDES_PATH = join(ROOT, "data", "overrides", "poems.json");

type PoemOverride = {
  match: { title: string; author: string };
  note?: string;
  patch: Partial<
    Pick<
      Poem,
      | "content"
      | "theme"
      | "tags"
      | "motifs"
      | "motifsSource"
      | "motifsLocked"
      | "featured"
      | "title"
    >
  >;
};

/** 钉死源库版本，避免静默破坏 */
const CORPUS_SHA = "b8594f81a89752241442f2ce267d6f66f96704ee";
const CORPUS_BASE = `https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/${CORPUS_SHA}`;

const FILES = {
  tang300: {
    path: "全唐诗/唐诗三百首.json",
    local: "tang300.json",
  },
  ci300: {
    path: "宋词/宋词三百首.json",
    local: "ci300.json",
  },
  authorsTang: {
    path: "全唐诗/authors.tang.json",
    local: "authors.tang.json",
  },
  authorsCi: {
    path: "宋词/author.song.json",
    local: "authors.song.json",
  },
} as const;

/** 源库中文文学标签 → 本站意境 tags（辅助信号） */
const SOURCE_TAG_MAP: Record<string, PoemTag[]> = {
  边塞: ["frontier"],
  边塞诗: ["frontier"],
  战争: ["war", "frontier"],
  爱国: ["war"],
  思乡: ["homesickness"],
  思乡诗: ["homesickness"],
  月亮: ["moon", "night"],
  月夜: ["moon", "night"],
  送别: ["parting"],
  离别: ["parting"],
  友情: ["parting"],
  山水: ["mountain", "river-lake"],
  写景: ["mountain", "river-lake"],
  田园: ["pastoral"],
  隐逸: ["reclusion"],
  抒情: [],
  咏物: ["flowers"],
  咏物诗: ["flowers"],
  春天: ["spring"],
  春天诗: ["spring"],
  秋天: ["autumn"],
  冬天: ["winter"],
  夏天: ["summer"],
  爱情: ["love-longing"],
  婉约: ["love-longing"],
  豪放: ["wine"],
  乐府: [],
  哲理: [],
  写人: [],
  女子: ["love-longing"],
  怀古: ["city-ruins"],
  登高: ["mountain"],
  羁旅: ["homesickness", "boat-travel"],
  宫怨: ["palace-court"],
  闺怨: ["love-longing"],
  宴饮: ["wine"],
  饮酒: ["wine"],
  黄河: ["river-lake"],
  长江: ["river-lake"],
  西湖: ["river-lake"],
  山: ["mountain"],
  水: ["river-lake"],
  雨: ["rain"],
  雪: ["snow"],
  花: ["flowers"],
  梅花: ["flowers", "winter"],
  柳: ["trees-bamboo", "spring"],
  鸟: ["birds"],
};

const VALID_TAGS = new Set<string>([
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

/** 诗：标题包含即优先 featured（简体） */
const FEATURED_SHI_HINTS = [
  "静夜思",
  "将进酒",
  "登高",
  "春望",
  "望庐山瀑布",
  "早发白帝城",
  "黄鹤楼",
  "枫桥夜泊",
  "登鹳雀楼",
  "春晓",
  "相思",
  "出塞",
  "凉州词",
  "送元二使安西",
  "游子吟",
  "赋得古原草送别",
];

/**
 * 词：词牌 + 作者 精确优先（避免「浣溪沙」刷屏）
 * 格式：`${rhythmic}|${author}` —— 需能在宋词三百首中命中
 */
const FEATURED_CI_KEYS = [
  "水调歌头|苏轼",
  "念奴娇|苏轼",
  "念奴娇|辛弃疾",
  "江城子|苏轼",
  "定风波|苏轼",
  "声声慢|李清照",
  "如梦令|李清照",
  "一剪梅|李清照",
  "雨霖铃|柳永",
  "满江红|岳飞",
  "青玉案|辛弃疾",
  "破阵子|辛弃疾",
  "永遇乐|辛弃疾",
  "永遇乐|李清照",
  "虞美人|李煜",
  "相见欢|李煜",
  "蝶恋花|欧阳修",
  "蝶恋花|柳永",
  "鹊桥仙|秦观",
  "扬州慢|姜夔",
];
type RawShi = {
  id?: string;
  title?: string;
  author: string;
  paragraphs: string[];
  tags?: string[];
};

type RawCi = {
  author: string;
  rhythmic: string;
  paragraphs: string[];
  tags?: string[];
};

type RawTangAuthor = { id?: string; name: string; desc?: string };
type RawCiAuthor = {
  name: string;
  description?: string;
  short_description?: string;
};

const t2s = OpenCC.Converter({ from: "t", to: "cn" });

function toSimplified(text: string): string {
  if (!text) return text;
  return t2s(text);
}

function stripPunct(s: string): string {
  return s
    .replace(/[，。！？、；：""''《》【】（）()\[\]·•\s]/g, "")
    .trim();
}

function toSlug(text: string): string {
  const simplified = toSimplified(text);
  const core = stripPunct(simplified);
  const py = pinyin(core, {
    toneType: "none",
    type: "array",
    nonZh: "consecutive",
  }) as string[];
  const slug = py
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "item";
}

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  used.add(slug);
  return slug;
}

function truncateBio(text: string, max = 180): string {
  const s = toSimplified(text).replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max).replace(/[，、；：\s]+$/u, "")}…`;
}

function mapSourceTags(sourceTags: string[] | undefined): PoemTag[] {
  if (!sourceTags?.length) return [];
  const out = new Set<PoemTag>();
  for (const raw of sourceTags) {
    const key = toSimplified(raw);
    // skip meta collection labels
    if (key.includes("三百首") || key.includes("年级") || key.includes("课外")) {
      continue;
    }
    const mapped = SOURCE_TAG_MAP[key];
    if (mapped) {
      for (const t of mapped) {
        if (VALID_TAGS.has(t)) out.add(t);
      }
    }
  }
  return [...out];
}

/** 规则 tags 优先，源库 tags 补位；遵守 TAG_SELECT_MAX 上限 */
function mergeTags(a: PoemTag[], b: PoemTag[], max = TAG_SELECT_MAX): PoemTag[] {
  const seen = new Set<PoemTag>();
  const out: PoemTag[] = [];
  for (const t of [...a, ...b]) {
    if (!VALID_TAGS.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

async function download(relPath: string, dest: string): Promise<void> {
  const url = `${CORPUS_BASE}/${relPath.split("/").map(encodeURIComponent).join("/")}`;
  console.log(`↓ ${relPath}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log(`  → ${dest} (${buf.length} bytes)`);
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf-8")) as T;
}

/** 将源库段落按句读切成展示行，并保留源库标点 */
function cleanParagraphs(paragraphs: string[]): string[] {
  const lines: string[] = [];
  for (const raw of paragraphs) {
    const s = toSimplified(raw).trim().replace(/\s+/g, "");
    if (!s) continue;
    const chunks = s
      .split(/(?<=[。！？；，、])/u)
      .map((line) => line.replace(/^[：:\s]+|[：:\s]+$/g, "").trim())
      .filter((line) => line.length > 0);
    lines.push(...chunks);
  }
  return lines;
}

/** 去掉乐府类前缀，便于展示与 slug */
function cleanTitle(title: string): string {
  return toSimplified(title)
    .replace(
      /^(?:鼓吹曲辞|横吹曲辞|相和歌辞|杂曲歌辞|琴曲歌辞|舞曲歌辞|近代曲辞|杂歌谣辞|新乐府辞)\s*/u,
      "",
    )
    .trim();
}

function featuredScore(poem: Poem): number {
  if (poem.form === "ci") {
    const key = `${poem.rhythmic ?? poem.title}|${poem.author}`;
    const idx = FEATURED_CI_KEYS.indexOf(key);
    if (idx >= 0) return 200 - idx;
    // 词牌命中但作者未在白名单：低分，仅作后备
    if (FEATURED_CI_KEYS.some((k) => k.startsWith(`${poem.rhythmic}|`))) {
      return 30;
    }
    return 0;
  }
  for (let i = 0; i < FEATURED_SHI_HINTS.length; i++) {
    const h = FEATURED_SHI_HINTS[i];
    if (poem.title === h) return 300 - i;
    // 允许「出塞 一」「出塞二首」等短变体，排除超长应制标题误伤
    if (
      poem.title.includes(h) &&
      poem.title.length <= h.length + 8
    ) {
      return 180 - i;
    }
  }
  if (poem.content.length === 4) return 25;
  if (poem.content.length <= 8) return 10;
  return 0;
}

function assignFeatured(poems: Poem[]): void {
  // 名篇白名单优先；诗/词分队列 1:1 交错入选，保证 featured 池宋词脸充足
  const scored = poems
    .map((p, i) => ({ p, i, score: featuredScore(p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i);

  const shiQueue = scored.filter((x) => x.p.form !== "ci");
  // 词：仅白名单精确命中（score≥100），避免同词牌陌生作者灌入 featured
  const ciQueue = scored.filter((x) => x.p.form === "ci" && x.score >= 100);

  const perAuthor = new Map<string, number>();
  const seenTitleAuthor = new Set<string>();
  let count = 0;
  const limit = 24;
  /** 词最多占一半，避免低分词牌灌满 */
  const ciCap = Math.ceil(limit / 2);
  let shiCount = 0;
  let ciCount = 0;
  let si = 0;
  let ci = 0;

  const tryPick = (item: { p: Poem } | undefined, kind: "shi" | "ci"): boolean => {
    if (!item || count >= limit) return false;
    if (kind === "ci" && ciCount >= ciCap) return false;
    const { p } = item;
    const key = `${p.title}|${p.author}`;
    if (seenTitleAuthor.has(key)) return false;
    const n = perAuthor.get(p.author) ?? 0;
    if (n >= 2) return false;
    p.featured = true;
    perAuthor.set(p.author, n + 1);
    seenTitleAuthor.add(key);
    count += 1;
    if (kind === "shi") shiCount += 1;
    else ciCount += 1;
    return true;
  };

  while (count < limit && (si < shiQueue.length || ci < ciQueue.length)) {
    while (si < shiQueue.length && !tryPick(shiQueue[si++], "shi")) {
      /* skip */
    }
    while (ci < ciQueue.length && !tryPick(ciQueue[ci++], "ci")) {
      /* skip */
    }
  }

  // 词侧提前耗尽时继续补诗
  while (count < limit && si < shiQueue.length) {
    tryPick(shiQueue[si++], "shi");
  }
}

/** 名篇人工覆盖（theme / 通行本正文 / motifs），见 data/overrides/poems.json */
function applyPoemOverrides(poems: Poem[]): number {
  if (!existsSync(OVERRIDES_PATH)) {
    console.warn(`No overrides at ${OVERRIDES_PATH}`);
    return 0;
  }
  const overrides = readJson<PoemOverride[]>(OVERRIDES_PATH);
  let applied = 0;
  for (const rule of overrides) {
    const title = toSimplified(rule.match.title);
    const author = toSimplified(rule.match.author);
    const targets = poems.filter(
      (p) => p.title === title && p.author === author,
    );
    if (!targets.length) {
      console.warn(`Override miss: ${title} · ${author}`);
      continue;
    }
    for (const poem of targets) {
      Object.assign(poem, rule.patch);
      applied += 1;
      console.log(`✓ override ${poem.id} (${title} · ${author})`);
    }
  }
  return applied;
}

async function main() {
  const skipFetch = process.argv.includes("--skip-fetch");
  mkdirSync(RAW_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  if (!skipFetch) {
    for (const f of Object.values(FILES)) {
      await download(f.path, join(RAW_DIR, f.local));
    }
  } else {
    for (const f of Object.values(FILES)) {
      const p = join(RAW_DIR, f.local);
      if (!existsSync(p)) {
        throw new Error(`Missing ${p}; run without --skip-fetch first`);
      }
    }
    console.log("Using existing data/raw/*");
  }

  const tangRaw = readJson<RawShi[]>(join(RAW_DIR, FILES.tang300.local));
  const ciRaw = readJson<RawCi[]>(join(RAW_DIR, FILES.ci300.local));
  const authorsTang = readJson<RawTangAuthor[]>(
    join(RAW_DIR, FILES.authorsTang.local),
  );
  const authorsCi = readJson<RawCiAuthor[]>(
    join(RAW_DIR, FILES.authorsCi.local),
  );

  const usedIds = new Set<string>();
  const poems: Poem[] = [];

  // —— 唐诗三百首 ——
  for (const item of tangRaw) {
    const author = toSimplified(item.author);
    const title = cleanTitle(item.title ?? "无题");
    const content = cleanParagraphs(item.paragraphs ?? []);
    if (!content.length) continue;

    const baseSlug = toSlug(title);
    // disambiguate common titles with author
    const id = uniqueSlug(
      usedIds.has(baseSlug) ? `${baseSlug}-${toSlug(author)}` : baseSlug,
      usedIds,
    );

    const sourceTags = mapSourceTags(item.tags);
    const ruleTags = generateTagsRule(title, content);
    const tags = mergeTags(ruleTags, sourceTags);
    const theme = inferThemeFromText(title, content);
    const motifs = generateMotifsRule({ title, content, tags, theme });

    poems.push({
      id,
      title,
      author,
      dynasty: "唐",
      content,
      theme,
      tags,
      motifs,
      motifsSource: "rule",
      motifsLocked: false,
      form: "shi" satisfies PoemForm,
      source: "tang300" satisfies PoemSource,
      sourceId: item.id,
    });
  }

  // —— 宋词三百首 ——
  for (const item of ciRaw) {
    const author = toSimplified(item.author);
    const rhythmic = toSimplified(item.rhythmic ?? "词");
    const content = cleanParagraphs(item.paragraphs ?? []);
    if (!content.length) continue;

    const title = rhythmic;
    const baseSlug = toSlug(`${rhythmic}-${author}`);
    const id = uniqueSlug(baseSlug, usedIds);

    const sourceTags = mapSourceTags(item.tags);
    const ruleTags = generateTagsRule(title, content);
    const tags = mergeTags(ruleTags, sourceTags);
    const theme = inferThemeFromText(title, content);
    const motifs = generateMotifsRule({ title, content, tags, theme });

    poems.push({
      id,
      title,
      author,
      dynasty: "宋",
      content,
      theme,
      tags,
      motifs,
      motifsSource: "rule",
      motifsLocked: false,
      form: "ci",
      rhythmic,
      source: "ci300",
    });
  }

  const overrideCount = applyPoemOverrides(poems);
  console.log(`Applied ${overrideCount} poem override(s)`);

  assignFeatured(poems);

  // —— Authors ——
  const bioByName = new Map<string, string>();
  for (const a of authorsTang) {
    const name = toSimplified(a.name);
    if (a.desc) bioByName.set(name, truncateBio(a.desc));
  }
  for (const a of authorsCi) {
    const name = toSimplified(a.name);
    const raw = a.short_description || a.description || "";
    if (raw && !bioByName.has(name)) {
      bioByName.set(name, truncateBio(raw));
    }
  }

  /** 宋源全文，供生卒年解析（短 bio 常截断年份） */
  const yearsSourceByName = new Map<string, string>();
  for (const a of authorsCi) {
    const name = toSimplified(a.name);
    const raw = [a.short_description, a.description].filter(Boolean).join("\n");
    if (raw) yearsSourceByName.set(name, raw);
  }
  for (const a of authorsTang) {
    const name = toSimplified(a.name);
    if (a.desc && !yearsSourceByName.has(name)) {
      yearsSourceByName.set(name, a.desc);
    }
  }

  const usedAuthorSlugs = new Set<string>();
  const authorNames = Array.from(new Set(poems.map((p) => p.author)));
  const authors: Author[] = authorNames.map((name) => {
    const dynasty =
      poems.find((p) => p.author === name)?.dynasty ?? "";
    const bio =
      bioByName.get(name) ||
      `${name}，${dynasty}代诗人。`;
    const slug = uniqueSlug(toSlug(name), usedAuthorSlugs);
    const years = resolveAuthorYears(
      name,
      bio,
      yearsSourceByName.get(name),
    );
    return {
      name,
      slug,
      dynasty,
      bio,
      poemIds: poems.filter((p) => p.author === name).map((p) => p.id),
      ...(years ? { years } : {}),
    };
  });

  // sort authors by poem count desc for stable output
  authors.sort((a, b) => b.poemIds.length - a.poemIds.length || a.name.localeCompare(b.name, "zh"));

  const poemsPath = join(OUT_DIR, "poems.json");
  const authorsPath = join(OUT_DIR, "authors.json");
  writeFileSync(poemsPath, `${JSON.stringify(poems, null, 2)}\n`, "utf-8");
  writeFileSync(authorsPath, `${JSON.stringify(authors, null, 2)}\n`, "utf-8");

  const featured = poems.filter((p) => p.featured).length;
  const meta = {
    corpusSha: CORPUS_SHA,
    generatedAt: new Date().toISOString(),
    poemCount: poems.length,
    authorCount: authors.length,
    featuredCount: featured,
    tang: poems.filter((p) => p.source === "tang300").length,
    ci: poems.filter((p) => p.source === "ci300").length,
  };
  writeFileSync(
    join(OUT_DIR, "meta.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
    "utf-8",
  );

  console.log("\nDone.");
  console.log(meta);
  console.log(`Wrote ${poemsPath}`);
  console.log(`Wrote ${authorsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
