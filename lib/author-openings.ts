import authorOpeningsJson from "@/data/generated/author-openings.json";
import type { Author, Poem } from "@/lib/types";
import { sortWorksByRepresentative } from "@/lib/famous-poems";
import { toDisplayLines } from "@/lib/poem-lines";
import {
  resolveOpeningDisplayLines,
  sanitizeQuoteLineIndices,
} from "@/lib/opening-quotes";

/**
 * 名家开卷：代表作 + 摘句（离线 LLM / 人工）。
 * 与 poems.json 分离，避免 data:build 冲掉。
 */
export type AuthorOpeningEntry = {
  /** 代表作 poem.id */
  poemId: string;
  /** content 0-based 下标，通常 2 句 */
  lineIndices: number[];
  source?: "llm" | "manual" | "rule";
};

export type AuthorOpeningsMap = Record<string, AuthorOpeningEntry>;

let cache: AuthorOpeningsMap | null =
  (authorOpeningsJson as AuthorOpeningsMap) ?? {};

function loadMap(): AuthorOpeningsMap {
  return cache ?? {};
}

/** 测试注入 */
export function setAuthorOpeningsMapForTest(
  map: AuthorOpeningsMap | null,
): void {
  cache = map ?? {};
}

export function getAuthorOpeningEntry(
  authorSlug: string,
): AuthorOpeningEntry | undefined {
  const entry = loadMap()[authorSlug];
  if (!entry?.poemId) return undefined;
  return entry;
}

/**
 * 校验 entry 是否指向 works 内合法篇目。
 */
export function resolveAuthorRepresentativePoem(
  works: Poem[],
  authorSlug?: string,
): { poem: Poem; lineIndices: number[] | null; source?: AuthorOpeningEntry["source"] } | null {
  if (works.length === 0) return null;
  const byId = new Map(works.map((p) => [p.id, p]));

  if (authorSlug) {
    const entry = getAuthorOpeningEntry(authorSlug);
    if (entry) {
      const poem = byId.get(entry.poemId);
      if (poem) {
        const n = poem.content?.length ?? 0;
        const lineIndices = sanitizeQuoteLineIndices(entry.lineIndices, n);
        return { poem, lineIndices, source: entry.source };
      }
    }
  }

  // 回退：名篇打分
  const poem = sortWorksByRepresentative(works)[0];
  return { poem, lineIndices: null, source: "rule" };
}

/**
 * 作品列表：LLM/人工代表作置顶，其余仍按名篇分排序。
 */
export function orderWorksWithRepresentative(
  works: Poem[],
  authorSlug?: string,
): Poem[] {
  const sorted = sortWorksByRepresentative(works);
  if (!authorSlug || sorted.length <= 1) return sorted;
  const entry = getAuthorOpeningEntry(authorSlug);
  if (!entry?.poemId) return sorted;
  const pin = sorted.find((p) => p.id === entry.poemId);
  if (!pin) return sorted;
  return [pin, ...sorted.filter((p) => p.id !== pin.id)];
}

/**
 * 从代表作 entry 的行下标取展示句；无效则走通用摘句逻辑。
 */
export function linesFromOpeningResolution(
  poem: Poem,
  lineIndices: number[] | null,
): string[] {
  if (lineIndices?.length) {
    const display = toDisplayLines(poem.content ?? []);
    const picked = lineIndices
      .map((i) => display[i]?.text)
      .filter((t): t is string => Boolean(t));
    if (picked.length) return picked.slice(0, 2);
  }
  return resolveOpeningDisplayLines(poem);
}

/** 脚本侧：从候选里截断过长正文，控制 prompt 体积 */
export function selectOpeningCandidates(
  works: Poem[],
  maxCandidates = 16,
): Poem[] {
  if (works.length <= maxCandidates) return sortWorksByRepresentative(works);
  return sortWorksByRepresentative(works).slice(0, maxCandidates);
}

export function isValidAuthorOpeningEntry(
  entry: unknown,
  works: Poem[],
): entry is AuthorOpeningEntry {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as AuthorOpeningEntry;
  if (typeof e.poemId !== "string" || !e.poemId) return false;
  const poem = works.find((p) => p.id === e.poemId);
  if (!poem) return false;
  const lines = sanitizeQuoteLineIndices(
    e.lineIndices,
    poem.content?.length ?? 0,
  );
  return Boolean(lines?.length);
}
