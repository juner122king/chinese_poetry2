import type { Author } from "@/lib/types";

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

/** 目录排序降权：无名氏、不详等 */
export function isDemotedAuthor(author: Author): boolean {
  return /^(无名氏|不详)$/.test(author.name.trim());
}
