import type { Poem } from "@/lib/types";
import { toDisplayLines } from "@/lib/poem-lines";
import openingQuotesJson from "@/data/generated/opening-quotes.json";

/**
 * 离线 LLM / 人工摘句表：poemId → 行下标。
 * 与 poems.json 分离，避免 data:build 全量重写冲掉标注。
 */
export type OpeningQuoteEntry = {
  /** content 0-based 下标，通常 2 句 */
  lineIndices: number[];
  source?: "llm" | "manual" | "rule";
};

export type OpeningQuotesMap = Record<string, OpeningQuoteEntry>;

let quotesCache: OpeningQuotesMap | null =
  (openingQuotesJson as OpeningQuotesMap) ?? {};

function loadQuotesMap(): OpeningQuotesMap {
  return quotesCache ?? {};
}

/** 测试或脚本可注入 */
export function setOpeningQuotesMapForTest(map: OpeningQuotesMap | null): void {
  quotesCache = map ?? {};
}

/**
 * 解析合法摘句下标：落在 content 范围内、去重、最多 2 句。
 * 优先保留模型给出的顺序（名句常非连续）。
 */
export function sanitizeQuoteLineIndices(
  indices: unknown,
  contentLength: number,
): number[] | null {
  if (!Array.isArray(indices) || contentLength <= 0) return null;
  const out: number[] = [];
  const seen = new Set<number>();
  for (const raw of indices) {
    const n =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number.parseInt(raw, 10)
          : NaN;
    if (!Number.isInteger(n) || n < 0 || n >= contentLength) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= 2) break;
  }
  if (out.length === 0) return null;
  // 仅 1 句时：若可能则补相邻下一句
  if (out.length === 1 && contentLength >= 2) {
    const only = out[0];
    const next = only + 1 < contentLength ? only + 1 : only > 0 ? only - 1 : -1;
    if (next >= 0 && !seen.has(next)) out.push(next);
  }
  return out.length >= 1 ? out : null;
}

/** 合并 poem 字段与 generated 表 */
export function getOpeningQuoteIndices(poem: Poem): number[] | null {
  const n = poem.content?.length ?? 0;
  if (n === 0) return null;

  if (poem.openingQuoteLines?.length) {
    const fromPoem = sanitizeQuoteLineIndices(poem.openingQuoteLines, n);
    if (fromPoem) return fromPoem;
  }

  const entry = loadQuotesMap()[poem.id];
  if (entry?.lineIndices?.length) {
    return sanitizeQuoteLineIndices(entry.lineIndices, n);
  }
  return null;
}

/**
 * 开卷展示句：优先 LLM/人工下标，否则前两句（去标点）。
 */
export function resolveOpeningDisplayLines(poem: Poem): string[] {
  const display = toDisplayLines(poem.content ?? []);
  const texts = display.map((d) => d.text).filter(Boolean);
  if (texts.length === 0) return [];

  const indices = getOpeningQuoteIndices(poem);
  if (indices?.length) {
    const picked = indices
      .map((i) => texts[i])
      .filter((t): t is string => Boolean(t));
    if (picked.length > 0) return picked.slice(0, 2);
  }

  return texts.slice(0, 2);
}
