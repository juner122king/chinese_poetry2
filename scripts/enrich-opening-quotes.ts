/**
 * 离线 LLM：为各名家选定「开卷代表作」+ 摘句行下标。
 * 写入 data/generated/author-openings.json（不改 poems.json）。
 *
 * 用法：
 *   npx tsx scripts/enrich-opening-quotes.ts
 *   npx tsx scripts/enrich-opening-quotes.ts --dry-run --limit 5
 *   npx tsx scripts/enrich-opening-quotes.ts --force
 *   npx tsx scripts/enrich-opening-quotes.ts --only-missing
 *
 * 环境变量（OpenAI 兼容）：
 *   OPENAI_API_KEY 或 SILICONFLOW_API_KEY  必填其一
 *   OPENAI_BASE_URL / SILICONFLOW_BASE_URL
 *   OPENAI_MODEL / SILICONFLOW_MODEL  SiliconFlow 默认 Qwen/Qwen3-32B
 *
 * 勿在页面请求路径调用。
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isValidAuthorOpeningEntry,
  selectOpeningCandidates,
  type AuthorOpeningEntry,
  type AuthorOpeningsMap,
} from "../lib/author-openings";
import { sortWorksByRepresentative } from "../lib/famous-poems";
import { sanitizeQuoteLineIndices } from "../lib/opening-quotes";
import type { Author, Poem } from "../lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const poemsPath = join(ROOT, "data", "generated", "poems.json");
const authorsPath = join(ROOT, "data", "generated", "authors.json");
const outPath = join(ROOT, "data", "generated", "author-openings.json");

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const onlyMissing = process.argv.includes("--only-missing") || !force;

function argValue(name: string, fallback: number): number {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return fallback;
  const raw = process.argv[idx + 1];
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const limit = argValue("--limit", 0);
const delayMs = argValue("--delay-ms", 800);
const maxAttempts = Math.max(1, Math.min(8, argValue("--max-attempts", 5)));
const concurrency = Math.max(1, Math.min(8, argValue("--concurrency", 2)));
const maxCandidates = Math.max(
  4,
  Math.min(24, argValue("--max-candidates", 16)),
);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

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

function resolveLlmConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  const sfKey = process.env.SILICONFLOW_API_KEY?.trim();
  const oaKey = process.env.OPENAI_API_KEY?.trim();
  if (sfKey) {
    return {
      apiKey: sfKey,
      baseUrl: (
        process.env.SILICONFLOW_BASE_URL?.trim() ||
        "https://api.siliconflow.cn/v1"
      ).replace(/\/$/, ""),
      model:
        process.env.SILICONFLOW_MODEL?.trim() || "Qwen/Qwen3-32B",
    };
  }
  if (oaKey) {
    return {
      apiKey: oaKey,
      baseUrl: (
        process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1"
      ).replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  throw new Error(
    "缺少 API Key。请设置 OPENAI_API_KEY 或 SILICONFLOW_API_KEY。",
  );
}

function backoffMs(attempt: number, res?: Response): number {
  if (res) {
    const raw = res.headers.get("retry-after");
    if (raw) {
      const sec = Number(raw);
      if (Number.isFinite(sec) && sec >= 0) {
        return Math.min(Math.max(Math.ceil(sec * 1000), 1000), 120_000);
      }
    }
  }
  const table = [3_000, 8_000, 15_000, 30_000, 60_000];
  return table[Math.min(attempt - 1, table.length - 1)];
}

async function callChat(
  system: string,
  user: string,
  attempt = 1,
): Promise<string> {
  const { apiKey, baseUrl, model } = resolveLlmConfig();
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
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (err) {
    if (attempt >= maxAttempts) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`fetch failed: ${msg}`);
    }
    const wait = backoffMs(attempt);
    console.warn(`  ↻ 网络错误，${Math.round(wait / 1000)}s 后重试`);
    await sleep(wait);
    return callChat(system, user, attempt + 1);
  }

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= maxAttempts) {
      throw new Error(`HTTP ${res.status} after ${attempt} attempts`);
    }
    const wait = backoffMs(attempt, res);
    console.warn(
      `  ↻ HTTP ${res.status}，${Math.round(wait / 1000)}s 后重试`,
    );
    await sleep(wait);
    return callChat(system, user, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("空 content");
  }
  return content;
}

function parseLlmJson(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(body);
}

const SYSTEM = [
  "你是古典文学编辑，为诗词网站「名家页」挑选开卷代表作与摘句。",
  "只输出合法 JSON，不要 markdown、不要解释。",
  '格式：{"poemId":"候选中的 id","lineIndices":[i,j]}',
  "",
  "选篇标准（大众最熟优先）：",
  "1. 华语读者最耳熟能详的那一首，能代表作者标签；",
  "2. 优先千古名篇，而非冷僻或应制之作；",
  "3. poemId 必须是候选列表中给出的 id 字符串。",
  "",
  "摘句标准：",
  "1. 从该诗正文编号行中选 1–2 句最宜作卷首引文的名句；",
  "2. 两句尽量成联、上口；可非连续行；",
  "3. lineIndices 为 0-based 整数，且属于该诗正文行号。",
].join("\n");

/** 单首正文过长时截断中间，保留首尾以便仍能点到名句 */
function formatPoemBody(poem: Poem, maxLines = 28): string {
  const lines = poem.content ?? [];
  if (lines.length <= maxLines) {
    return lines.map((raw, i) => `${i}|${raw}`).join("\n");
  }
  const head = 18;
  const tail = 8;
  const parts: string[] = [];
  for (let i = 0; i < head; i++) parts.push(`${i}|${lines[i]}`);
  parts.push(`…(省略 ${lines.length - head - tail} 行)…`);
  for (let i = lines.length - tail; i < lines.length; i++) {
    parts.push(`${i}|${lines[i]}`);
  }
  return parts.join("\n");
}

