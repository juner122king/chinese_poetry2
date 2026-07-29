/** 主视觉主题（单选，驱动背景 UI） */
export type PoemTheme =
  | "night-moon"
  | "dawn-dusk"
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "snow-river"
  | "rain"
  | "mountain"
  | "river-lake"
  | "pastoral"
  | "frontier"
  | "flowers"
  | "birds"
  | "fish-aquatic"
  | "trees-bamboo"
  | "wine"
  | "festival"
  | "homesickness"
  | "parting"
  | "reclusion"
  | "landscape";

/** 意境归集标签（多选） */
export type PoemTag =
  // 四季
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  // 天象时辰
  | "night"
  | "dawn-dusk"
  | "moon"
  | "rain"
  | "snow"
  | "wind-cloud"
  | "stars"
  // 山水地理
  | "mountain"
  | "river-lake"
  | "sea"
  | "frontier"
  | "pastoral"
  | "city-ruins"
  | "courtyard"
  // 花木禽鱼
  | "flowers"
  | "trees-bamboo"
  | "birds"
  | "fish-aquatic"
  | "insects"
  // 人事情感
  | "wine"
  | "parting"
  | "homesickness"
  | "love-longing"
  | "war"
  | "reclusion"
  | "festival"
  | "palace-court"
  // 行旅器物
  | "boat-travel"
  | "temple-bell"
  | "music"
  | "lamplight";

export type MotifsSource = "manual" | "llm" | "rule";

/** 数据来源文集 */
export type PoemSource = "tang300" | "ci300";

export type PoemForm = "shi" | "ci";

export type Poem = {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  /** 主背景视觉 */
  theme: PoemTheme;
  /** 意境归集（可多选） */
  tags: PoemTag[];
  /** 3 个意象关联词 */
  motifs: string[];
  motifsSource?: MotifsSource;
  motifsLocked?: boolean;
  featured?: boolean;
  /** 诗 / 词 */
  form?: PoemForm;
  /** 词牌（词） */
  rhythmic?: string;
  /** 源文集 */
  source?: PoemSource;
  /** 源库 uuid（若有） */
  sourceId?: string;
  /**
   * 开卷/卡片摘句：content 行下标（0-based），可连续段落或跳取。
   * 由离线 LLM / 人工写入；运行时优先，展示时 pause 粘合为空格。
   * 亦可落在 data/generated/opening-quotes.json，见 getOpeningQuoteIndices。
   */
  openingQuoteLines?: number[];
};

export type Author = {
  name: string;
  slug: string;
  dynasty: string;
  bio: string;
  poemIds: string[];
  /** 生卒年展示串，如 `701—762`、`约 1155—约 1221`；缺省则详情不展示 */
  years?: string;
};

export function formatMotifs(motifs: string[]): string {
  return motifs.filter(Boolean).join(" · ");
}
