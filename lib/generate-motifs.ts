import type { Poem, PoemTag, PoemTheme } from "./types";
import {
  imageryTaxonomy,
  inferTagsSafe,
  motifPoolForTags,
  pickThemeFromTags,
} from "./imagery-taxonomy";

/**
 * 规则生成：正文匹配 → tags → theme / motifs。
 * 量产高质量请用离线 LLM 批处理。
 */

const EXTRA_LEXICON = [
  "香炉峰",
  "西岭雪",
  "黄沙道",
  "鹳雀楼",
  "寒山寺",
  "千秋雪",
  "枫桥",
  "渔火",
  "钟声",
  "瀑布",
  "紫烟",
  "轻舟",
  "烽火",
  "家书",
  "翠柳",
  "黄鹂",
  "白鹭",
  "青天",
  "琼楼",
  "玉宇",
  "婵娟",
  "阑珊",
  "稻香",
  "蛙声",
  "空山",
  "新雨",
  "松月",
  "清泉",
  "红豆",
  "南国",
  "溪亭",
  "藕花",
  "鸥鹭",
  "孤舟",
  "寒江",
  "蓑笠",
  "春晓",
  "啼鸟",
  "白日",
  "黄河",
  "长江",
  "庐山",
  "西湖",
  "中秋",
  "元夕",
  "花灯",
  "独酌",
  "花间",
  "月下",
  "故乡",
  "庭院",
  "夜空",
  "明月",
];

const MOTIF_LEXICON = [
  ...EXTRA_LEXICON,
  ...imageryTaxonomy.flatMap((t) => t.motifPool),
].sort((a, b) => b.length - a.length);

function extractFromText(text: string, limit: number): string[] {
  const found: string[] = [];
  const used = new Set<string>();
  const covered = new Array(text.length).fill(false);

  for (const word of MOTIF_LEXICON) {
    if (found.length >= limit) break;
    let from = 0;
    while (from < text.length) {
      const idx = text.indexOf(word, from);
      if (idx < 0) break;
      const end = idx + word.length;
      let overlap = false;
      for (let i = idx; i < end; i++) {
        if (covered[i]) {
          overlap = true;
          break;
        }
      }
      if (!overlap && !used.has(word)) {
        found.push(word);
        used.add(word);
        for (let i = idx; i < end; i++) covered[i] = true;
        break;
      }
      from = idx + 1;
    }
  }
  return found;
}

function titleHints(title: string): string[] {
  const parts = title.split(/[·•]/);
  const core = (parts[parts.length - 1] || title).trim();
  if (core.length >= 2 && core.length <= 4) return [core];
  return extractFromText(core, 2);
}

export function inferThemeFromText(
  title: string,
  content: string[],
): PoemTheme {
  const tags = inferTagsSafe(title, content);
  return pickThemeFromTags(tags);
}

export function generateTagsRule(
  title: string,
  content: string[],
): PoemTag[] {
  return inferTagsSafe(title, content);
}

export function generateMotifsRule(
  input: Pick<Poem, "title" | "content"> & {
    theme?: PoemTheme;
    tags?: PoemTag[];
  },
  count = 3,
): string[] {
  const text = `${input.title}${input.content.join("")}`;
  const tags =
    input.tags?.length ? input.tags : generateTagsRule(input.title, input.content);
  const theme = input.theme ?? pickThemeFromTags(tags);
  const result: string[] = [];
  const seen = new Set<string>();

  const push = (w: string) => {
    const word = w.trim();
    if (!word || seen.has(word) || result.length >= count) return;
    if (word.length < 2 && result.length < count - 1) return;
    seen.add(word);
    result.push(word);
  };

  for (const w of extractFromText(text, count + 3)) push(w);
  for (const w of titleHints(input.title)) push(w);
  for (const w of motifPoolForTags(tags)) push(w);

  // theme-linked pool via tags that map to this theme
  const themeTags = imageryTaxonomy
    .filter((t) => t.defaultTheme === theme)
    .flatMap((t) => t.motifPool);
  for (const w of themeTags) push(w);

  if (result.length < count) {
    const body = input.content.join("");
    for (let i = 0; i < body.length - 1 && result.length < count; i++) {
      const bigram = body.slice(i, i + 2);
      if (/^[\u4e00-\u9fff]{2}$/.test(bigram)) push(bigram);
    }
  }

  return result.slice(0, count);
}

export function generateMotifsForPoem(
  poem: Pick<
    Poem,
    "title" | "content" | "theme" | "tags" | "motifs" | "motifsLocked"
  >,
  options?: { force?: boolean },
): string[] {
  if (poem.motifsLocked && poem.motifs?.length >= 3 && !options?.force) {
    return poem.motifs;
  }
  if (poem.motifs?.length >= 3 && !options?.force) {
    return poem.motifs;
  }
  return generateMotifsRule(poem);
}
