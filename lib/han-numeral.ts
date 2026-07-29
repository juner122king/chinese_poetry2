const HAN_DIGITS = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const HAN_UNITS = ["", "十", "百", "千"];

/**
 * 阿拉伯数字 → 汉数字（数量读法：二十一 / 一百零五 / 一千零五十）。
 *
 * 只用于版心页码与卷内总量 —— 那是刻本语调。工具条的筛选结果数保持阿拉伯
 * 数字：用户要扫的数据不该变难读，两种语调的分工也因此明确。
 *
 * 覆盖 0–9999（站内页数与篇数都远在此内）；超范围或非整数回退阿拉伯字符串，
 * 宁可读作数字也不要读作错的汉字。
 */
export function toHanNumeral(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 9999) return String(n);
  if (n === 0) return HAN_DIGITS[0];

  const digits = String(n).split("").map(Number);
  const len = digits.length;
  let out = "";
  // 中间的零并作一个「零」：一千零五，而非一千零零五
  let pendingZero = false;

  for (let i = 0; i < len; i++) {
    const digit = digits[i];
    const unit = HAN_UNITS[len - 1 - i];

    if (digit === 0) {
      pendingZero = true;
      continue;
    }
    if (pendingZero && out) out += HAN_DIGITS[0];
    pendingZero = false;

    // 「十一」不作「一十一」；但有更高位时保留（一百一十）
    out += digit === 1 && unit === "十" && i === 0 ? unit : HAN_DIGITS[digit] + unit;
  }

  return out;
}
