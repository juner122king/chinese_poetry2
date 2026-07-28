import type { Author } from "@/lib/types";

/**
 * 生卒年：override 优先；否则从简介解析西历区间。
 * 展示串如 `701—762`、`约1155—约1221`。
 */
const YEAR_OVERRIDES: Record<string, string> = {
  // 唐
  李白: "701—762",
  杜甫: "712—770",
  王维: "701—761",
  李商隐: "约813—约858",
  孟浩然: "689—740",
  韦应物: "约737—约792",
  刘长卿: "约726—约786",
  杜牧: "803—852",
  王昌龄: "约698—约756",
  李颀: "约690—约751",
  岑参: "约715—770",
  白居易: "772—846",
  崔颢: "约704—754",
  卢纶: "约739—约799",
  柳宗元: "773—819",
  张祜: "约785—约849",
  张九龄: "678—740",
  韩愈: "768—824",
  李益: "约748—约829",
  刘禹锡: "772—842",
  孟郊: "751—814",
  钱起: "约710—约782",
  温庭筠: "约812—约866",
  元稹: "779—831",
  韩翃: "约720—约788",
  沈佺期: "约656—约715",
  司空曙: "约720—约790",
  宋之问: "约656—约712",
  王之涣: "688—742",
  高适: "约704—765",
  刘方平: "约742—约785",
  马戴: "约799—约869",
  王建: "约767—约830",
  王涯: "约764—835",
  许浑: "约791—约858",
  元结: "719—772",
  祖咏: "约699—约746",
  常建: "约708—约765",
  陈子昂: "661—702",
  陈陶: "约812—约885",
  戴叔伦: "732—789",
  杜审言: "约645—708",
  杜荀鹤: "846—904",
  顾况: "约727—约815",
  韩偓: "约842—约923",
  皇甫冉: "约717—约770",
  贾岛: "779—843",
  李端: "约743—约782",
  李频: "约818—876",
  刘眘虚: "约714—约767",
  // 宋（补源数据未解析到的）
  柳永: "约984—约1053",
  史达祖: "约1163—约1220",
  蒋捷: "约1245—约1305",
  陈克: "1081—1137",
  李之仪: "约1048—约1127",
  张元干: "1091—约1161",
  周紫芝: "1082—1155",
  蔡襄: "1012—1067",
  卢祖皋: "约1174—1224",
};

function isValidYears(s: string): boolean {
  if (!s || s.includes("?")) return false;
  return /\d{3,4}/.test(s);
}

/** 从简介等文本解析西历生卒 */
export function parseYearsFromText(text: string): string | undefined {
  if (!text) return undefined;
  const re =
    /\(?\s*(约\s*)?(\d{3,4})\s*[–—－\-至~～]\s*(约\s*)?(\d{3,4})\s*\)?/;
  const m = text.match(re);
  if (!m) return undefined;
  const start = `${m[1] ? "约" : ""}${m[2]}`;
  const end = `${m[3] ? "约" : ""}${m[4]}`;
  const years = `${start}—${end}`;
  return isValidYears(years) ? years : undefined;
}

export function resolveAuthorYears(
  name: string,
  bio?: string,
  extraText?: string,
): string | undefined {
  const fromOverride = YEAR_OVERRIDES[name];
  if (fromOverride && isValidYears(fromOverride)) return fromOverride;

  const fromExtra = extraText ? parseYearsFromText(extraText) : undefined;
  if (fromExtra) return fromExtra;

  const fromBio = bio ? parseYearsFromText(bio) : undefined;
  if (fromBio) return fromBio;

  return undefined;
}

export function authorYears(author: Author): string | undefined {
  if (author.years && isValidYears(author.years)) return author.years;
  return resolveAuthorYears(author.name, author.bio);
}