function buildUserPrompt(
  author: Author,
  candidates: Poem[],
  totalWorks: number,
): string {
  const blocks = candidates.map((p, idx) => {
    const head = [
      `### 候选 ${idx + 1}`,
      `id: ${p.id}`,
      `题: ${p.title}`,
      p.rhythmic ? `词牌: ${p.rhythmic}` : "",
      `行数: ${p.content?.length ?? 0}`,
      "正文:",
      formatPoemBody(p),
    ]
      .filter(Boolean)
      .join("\n");
    return head;
  });

  return [
    `作者：${author.name}`,
    `朝代：${author.dynasty}`,
    `本站共 ${totalWorks} 篇，下列为优先候选（共 ${candidates.length} 首），请只从中选择。`,
    "",
    ...blocks,
  ].join("\n");
}

function fallbackEntry(works: Poem[]): AuthorOpeningEntry {
  const poem = sortWorksByRepresentative(works)[0];
  const n = poem.content?.length ?? 0;
  const lineIndices =
    n <= 0 ? [] : n === 1 ? [0] : ([0, 1] as number[]);
  return {
    poemId: poem.id,
    lineIndices,
    source: "rule",
  };
}

async function pickOpeningForAuthor(
  author: Author,
  works: Poem[],
): Promise<AuthorOpeningEntry> {
  if (works.length === 0) {
    throw new Error("no works");
  }

  // 仅一首：仍可让 LLM 摘句；失败则前两句
  const candidates = selectOpeningCandidates(works, maxCandidates);

  if (works.length === 1 && (works[0].content?.length ?? 0) <= 2) {
    return {
      poemId: works[0].id,
      lineIndices:
        (works[0].content?.length ?? 0) <= 1 ? [0] : [0, 1],
      source: "rule",
    };
  }

  const raw = await callChat(
    SYSTEM,
    buildUserPrompt(author, candidates, works.length),
  );
  const parsed = parseLlmJson(raw) as {
    poemId?: unknown;
    lineIndices?: unknown;
  };

  const poemId =
    typeof parsed.poemId === "string" ? parsed.poemId.trim() : "";
  const poem =
    candidates.find((p) => p.id === poemId) ??
    works.find((p) => p.id === poemId);

  if (!poem) {
    // id 无效：尝试用标题模糊？直接 rule
    console.warn(`  ! 无效 poemId=${poemId}，回退名篇分`);
    return fallbackEntry(works);
  }

  const lineIndices = sanitizeQuoteLineIndices(
    parsed.lineIndices,
    poem.content?.length ?? 0,
  );
  if (!lineIndices?.length) {
    const n = poem.content?.length ?? 0;
    return {
      poemId: poem.id,
      lineIndices: n <= 1 ? [0] : [0, Math.min(1, n - 1)],
      source: "llm",
    };
  }

  return {
    poemId: poem.id,
    lineIndices,
    source: "llm",
  };
}

type Job = {
  author: Author;
  works: Poem[];
};

async function main() {
  const poems = readJson<Poem[]>(poemsPath);
  const authors = readJson<Author[]>(authorsPath);
  const byId = new Map(poems.map((p) => [p.id, p]));

  let existing: AuthorOpeningsMap = {};
  if (existsSync(outPath)) {
    try {
      existing = readJson<AuthorOpeningsMap>(outPath);
    } catch {
      existing = {};
    }
  }

  const jobs: Job[] = [];
  for (const author of authors) {
    const works = author.poemIds
      .map((id) => byId.get(id))
      .filter((p): p is Poem => Boolean(p));
    if (!works.length) continue;

    if (onlyMissing) {
      const prev = existing[author.slug];
      if (prev && isValidAuthorOpeningEntry(prev, works)) continue;
    }

    jobs.push({ author, works });
  }

  const queue = limit > 0 ? jobs.slice(0, limit) : jobs;
  console.log(
    `待标注 ${queue.length} 家（选篇+摘句；onlyMissing=${onlyMissing} dryRun=${dryRun}）`,
  );

  const next: AuthorOpeningsMap = { ...existing };
  let ok = 0;
  let fail = 0;

  let cursor = 0;
  async function worker() {
    while (cursor < queue.length) {
      const i = cursor++;
      const job = queue[i];
      const label = `${job.author.name}（${job.works.length} 篇）`;
      try {
        const entry = await pickOpeningForAuthor(job.author, job.works);
        const poem = byId.get(entry.poemId);
        const title = poem
          ? `${poem.title}${poem.rhythmic ? `/${poem.rhythmic}` : ""}`
          : entry.poemId;
        console.log(
          `✓ [${i + 1}/${queue.length}] ${label} → ${title} [${entry.lineIndices.join(",")}] (${entry.source})`,
        );
        if (!dryRun) next[job.author.slug] = entry;
        ok += 1;
      } catch (err) {
        fail += 1;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`✗ [${i + 1}/${queue.length}] ${label}: ${msg}`);
        // 失败时写 rule 兜底，避免反复空
        if (!dryRun && !onlyMissing) {
          next[job.author.slug] = fallbackEntry(job.works);
        }
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  if (!dryRun) {
    writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
    console.log(`已写入 ${outPath}（共 ${Object.keys(next).length} 条）`);
  } else {
    console.log("dry-run：未写文件");
  }
  console.log(`完成 ok=${ok} fail=${fail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
