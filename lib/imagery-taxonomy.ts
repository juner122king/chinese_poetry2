import type { PoemTag, PoemTheme } from "./types";

export type TagGroup =
  | "四季物候"
  | "天象时辰"
  | "山水地理"
  | "花木禽鱼"
  | "人事情感"
  | "行旅器物";

export type ImageryTagMeta = {
  id: PoemTag;
  label: string;
  group: TagGroup;
  defaultTheme: PoemTheme;
  weight: number;
  motifPool: string[];
  keywords: string[];
};

/** 古典诗词意境归集表 */
export const imageryTaxonomy: ImageryTagMeta[] = [
  {
    id: "spring",
    label: "春",
    group: "四季物候",
    defaultTheme: "spring",
    // 略降权：单字「芳/柳/燕」曾大量误标为春
    weight: 72,
    motifPool: ["春风", "春晓", "绿柳", "落花", "芳草", "啼莺"],
    keywords: ["春", "东风", "春风", "春色", "春晓", "花落", "芳草"],
  },
  {
    id: "summer",
    label: "夏",
    group: "四季物候",
    defaultTheme: "summer",
    weight: 75,
    motifPool: ["夏荷", "蝉鸣", "绿阴", "蒲风", "炎日", "流萤"],
    keywords: ["夏", "荷", "蝉", "炎", "榴", "萤"],
  },
  {
    id: "autumn",
    label: "秋",
    group: "四季物候",
    defaultTheme: "autumn",
    weight: 80,
    motifPool: ["秋色", "落木", "霜叶", "寒砧", "雁阵", "黄菊"],
    keywords: ["秋", "落木", "霜", "雁", "菊", "萧萧"],
  },
  {
    id: "winter",
    label: "冬",
    group: "四季物候",
    defaultTheme: "winter",
    weight: 76,
    motifPool: ["冬岭", "冰河", "寒梅", "岁暮", "朔风", "残雪"],
    keywords: ["冬", "冰", "岁暮", "朔", "残雪", "寒梅", "冰河", "凛"],
  },
  {
    id: "night",
    label: "夜",
    group: "天象时辰",
    defaultTheme: "night-moon",
    weight: 55,
    motifPool: ["夜色", "深夜", "子夜", "更残", "夜泊"],
    keywords: ["夜", "半夜", "深夜", "子夜", "宵"],
  },
  {
    id: "dawn-dusk",
    label: "晨昏",
    group: "天象时辰",
    defaultTheme: "dawn-dusk",
    weight: 70,
    motifPool: ["日暮", "斜阳", "拂晓", "黄昏", "白日", "残照"],
    keywords: ["日暮", "斜阳", "黄昏", "晓", "白日", "夕", "朝"],
  },
  {
    id: "moon",
    label: "月",
    group: "天象时辰",
    defaultTheme: "night-moon",
    weight: 85,
    motifPool: ["明月", "清影", "婵娟", "月下", "霜月", "圆缺"],
    keywords: ["月", "婵娟", "清影", "玉盘", "蟾"],
  },
  {
    id: "rain",
    label: "雨",
    group: "天象时辰",
    defaultTheme: "rain",
    weight: 84,
    motifPool: ["烟雨", "新雨", "风雨", "空蒙", "细雨", "夜雨"],
    keywords: ["雨", "空蒙", "沾衣", "霖", "烟雨", "细雨", "夜雨", "风雨", "新雨"],
  },
  {
    id: "snow",
    label: "雪",
    group: "天象时辰",
    defaultTheme: "snow-river",
    weight: 86,
    motifPool: ["飞雪", "寒雪", "千山雪", "雪夜", "素裹"],
    keywords: ["雪", "霰", "冰花", "飞雪", "寒雪", "雪夜"],
  },
  {
    id: "wind-cloud",
    label: "风云",
    group: "天象时辰",
    // 单字「风」过宽；抬权使云雾写景更易落入 landscape
    defaultTheme: "landscape",
    weight: 58,
    motifPool: ["长风", "白云", "彩云", "风起", "云海"],
    keywords: ["云", "雾", "岚", "长风", "风起", "云海", "白云", "风云"],
  },
  {
    id: "stars",
    label: "星",
    group: "天象时辰",
    defaultTheme: "night-moon",
    weight: 50,
    motifPool: ["星河", "繁星", "星如雨", "天街"],
    keywords: ["星", "银河", "牛女"],
  },
  {
    id: "mountain",
    label: "山",
    group: "山水地理",
    defaultTheme: "mountain",
    weight: 76,
    motifPool: ["空山", "远峰", "青山", "层峦", "庐山", "千山"],
    keywords: ["山", "峰", "岭", "岳", "岩", "空山", "远峰"],
  },
  {
    id: "river-lake",
    label: "江湖",
    group: "山水地理",
    defaultTheme: "river-lake",
    weight: 72,
    motifPool: ["长江", "寒江", "秋水", "湖光", "清流", "渡口"],
    keywords: ["江", "河", "湖", "溪", "浦", "津", "川"],
  },
  {
    id: "sea",
    label: "海",
    group: "山水地理",
    defaultTheme: "river-lake",
    weight: 60,
    motifPool: ["沧海", "海潮", "烟波", "海天"],
    keywords: ["海", "潮", "沧溟"],
  },
  {
    id: "frontier",
    label: "边塞",
    group: "山水地理",
    defaultTheme: "frontier",
    weight: 88,
    motifPool: ["关塞", "黄沙", "胡天", "孤城", "长河", "戍楼"],
    keywords: ["塞", "关", "胡", "羌", "戍", "漠", "黄沙", "单于"],
  },
  {
    id: "pastoral",
    label: "田园",
    group: "山水地理",
    defaultTheme: "pastoral",
    weight: 80,
    motifPool: ["稻香", "桑麻", "柴门", "野老", "蛙声", "茅檐"],
    keywords: ["稻", "桑", "麻", "田", "村", "蛙", "茅", "农"],
  },
  {
    id: "city-ruins",
    label: "城阙",
    group: "山水地理",
    defaultTheme: "parting",
    weight: 55,
    motifPool: ["古城", "废垒", "宫墙", "京华", "荒城"],
    keywords: ["城", "京", "阙", "宫", "巷"],
  },
  {
    id: "courtyard",
    label: "庭院",
    group: "山水地理",
    defaultTheme: "night-moon",
    weight: 45,
    motifPool: ["庭院", "阑干", "小窗", "深闺", "朱户"],
    keywords: ["庭", "院", "窗", "阑", "闺", "户"],
  },
  {
    id: "flowers",
    label: "花",
    group: "花木禽鱼",
    defaultTheme: "flowers",
    weight: 76,
    motifPool: ["落花", "红豆", "藕花", "桃花", "梅蕊", "菊花"],
    keywords: ["花", "桃", "梅", "菊", "莲", "荷", "红豆", "芳菲"],
  },
  {
    id: "trees-bamboo",
    label: "竹木",
    group: "花木禽鱼",
    defaultTheme: "trees-bamboo",
    weight: 70,
    motifPool: ["翠竹", "青松", "古柏", "疏桐", "柳丝", "枫叶"],
    keywords: ["竹", "松", "柏", "桐", "柳", "枫", "树", "林"],
  },
  {
    id: "birds",
    label: "鸟",
    group: "花木禽鱼",
    defaultTheme: "birds",
    weight: 74,
    motifPool: ["啼鸟", "黄鹂", "白鹭", "鸥鹭", "归雁", "乌啼"],
    keywords: ["鸟", "莺", "雁", "鸥", "鹭", "鹊", "鹂", "啼", "猿"],
  },
  {
    id: "fish-aquatic",
    label: "鱼",
    group: "花木禽鱼",
    defaultTheme: "fish-aquatic",
    weight: 68,
    motifPool: ["游鱼", "渔舟", "鱼龙", "萍藻", "垂钓", "鸥波"],
    keywords: ["鱼", "钓", "渔", "鳞", "鲤", "萍"],
  },
  {
    id: "insects",
    label: "虫",
    group: "花木禽鱼",
    defaultTheme: "summer",
    weight: 50,
    motifPool: ["蝉鸣", "蛙声", "萤火", "促织", "蝶舞"],
    keywords: ["蝉", "蛙", "萤", "蝶", "蛩", "虫"],
  },
  {
    id: "wine",
    label: "酒",
    group: "人事情感",
    defaultTheme: "wine",
    weight: 77,
    motifPool: ["把酒", "独酌", "浊酒", "醉眼", "酒杯", "对影"],
    keywords: ["酒", "醉", "酌", "杯", "觞", "樽"],
  },
  {
    id: "parting",
    label: "离别",
    group: "人事情感",
    defaultTheme: "parting",
    weight: 78,
    motifPool: ["长亭", "送别", "杨柳岸", "离殇", "挥手", "歧路"],
    keywords: ["别", "送", "离", "辞", "去"],
  },
  {
    id: "homesickness",
    label: "思乡",
    group: "人事情感",
    defaultTheme: "homesickness",
    weight: 79,
    motifPool: ["故乡", "乡愁", "客心", "归思", "故园", "万里"],
    keywords: ["故乡", "乡", "客", "归", "家书", "故园"],
  },
  {
    id: "love-longing",
    label: "相思",
    group: "人事情感",
    defaultTheme: "flowers",
    weight: 70,
    motifPool: ["相思", "红豆", "伊人", "情思"],
    keywords: ["相思", "思君", "伊人"],
  },
  {
    id: "war",
    label: "战乱",
    group: "人事情感",
    defaultTheme: "frontier",
    weight: 75,
    motifPool: ["烽火", "金戈", "铁马", "沙场", "干戈", "征人"],
    keywords: ["烽", "战", "兵", "征", "戈", "军", "骑"],
  },
  {
    id: "reclusion",
    label: "隐逸",
    group: "人事情感",
    defaultTheme: "reclusion",
    weight: 73,
    motifPool: ["幽居", "采菊", "空山", "松门", "归隐", "渔樵"],
    keywords: ["隐", "幽", "闲", "樵", "渔父", "山居"],
  },
  {
    id: "festival",
    label: "节庆",
    group: "人事情感",
    defaultTheme: "festival",
    weight: 80,
    motifPool: ["元夕", "花灯", "中秋", "上元", "社日", "阑珊"],
    // 忌单字「灯/节」：易与灯火、节气误叠把诗推成华灯
    keywords: ["元夕", "上元", "花灯", "中秋", "社日", "鱼龙", "元宵", "灯节"],
  },
  {
    id: "palace-court",
    label: "宫廷",
    group: "人事情感",
    defaultTheme: "festival",
    weight: 55,
    motifPool: ["金殿", "御沟", "宫柳", "朱阁", "玉阶"],
    keywords: ["宫", "殿", "御", "君", "帝", "阙"],
  },
  {
    id: "boat-travel",
    label: "行舟",
    group: "行旅器物",
    defaultTheme: "river-lake",
    weight: 65,
    motifPool: ["轻舟", "孤舟", "客船", "帆影", "渡头", "夜航"],
    keywords: ["舟", "船", "帆", "棹", "舸", "渡"],
  },
  {
    id: "temple-bell",
    label: "钟磬",
    group: "行旅器物",
    defaultTheme: "homesickness",
    weight: 60,
    motifPool: ["钟声", "古寺", "禅院", "暮鼓", "梵音"],
    keywords: ["钟", "寺", "僧", "禅", "磬", "刹"],
  },
  {
    id: "music",
    label: "丝竹",
    group: "行旅器物",
    defaultTheme: "wine",
    weight: 50,
    motifPool: ["琴音", "笛声", "凤箫", "琵琶", "歌吹"],
    keywords: ["琴", "笛", "箫", "琵琶", "歌", "曲"],
  },
  {
    id: "lamplight",
    label: "灯火",
    group: "行旅器物",
    // 孤灯/渔火偏夜色，非必华灯节庆
    defaultTheme: "night-moon",
    weight: 52,
    motifPool: ["灯火", "渔火", "烛影", "青灯", "阑珊"],
    keywords: ["灯火", "渔火", "青灯", "烛", "灯"],
  },
];

