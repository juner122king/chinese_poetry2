import type { PoemTheme } from "./types";

export type ParticleMode =
  | "stars"
  | "stars-frontier"
  | "petals"
  | "leaves"
  | "snow"
  | "firefly"
  | "none";

export type MistLevel = false | "soft" | "heavy";

/** 云：关 | 高云一抹 | 中带 | 云海（厚、偏下与山接） */
export type CloudForm = false | "high" | "band" | "sea";

/**
 * 地平/水际：关 | 边塞尘岚 | 水际微光 | 寒江淡雾
 * （不再用白亮细条）
 */
export type HorizonForm = false | "plain" | "water" | "frost";

/**
 * 月：关 | 夜月满轮 | 暖月 | 远月 | 田园月华 | 山月 | 江月 | 残月
 */
export type MoonForm =
  | false
  | "default"
  | "warm"
  | "far"
  | "pastoral"
  | "mountain"
  | "river"
  | "crescent";

/**
 * 日：关 | 晨昏低日 | 夏日高悬 | 薄日（淡、远）
 */
export type SunForm = false | "low" | "high" | "pale";

/** 山体造型 */
export type MountainForm =
  | "none"
  | "distant"
  | "rolling"
  | "peaks"
  | "jagged"
  | "range";

export type ThemeVisual = {
  label: string;
  gradient: string;
  accent: string;
  glow: string;
  /** 月形态；false/省略 = 无 */
  moon?: MoonForm;
  /** 日形态；false/省略 = 无 */
  sun?: SunForm;
  /** 静态底雪层（与 snow 粒子可叠） */
  snow?: boolean;
  /** 雾强度；false 关闭，避免主题同质化 */
  mist?: MistLevel;
  /** 独立云层；多数主题关闭以免同质 */
  clouds?: CloudForm;
  rain?: boolean;
  mountains?: MountainForm;
  /** 地平/水际形态；false/省略 = 无 */
  horizon?: HorizonForm;
  fields?: boolean;
  bamboo?: boolean;
  petals?: boolean;
  ripples?: boolean;
  lanterns?: boolean;
  birds?: boolean;
  /** 极淡一叶舟影（江湖） */
  boat?: boolean;
  particles?: ParticleMode;
  /** 粒子是否避让正文中心（详情页） */
  particleSafeCenter?: boolean;
  /** 粒子数量倍率（默认 1；思乡稀星等） */
  particleDensity?: number;
};

/**
 * 每主题一个主签名，减少叠层与撞车。
 */
