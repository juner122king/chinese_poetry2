/** 句读驱动的展示行：数据保留标点，UI 用节奏而非字形表达结构 */

export type LineBreak = "pause" | "stop" | "none";

export type DisplayLine = {
  /** 无行末标点，供展示 */
  text: string;
  /** 由源行末标点推断 */
  break: LineBreak;
  raw: string;
};

const PAUSE_END = /[，、；]$/u;
const STOP_END = /[。！？]$/u;
const TRAILING_PUNCT = /[，。！？；、]+$/u;

export function toDisplayLines(content: string[]): DisplayLine[] {
  return content.map((raw) => {
    let breakType: LineBreak = "none";
    if (STOP_END.test(raw)) breakType = "stop";
    else if (PAUSE_END.test(raw)) breakType = "pause";
    const text = raw.replace(TRAILING_PUNCT, "").trim();
    return { text, break: breakType, raw };
  });
}

/**
 * 摘句粘合为视觉行（卡片 / 作者开卷）：
 * - 行末 pause（，、；）且下一选中行为 content 连续下标 → 空格拼接、不换行
 * - stop / none / 下标跳跃 → 结束当前视觉行
 * - 不改动 content 原文，仅展示层
 */
export function visualLinesFromIndices(
  content: string[],
  indices: number[],
  maxVisualLines = Infinity,
): string[] {
  if (!content.length || !indices.length || maxVisualLines <= 0) return [];
  const display = toDisplayLines(content);
  const parts: { text: string; break: LineBreak; index: number }[] = [];
  const seen = new Set<number>();
  for (const i of indices) {
    if (!Number.isInteger(i) || i < 0 || i >= display.length) continue;
    if (seen.has(i)) continue;
    const d = display[i];
    if (!d?.text) continue;
    seen.add(i);
    parts.push({ text: d.text, break: d.break, index: i });
  }

  const visual: string[] = [];
  let k = 0;
  while (k < parts.length && visual.length < maxVisualLines) {
    let text = parts[k].text;
    let lastIdx = parts[k].index;
    let br = parts[k].break;
    k += 1;
    while (
      k < parts.length &&
      br === "pause" &&
      parts[k].index === lastIdx + 1
    ) {
      text = `${text} ${parts[k].text}`;
      lastIdx = parts[k].index;
      br = parts[k].break;
      k += 1;
    }
    visual.push(text);
  }
  return visual;
}

/** 无摘句表时：从文首按粘合规则取最多 maxVisual 视觉行 */
export function fallbackVisualExcerpt(
  content: string[],
  maxVisualLines = 2,
): string[] {
  if (!content.length) return [];
  const indices = content.map((_, i) => i);
  return visualLinesFromIndices(content, indices, maxVisualLines);
}

/**
 * 在种子下标基础上前后延伸，直到粘合后满 maxVisual 视觉行（或正文用尽）。
 * 优先向后补，再向前补；末下标仍为 pause 时继续向后补到句读完整。
 */
export function expandIndicesToVisualLines(
  content: string[],
  seedIndices: number[],
  maxVisualLines = 2,
): number[] {
  const n = content.length;
  if (n === 0 || maxVisualLines <= 0) return [];

  const set = new Set<number>();
  for (const i of seedIndices) {
    if (Number.isInteger(i) && i >= 0 && i < n) set.add(i);
  }
  if (set.size === 0) {
    return Array.from({ length: n }, (_, i) => i);
  }

  const display = toDisplayLines(content);
  const sorted = () => [...set].sort((a, b) => a - b);
  const visualCount = () =>
    visualLinesFromIndices(content, sorted(), maxVisualLines).length;
  /** 最后一行仍以 pause 收尾且后面还有正文 → 半截联，需继续向后 */
  const trailingPauseOpen = () => {
    const idx = sorted();
    const hi = idx[idx.length - 1];
    return display[hi]?.break === "pause" && hi + 1 < n;
  };

  let guard = 0;
  while (set.size < n && guard < n + 2) {
    guard += 1;
    const needMoreLines = visualCount() < maxVisualLines;
    const needClosePause = trailingPauseOpen();
    if (!needMoreLines && !needClosePause) break;

    const idx = sorted();
    const hi = idx[idx.length - 1];
    const lo = idx[0];

    // 半截 pause 或仍缺行时优先向后
    if ((needClosePause || needMoreLines) && hi + 1 < n) {
      set.add(hi + 1);
      continue;
    }
    if (needMoreLines && lo > 0) {
      set.add(lo - 1);
      continue;
    }
    break;
  }

  return sorted();
}

/** 横排：该行下方外边距（末行由调用方置 0） */
export function lineSpacingClass(
  breakType: LineBreak,
  isLast: boolean,
): string {
  if (isLast) return "mb-0";
  switch (breakType) {
    case "pause":
      return "mb-3 md:mb-4";
    case "stop":
      return "mb-8 md:mb-10";
    default:
      return "mb-5 md:mb-7";
  }
}

/**
 * 竖排列间距 class（配合 .poem-v-lines 的 row-reverse：
 * 下一列在视觉左侧，用 margin-inline-end 在逻辑上与「列后」一致）。
 */
export function verticalLineGapClass(
  breakType: LineBreak,
  isLast: boolean,
): string {
  if (isLast) return "poem-v-line poem-v-line-last";
  switch (breakType) {
    case "pause":
      return "poem-v-line poem-v-line-pause";
    case "stop":
      return "poem-v-line poem-v-line-stop";
    default:
      return "poem-v-line poem-v-line-none";
  }
}