export const taxonomyById: Record<PoemTag, ImageryTagMeta> = Object.fromEntries(
  imageryTaxonomy.map((t) => [t.id, t]),
) as Record<PoemTag, ImageryTagMeta>;

export function getTagLabel(tag: PoemTag): string {
  return taxonomyById[tag]?.label ?? tag;
}

/** 单字「月」勿命中「三月/正月」等月份 */
function keywordHits(text: string, kw: string): boolean {
  if (kw.length >= 2) return text.includes(kw);
  if (kw === "月") {
    // 要求「月」且前一字不是数字/正/腊（月份），或已有多字月意象
    if (
      /明|月下|月夜|月光|月色|明月|山月|江月|霜月|晓月|夜月|对月|望月|秋月|花月/.test(
        text,
      )
    ) {
      return true;
    }
    return /(?<![正一二三四五六七八九十仲孟季腊闰])月/.test(text);
  }
  return text.includes(kw);
}

export type TagHit = { id: PoemTag; score: number };

/** 全文标签命中分（已 × weight，降序） */
export function inferTagHits(title: string, content: string[]): TagHit[] {
  const text = `${title}${content.join("")}`;
  const hits: TagHit[] = [];

  for (const meta of imageryTaxonomy) {
    let score = 0;
    for (const kw of meta.keywords) {
      if (keywordHits(text, kw)) score += kw.length >= 2 ? 2 : 1;
    }
    if (score > 0) hits.push({ id: meta.id, score: score * meta.weight });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits;
}

export function inferTagsSafe(title: string, content: string[]): PoemTag[] {
  return inferTagHits(title, content).slice(0, 6).map((h) => h.id);
}

/**
 * 按 tags 聚合主视觉（非「只取第一标签」）。
 * - 序位衰减：靠前的强命中仍主导
 * - 大气类（雨雪山水）轻抬、春花类轻压，缓解 spring 过载与 rain/landscape 召回不足
 */
const THEME_PICK_BOOST: Partial<Record<PoemTheme, number>> = {
  rain: 1.28,
  "snow-river": 1.24,
  winter: 1.14,
  landscape: 1.12,
  mountain: 1.12,
  frontier: 1.08,
  "river-lake": 1.06,
  reclusion: 1.04,
  spring: 0.78,
  flowers: 0.92,
  birds: 0.94,
};

const TAG_PICK_BOOST: Partial<Record<PoemTag, number>> = {
  rain: 1.18,
  snow: 1.16,
  "wind-cloud": 1.12,
  mountain: 1.06,
  spring: 0.88,
};

/** 由带分命中聚合主题（优先） */
export function pickThemeFromHits(hits: TagHit[]): PoemTheme {
  if (!hits.length) return "landscape";

  // 同 defaultTheme 多标签：取最高分 + 其余 30%，避免「节庆+灯火」叠爆盖过雨雪
  const perThemeParts = new Map<PoemTheme, number[]>();
  for (const h of hits) {
    const meta = taxonomyById[h.id];
    if (!meta) continue;
    const themeBoost = THEME_PICK_BOOST[meta.defaultTheme] ?? 1;
    const tagBoost = TAG_PICK_BOOST[h.id] ?? 1;
    const s = h.score * themeBoost * tagBoost;
    const list = perThemeParts.get(meta.defaultTheme) ?? [];
    list.push(s);
    perThemeParts.set(meta.defaultTheme, list);
  }

  let best: PoemTheme = "landscape";
  let bestScore = -1;
  for (const [theme, parts] of perThemeParts) {
    parts.sort((a, b) => b - a);
    const score =
      parts[0] + parts.slice(1).reduce((acc, v) => acc + v * 0.3, 0);
    if (score > bestScore) {
      bestScore = score;
      best = theme;
    }
  }
  return best;
}

/** 兼容：仅 tags 列表时用序位衰减近似强度 */
export function pickThemeFromTags(tags: PoemTag[]): PoemTheme {
  if (!tags.length) return "landscape";
  const hits: TagHit[] = tags.map((id, index) => {
    const meta = taxonomyById[id];
    const rankDecay = 1 / (1 + index * 0.38);
    return { id, score: (meta?.weight ?? 50) * rankDecay };
  });
  return pickThemeFromHits(hits);
}

/** 展开所有标签 motif 池（去重） */
export function motifPoolForTags(tags: PoemTag[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of tags) {
    const pool = taxonomyById[id]?.motifPool ?? [];
    for (const m of pool) {
      if (!seen.has(m)) {
        seen.add(m);
        out.push(m);
      }
    }
  }
  return out;
}