export const themeMap: Record<PoemTheme, ThemeVisual> = {
  "night-moon": {
    label: "夜月",
    // 满夜：远山 + 高云 + 繁星，与思乡「空」对照
    gradient:
      "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(180,190,220,0.2) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 30% 80%, rgba(52,73,94,0.38) 0%, transparent 50%), linear-gradient(180deg, #050508 0%, #0d1118 45%, #0D0D0D 100%)",
    accent: "#c8d0e0",
    glow: "rgba(220,230,255,0.28)",
    moon: "default",
    mist: "soft",
    clouds: "high",
    mountains: "distant",
    particles: "stars",
    particleSafeCenter: true,
    particleDensity: 1.15,
  },
  "dawn-dusk": {
    label: "晨昏",
    // 低日沉霞，紫褐天光
    gradient:
      "radial-gradient(ellipse 95% 48% at 22% 78%, rgba(200,100,50,0.28) 0%, transparent 52%), radial-gradient(ellipse 60% 40% at 70% 30%, rgba(120,60,100,0.18) 0%, transparent 50%), linear-gradient(180deg, #120810 0%, #1a1014 40%, #0D0D0D 100%)",
    accent: "#e0b898",
    glow: "rgba(200,120,70,0.24)",
    sun: "low",
    mist: "soft",
    clouds: "band",
    mountains: "peaks",
    particles: "none",
  },
  spring: {
    label: "春",
    // 薄霞嫩绿 + 远黛，与秋「暖岭落叶」结构分离
    gradient:
      "radial-gradient(ellipse 70% 45% at 30% 25%, rgba(200,160,170,0.1) 0%, transparent 50%), radial-gradient(ellipse 65% 50% at 55% 70%, rgba(90,130,85,0.2) 0%, transparent 52%), linear-gradient(180deg, #0b100e 0%, #101612 48%, #0D0D0D 100%)",
    accent: "#c8d4b8",
    glow: "rgba(170,200,150,0.14)",
    mist: "soft",
    clouds: "high",
    mountains: "distant",
    petals: true,
    particles: "petals",
    particleSafeCenter: true,
  },
  summer: {
    label: "夏",
    // 高日烈金 + 弱远山 + 流萤
    gradient:
      "radial-gradient(ellipse 55% 42% at 78% 14%, rgba(220,180,70,0.18) 0%, transparent 48%), radial-gradient(ellipse 70% 50% at 30% 70%, rgba(40,90,50,0.18) 0%, transparent 50%), linear-gradient(180deg, #0a120c 0%, #101810 50%, #0D0D0D 100%)",
    accent: "#b8d0a0",
    glow: "rgba(200,170,80,0.16)",
    sun: "high",
    mist: false,
    mountains: "distant",
    particles: "firefly",
    particleSafeCenter: true,
  },
  autumn: {
    label: "秋",
    // 暖岭连绵 + 脚尘，与春远黛对照
    gradient:
      "radial-gradient(ellipse 75% 45% at 60% 38%, rgba(140,80,40,0.22) 0%, transparent 55%), radial-gradient(ellipse 90% 35% at 50% 88%, rgba(80,50,30,0.2) 0%, transparent 48%), linear-gradient(180deg, #100c08 0%, #16120e 50%, #0D0D0D 100%)",
    accent: "#d4b898",
    glow: "rgba(180,120,60,0.18)",
    mist: "soft",
    mountains: "range",
    horizon: "plain",
    particles: "leaves",
    particleSafeCenter: true,
  },
  winter: {
    label: "冬",
    gradient:
      "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(180,200,220,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a0e12 0%, #101418 45%, #0D0D0D 100%)",
    accent: "#c0ccd8",
    glow: "rgba(160,180,200,0.15)",
    mist: "soft",
    mountains: "jagged",
    snow: true,
    particles: "snow",
    particleSafeCenter: true,
    particleDensity: 0.85,
  },
  "snow-river": {
    label: "寒江",
    gradient:
      "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(200,220,240,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a1018 0%, #121820 40%, #0D0D0D 100%)",
    accent: "#b8c8d8",
    glow: "rgba(180,200,220,0.2)",
    snow: true,
    mist: "soft",
    moon: "river",
    mountains: "jagged",
    horizon: "frost",
    boat: true,
    particles: "snow",
    particleSafeCenter: true,
    particleDensity: 0.7,
  },
  rain: {
    label: "烟雨",
    // 空蒙：青灰湿气，雨丝极淡，雾为主
    gradient:
      "radial-gradient(ellipse 90% 55% at 50% 15%, rgba(100,120,145,0.14) 0%, transparent 55%), radial-gradient(ellipse 70% 45% at 40% 75%, rgba(60,75,90,0.18) 0%, transparent 50%), linear-gradient(180deg, #0a0e12 0%, #0e1318 50%, #0D0D0D 100%)",
    accent: "#a8b8c8",
    glow: "rgba(100,120,140,0.16)",
    mist: "heavy",
    clouds: "band",
    rain: true,
    mountains: "range",
    particles: "none",
  },
  mountain: {
    label: "山岳",
    // 空蒙远黛：天际冷灰、山脚沉墨，配合 ink 层峦而非硬剪影
    gradient:
      "radial-gradient(ellipse 70% 35% at 50% 18%, rgba(70,90,120,0.1) 0%, transparent 55%), radial-gradient(ellipse 95% 42% at 50% 88%, rgba(30,40,52,0.5) 0%, transparent 48%), linear-gradient(180deg, #07090d 0%, #0c1016 42%, #0D0D0D 100%)",
    accent: "#a8b4c0",
    glow: "rgba(90,110,135,0.16)",
    mist: "soft",
    clouds: "high",
    moon: "mountain",
    mountains: "peaks",
    particles: "none",
  },
  "river-lake": {
    label: "江湖",
    gradient:
      "radial-gradient(ellipse 100% 40% at 50% 85%, rgba(40,70,90,0.3) 0%, transparent 45%), linear-gradient(180deg, #080c10 0%, #0c1218 50%, #0D0D0D 100%)",
    accent: "#a0b8c8",
    glow: "rgba(70,110,140,0.18)",
    mist: "soft",
    moon: "river",
    mountains: "range",
    horizon: "water",
    ripples: true,
    boat: true,
    particles: "none",
  },
  pastoral: {
    label: "田园",
    // 夜田园：月华 + 田埂 + 流萤（西江月等）
    gradient:
      "radial-gradient(ellipse 55% 45% at 72% 18%, rgba(190,205,230,0.2) 0%, transparent 55%), radial-gradient(ellipse 40% 35% at 68% 22%, rgba(220,230,245,0.1) 0%, transparent 50%), radial-gradient(ellipse 70% 40% at 50% 78%, rgba(70,100,50,0.2) 0%, transparent 50%), linear-gradient(180deg, #0a0e12 0%, #0e1410 48%, #0D0D0D 100%)",
    accent: "#c4d0b0",
    glow: "rgba(180,200,230,0.2)",
    moon: "pastoral",
    mist: "soft",
    fields: true,
    mountains: "rolling",
    particles: "firefly",
    particleSafeCenter: true,
  },
  frontier: {
    label: "边塞",
    // 关外平沙 + 塞外夜空：少量高亮主星、更少散星
    gradient:
      "radial-gradient(ellipse 90% 38% at 50% 72%, rgba(140,100,50,0.16) 0%, transparent 52%), radial-gradient(ellipse 50% 30% at 78% 18%, rgba(180,170,140,0.06) 0%, transparent 50%), linear-gradient(180deg, #100c08 0%, #14100c 48%, #0D0D0D 100%)",
    accent: "#d0b890",
    glow: "rgba(160,120,60,0.16)",
    moon: "mountain",
    mist: "soft",
    mountains: "jagged",
    horizon: "plain",
    particles: "stars-frontier",
    particleSafeCenter: true,
  },
  flowers: {
    label: "花意",
    // 与春共用瓣语：静态瓣光 + 更稀花瓣粒子（无山，签名在花）
    gradient:
      "radial-gradient(ellipse 55% 50% at 38% 38%, rgba(180,80,100,0.16) 0%, transparent 52%), linear-gradient(180deg, #10080c 0%, #140e10 50%, #0D0D0D 100%)",
    accent: "#e0b8c0",
    glow: "rgba(180,90,110,0.16)",
    mist: "soft",
    petals: true,
    particles: "petals",
    particleSafeCenter: true,
    particleDensity: 0.4,
  },
  birds: {
    label: "禽鸟",
    gradient:
      "radial-gradient(ellipse 90% 55% at 50% 12%, rgba(160,185,210,0.16) 0%, transparent 55%), linear-gradient(180deg, #0c1218 0%, #0e1416 42%, #0D0D0D 100%)",
    accent: "#c8d6e0",
    glow: "rgba(150,175,200,0.12)",
    mist: "soft",
    mountains: "distant",
    birds: true,
    particles: "none",
  },
  "fish-aquatic": {
    label: "鱼藻",
    gradient:
      "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(30,80,90,0.32) 0%, transparent 50%), linear-gradient(180deg, #060e10 0%, #0a1416 50%, #0D0D0D 100%)",
    accent: "#98c0c0",
    glow: "rgba(50,120,130,0.2)",
    mist: "soft",
    mountains: "none",
    horizon: "water",
    ripples: true,
    particles: "none",
  },
  "trees-bamboo": {
    label: "竹木",
    gradient:
      "radial-gradient(ellipse 40% 70% at 20% 50%, rgba(40,70,45,0.25) 0%, transparent 50%), linear-gradient(180deg, #080e0a 0%, #0e1410 50%, #0D0D0D 100%)",
    accent: "#a8c4a8",
    glow: "rgba(60,100,70,0.15)",
    mist: "soft",
    bamboo: true,
    mountains: "none",
    particles: "none",
  },
  wine: {
    label: "对酒",
    gradient:
      "radial-gradient(ellipse 55% 55% at 50% 48%, rgba(178,58,72,0.16) 0%, transparent 55%), linear-gradient(180deg, #100808 0%, #140e0e 50%, #0D0D0D 100%)",
    accent: "#d4a0a8",
    glow: "rgba(200,120,120,0.22)",
    moon: "warm",
    mist: "soft",
    mountains: "none",
    particles: "none",
  },
  festival: {
    label: "华灯",
    gradient:
      "radial-gradient(ellipse 40% 40% at 50% 60%, rgba(178,58,72,0.15) 0%, transparent 50%), radial-gradient(ellipse 30% 30% at 70% 40%, rgba(200,160,80,0.1) 0%, transparent 50%), linear-gradient(180deg, #08060a 0%, #100c10 50%, #0D0D0D 100%)",
    accent: "#e0c0a0",
    glow: "rgba(200,140,80,0.22)",
    mist: false,
    lanterns: true,
    particles: "none",
  },
  homesickness: {
    label: "思乡",
    // 空阔：无山、稀星、远月 — 与夜月「满」对照
    gradient:
      "radial-gradient(ellipse 45% 35% at 78% 16%, rgba(160,170,200,0.1) 0%, transparent 52%), linear-gradient(180deg, #07080c 0%, #0c0e14 52%, #0D0D0D 100%)",
    accent: "#c0c8d8",
    glow: "rgba(140,160,190,0.14)",
    moon: "far",
    mist: "soft",
    clouds: "high",
    mountains: "none",
    particles: "stars",
    particleSafeCenter: true,
    particleDensity: 0.45,
  },
  parting: {
    label: "离别",
    // 空驿：残月为主，山极淡，中景留白
    gradient:
      "radial-gradient(ellipse 70% 35% at 50% 78%, rgba(90,70,60,0.12) 0%, transparent 50%), linear-gradient(180deg, #0e0a0a 0%, #121010 52%, #0D0D0D 100%)",
    accent: "#d0b8a8",
    glow: "rgba(140,100,80,0.14)",
    mist: "soft",
    clouds: "high",
    moon: "crescent",
    mountains: "distant",
    horizon: "plain",
    particles: "none",
  },
  reclusion: {
    label: "隐逸",
    gradient:
      "radial-gradient(ellipse 60% 50% at 40% 50%, rgba(50,70,55,0.15) 0%, transparent 50%), linear-gradient(180deg, #090c0a 0%, #0e1210 50%, #0D0D0D 100%)",
    accent: "#b0c0b0",
    glow: "rgba(80,100,85,0.12)",
    mist: "soft",
    clouds: "band",
    mountains: "range",
    bamboo: true,
    particles: "none",
  },
  landscape: {
    label: "山水",
    // 风云 tag 默认入此主题：云海 + 轻岚
    gradient:
      "radial-gradient(ellipse 100% 50% at 50% 90%, rgba(45,55,65,0.45) 0%, transparent 40%), linear-gradient(180deg, #090b0f 0%, #0f1318 45%, #0D0D0D 100%)",
    accent: "#b0bcc8",
    glow: "rgba(90,110,130,0.18)",
    mist: "soft",
    clouds: "sea",
    mountains: "distant",
    particles: "none",
  },
};

export function getThemeVisual(theme: PoemTheme): ThemeVisual {
  return themeMap[theme] ?? themeMap.landscape;
}
