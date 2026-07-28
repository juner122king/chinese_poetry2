import type { Author, Poem } from "@/lib/types";
import {
  linesFromOpeningResolution,
  resolveAuthorRepresentativePoem,
} from "@/lib/author-openings";

/** 占位简介：不在卡片 / 详情展示 */
export function isPlaceholderBio(bio: string): boolean {
  const s = bio.trim();
  return !s || s === "--" || s === "——" || s === "—";
}

/**
 * 卡片 bio：去掉开头西历生卒括号（与 years 行重复），压缩空白。
 */
export function formatCardBio(bio: string): string {
  let s = bio.trim();
  // (1082－1135) / （约 1155－约 1221） 等
  s = s.replace(
    /^[（(]\s*约?\s*\d{3,4}\s*[–—－\-至~～]\s*约?\s*\d{3,4}\s*[)）]\s*/u,
    "",
  );
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** 从简介解析「字」：字太白 → 太白 */
export function extractCourtesyName(bio: string): string | undefined {
  if (!bio) return undefined;
  const m = bio.match(/字\s*([^\s，,。；;（()）]{1,4})/u);
  const name = m?.[1]?.trim();
  return name || undefined;
}

/** 从简介解析「号」：号东坡居士 → 东坡居士 */
export function extractArtName(bio: string): string | undefined {
  if (!bio) return undefined;
  const m = bio.match(/号\s*([^\s，,。；;（()）]{1,8})/u);
  const name = m?.[1]?.trim();
  return name || undefined;
}

/**
 * 人名展示：二字加全角空距，三字及以上略收字距，强化卷首仪式感。
 * 例：李白 → 李　白
 */
export function formatScrollName(name: string): string {
  const chars = [...name.trim()];
  if (chars.length <= 1) return name.trim();
  if (chars.length === 2) return `${chars[0]}\u3000${chars[1]}`;
  return chars.join("\u2009");
}

/** 生卒年展示：统一破折号两侧空格 */
export function formatYearsDisplay(years: string): string {
  return years.replace(/\s*[—–－\-]\s*/g, " — ");
}

export type AuthorOpening = {
  poem: Poem;
  /** 诗题（展示用原文，调用方再做繁简） */
  title: string;
  /** 开卷摘句（已去句末标点） */
  lines: string[];
};

/**
 * 开卷代表作：优先离线 LLM/人工（author-openings.json）；
 * 否则名篇打分回退；摘句同行下标，否则前两句。
 */
export function getAuthorOpening(
  works: Poem[],
  author?: Pick<Author, "slug">,
): AuthorOpening | null {
  if (works.length === 0) return null;

  const resolved = resolveAuthorRepresentativePoem(works, author?.slug);
  if (!resolved) return null;

  const lines = linesFromOpeningResolution(
    resolved.poem,
    resolved.lineIndices,
  );
  if (lines.length === 0) return null;

  return { poem: resolved.poem, title: resolved.poem.title, lines };
}

/** 目录排序降权：无名氏、不详等 */
export function isDemotedAuthor(author: Author): boolean {
  return /^(无名氏|不详)$/.test(author.name.trim());
}
