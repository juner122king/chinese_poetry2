import type { PoemTheme } from "./types";

export type ParticleMode =
  | "stars"
  | "petals"
  | "leaves"
  | "snow"
  | "firefly"
  | "none";

export type MistLevel = false | "soft" | "heavy";

export type ThemeVisual = {
  label: string;
  gradient: string;
  accent: string;
  glow: string;
  moon?: boolean;
  sun?: boolean;
  snow?: boolean;
  /** 雾强度；false 关闭，避免主题同质化 */
  mist?: MistLevel;
  rain?: boolean;
  mountains?: "none" | "soft" | "strong";
  horizon?: boolean;
  fields?: boolean;
  bamboo?: boolean;
  petals?: boolean;
  ripples?: boolean;
  lanterns?: boolean;
  birds?: boolean;
  particles?: ParticleMode;
  /** 粒子是否避让正文中心（详情页） */
  particleSafeCenter?: boolean;
};

/**
 * 每主题一个主签名，减少叠层与撞车。
 */
export const themeMap: Record<PoemTheme, ThemeVisual> = {
  "night-moon": {
    label: "夜月",
    gradient:
      "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(180,190,220,0.18) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 30% 80%, rgba(52,73,94,0.35) 0%, transparent 50%), linear-gradient(180deg, #050508 0%, #0d1118 45%, #0D0D0D 100%)",
    accent: "#c8d0e0",
    glow: "rgba(220,230,255,0.25)",
    moon: true,
    mist: "soft",
    mountains: "soft",
    particles: "stars",
    particleSafeCenter: true,
  },
  "dawn-dusk": {
    label: "晨昏",
    gradient:
      "radial-gradient(ellipse 90% 50% at 50% 78%, rgba(180,90,50,0.22) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 70% 30%, rgba(120,60,100,0.15) 0%, transparent 50%), linear-gradient(180deg, #120810 0%, #1a1014 40%, #0D0D0D 100%)",
    accent: "#e0b898",
    glow: "rgba(200,120,70,0.22)",
    sun: true,
    mist: "soft",
    mountains: "soft",
    particles: "none",
  },
  spring: {
    label: "春",
    gradient:
      "radial-gradient(ellipse 60% 50% at 40% 60%, rgba(80,110,70,0.22) 0%, transparent 50%), linear-gradient(180deg, #0c100e 0%, #121610 50%, #0D0D0D 100%)",
    accent: "#c8d4b8",
    glow: "rgba(160,180,120,0.16)",
    mist: "soft",
    mountains: "soft",
    petals: false,
    particles: "petals",
    particleSafeCenter: true,
  },
  summer: {
    label: "夏",
    gradient:
      "radial-gradient(ellipse 50% 40% at 75% 20%, rgba(200,160,60,0.12) 0%, transparent 45%), radial-gradient(ellipse 70% 50% at 30% 70%, rgba(40,90,50,0.2) 0%, transparent 50%), linear-gradient(180deg, #0a120c 0%, #101810 50%, #0D0D0D 100%)",
    accent: "#b8d0a0",
    glow: "rgba(180,160,80,0.15)",
    sun: true,
    mist: false,
    mountains: "soft",
    particles: "firefly",
    particleSafeCenter: true,
  },
  autumn: {
    label: "秋",
    gradient:
      "radial-gradient(ellipse 70% 50% at 60% 40%, rgba(120,70,40,0.2) 0%, transparent 55%), linear-gradient(180deg, #100c08 0%, #16120e 50%, #0D0D0D 100%)",
    accent: "#d4b898",
    glow: "rgba(180,120,60,0.18)",
    mist: "soft",
    mountains: "soft",
    particles: "leaves",
    particleSafeCenter: true,
  },
  winter: {
    label: "冬",
    gradient:
      "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(180,200,220,0.1) 0%, transparent 50%), linear-gradient(180deg, #0a0e12 0%, #101418 45%, #0D0D0D 100%)",
    accent: "#c0ccd8",
    glow: "rgba(160,180,200,0.15)",
    mist: "soft",
    mountains: "strong",
    snow: false,
    particles: "snow",
    particleSafeCenter: true,
  },
  "snow-river": {
    label: "寒江",
    gradient:
      "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(200,220,240,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a1018 0%, #121820 40%, #0D0D0D 100%)",
    accent: "#b8c8d8",
    glow: "rgba(180,200,220,0.2)",
    snow: false,
    mist: "soft",
    mountains: "strong",
    horizon: true,
    particles: "snow",
    particleSafeCenter: true,
  },
  rain: {
    label: "烟雨",
    // 空蒙：青灰湿气，雨丝极淡，雾为主
    gradient:
      "radial-gradient(ellipse 90% 55% at 50% 15%, rgba(100,120,145,0.14) 0%, transparent 55%), radial-gradient(ellipse 70% 45% at 40% 75%, rgba(60,75,90,0.18) 0%, transparent 50%), linear-gradient(180deg, #0a0e12 0%, #0e1318 50%, #0D0D0D 100%)",
    accent: "#a8b8c8",
    glow: "rgba(100,120,140,0.16)",
    mist: "heavy",
    rain: true,
    mountains: "soft",
    particles: "none",
  },
  mountain: {
    label: "山岳",
    gradient:
      "radial-gradient(ellipse 90% 40% at 50% 85%, rgba(40,50,60,0.55) 0%, transparent 45%), linear-gradient(180deg, #080a0e 0%, #0e1218 40%, #0D0D0D 100%)",
    accent: "#a8b4c0",
    glow: "rgba(80,100,120,0.2)",
    mist: false,
    mountains: "strong",
    particles: "none",
  },
  "river-lake": {
    label: "江湖",
    gradient:
      "radial-gradient(ellipse 100% 40% at 50% 85%, rgba(40,70,90,0.3) 0%, transparent 45%), linear-gradient(180deg, #080c10 0%, #0c1218 50%, #0D0D0D 100%)",
    accent: "#a0b8c8",
    glow: "rgba(70,110,140,0.18)",
    mist: "soft",
    mountains: "soft",
    horizon: true,
    ripples: true,
    particles: "none",
  },
  pastoral: {
    label: "田园",
    gradient:
      "radial-gradient(ellipse 70% 40% at 50% 75%, rgba(70,100,50,0.18) 0%, transparent 50%), linear-gradient(180deg, #0c100c 0%, #121610 50%, #0D0D0D 100%)",
    accent: "#c4d0b0",
    glow: "rgba(140,160,90,0.14)",
    mist: "soft",
    fields: true,
    mountains: "soft",
    particles: "firefly",
    particleSafeCenter: true,
  },
  frontier: {
    label: "边塞",
    gradient:
      "radial-gradient(ellipse 80% 40% at 50% 70%, rgba(140,100,50,0.18) 0%, transparent 50%), linear-gradient(180deg, #120e08 0%, #16120c 45%, #0D0D0D 100%)",
    accent: "#d0b890",
    glow: "rgba(160,120,60,0.16)",
    mist: false,
    mountains: "strong",
    horizon: true,
    particles: "none",
  },
  flowers: {
    label: "花意",
    gradient:
      "radial-gradient(ellipse 50% 50% at 40% 40%, rgba(160,70,90,0.14) 0%, transparent 50%), linear-gradient(180deg, #10080c 0%, #140e10 50%, #0D0D0D 100%)",
    accent: "#e0b8c0",
    glow: "rgba(180,90,110,0.16)",
    mist: "soft",
    petals: true,
    particles: "none",
  },
  birds: {
    label: "禽鸟",
    gradient:
      "radial-gradient(ellipse 90% 55% at 50% 12%, rgba(160,185,210,0.16) 0%, transparent 55%), linear-gradient(180deg, #0c1218 0%, #0e1416 42%, #0D0D0D 100%)",
    accent: "#c8d6e0",
    glow: "rgba(150,175,200,0.12)",
    mist: "soft",
    mountains: "soft",
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
    horizon: true,
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
    moon: true,
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
    gradient:
      "radial-gradient(ellipse 50% 40% at 78% 18%, rgba(160,170,200,0.12) 0%, transparent 50%), linear-gradient(180deg, #08090e 0%, #0e1016 50%, #0D0D0D 100%)",
    accent: "#c0c8d8",
    glow: "rgba(140,160,190,0.16)",
    moon: true,
    mist: "soft",
    mountains: "soft",
    particles: "stars",
    particleSafeCenter: true,
  },
  parting: {
    label: "离别",
    gradient:
      "radial-gradient(ellipse 80% 40% at 50% 70%, rgba(100,80,70,0.18) 0%, transparent 50%), linear-gradient(180deg, #100c0c 0%, #141010 50%, #0D0D0D 100%)",
    accent: "#d0b8a8",
    glow: "rgba(140,100,80,0.16)",
    mist: "soft",
    mountains: "soft",
    horizon: true,
    particles: "none",
  },
  reclusion: {
    label: "隐逸",
    gradient:
      "radial-gradient(ellipse 60% 50% at 40% 50%, rgba(50,70,55,0.15) 0%, transparent 50%), linear-gradient(180deg, #090c0a 0%, #0e1210 50%, #0D0D0D 100%)",
    accent: "#b0c0b0",
    glow: "rgba(80,100,85,0.12)",
    mist: "soft",
    mountains: "soft",
    bamboo: true,
    particles: "none",
  },
  landscape: {
    label: "山水",
    gradient:
      "radial-gradient(ellipse 100% 50% at 50% 90%, rgba(45,55,65,0.45) 0%, transparent 40%), linear-gradient(180deg, #090b0f 0%, #0f1318 45%, #0D0D0D 100%)",
    accent: "#b0bcc8",
    glow: "rgba(90,110,130,0.18)",
    mist: "soft",
    mountains: "soft",
    particles: "none",
  },
};

export function getThemeVisual(theme: PoemTheme): ThemeVisual {
  return themeMap[theme] ?? themeMap.landscape;
}
