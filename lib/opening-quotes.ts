import type { Poem } from "@/lib/types";
import {
  expandIndicesToVisualLines,
  fallbackVisualExcerpt,
  visualLinesFromIndices,
} from "@/lib/poem-lines";
import openingQuotesJson from "@/data/generated/opening-quotes.json";

/**
 * 离线 LLM / 人工摘句表：poemId → 行下标。
 * 与 poems.json 分离，避免 data:build 全量重写冲掉标注。
 */
export type OpeningQuoteEntry = {
  /** content 0-based 下标；可连续段落（如 4 行）或跳取 */
  lineIndices: number[];
  source?: "llm" | "manual" | "rule";
};

export type OpeningQuotesMap = Record<string, OpeningQuoteEntry>;

/** 单段名句可含多行 content（如青玉案结句 4 行） */
export const MAX_QUOTE_LINE_INDICES = 6;

/** 卡片 / 开卷摘句最多视觉行（粘合后） */
export const MAX_EXCERPT_VISUAL_LINES = 2;

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
 * 解析合法摘句下标：落在 content 范围内、去重、最多 MAX_QUOTE_LINE_INDICES 句。
 * 优先保留模型/人工给出的顺序（名句常非连续）。
 */
export function sanitizeQuoteLineIndices(
  indices: unknown,
  contentLength: number,
  maxIndices: number = MAX_QUOTE_LINE_INDICES,
): number[] | null {
  if (!Array.isArray(indices) || contentLength <= 0) return null;
  const out: number[] = [];
  const seen = new Set<number>();
  const cap = Math.max(1, maxIndices);
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
    if (out.length >= cap) break;
  }
  if (out.length === 0) return null;
  // 仅 1 句时：若可能则补相邻下一句（避免卡片只剩半联）
  if (out.length === 1 && contentLength >= 2 && cap >= 2) {
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
 * 开卷 / 卡片展示句：优先 LLM/人工下标（粘合 pause→空格），
 * 不足 maxVisual 行时前后延伸 content 下标补满；
 * 无表则从文首按同一粘合规则取满。
 */
export function resolveOpeningDisplayLines(
  poem: Poem,
  maxVisualLines: number = MAX_EXCERPT_VISUAL_LINES,
): string[] {
  const content = poem.content ?? [];
  if (content.length === 0) return [];

  const seed = getOpeningQuoteIndices(poem);
  if (seed?.length) {
    const expanded = expandIndicesToVisualLines(
      content,
      seed,
      maxVisualLines,
    );
    const joined = visualLinesFromIndices(
      content,
      expanded,
      maxVisualLines,
    );
    if (joined.length > 0) return joined;
  }

  return fallbackVisualExcerpt(content, maxVisualLines);
}
