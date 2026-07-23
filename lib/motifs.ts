import type { Poem } from "./types";
import { formatMotifs } from "./types";

/** 统一读取展示文案（兼容仅有 motifs 的数据） */
export function getBackgroundLabel(poem: Poem): string {
  if (poem.motifs?.length) return formatMotifs(poem.motifs);
  return "";
}
