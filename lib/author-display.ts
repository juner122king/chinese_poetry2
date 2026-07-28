import type { Author } from "@/lib/types";

/** 占位简介：不在卡片 / 详情展示 */
export function isPlaceholderBio(bio: string): boolean {
  const s = bio.trim();
  return !s || s === "--" || s === "——" || s === "—";
}

/** 目录排序降权：无名氏、不详等 */
export function isDemotedAuthor(author: Author): boolean {
  return /^(无名氏|不详)$/.test(author.name.trim());
}
