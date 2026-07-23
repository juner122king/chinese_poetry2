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
};

export type Author = {
  name: string;
  slug: string;
  dynasty: string;
  bio: string;
  poemIds: string[];
};

export function formatMotifs(motifs: string[]): string {
  return motifs.filter(Boolean).join(" · ");
}
