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
