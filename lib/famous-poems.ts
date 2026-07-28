import type { Poem } from "@/lib/types";

/**
 * 大众名篇信号：服务「名家代表作」选篇，与全站 featured 池（首页 24 席）解耦。
 * 诗题为简体；词用 `词牌|作者` 精确键。
 */

/** 诗：题名命中（越靠前越优先） */
export const FAMOUS_SHI_HINTS = [
  "静夜思",
  "将进酒",
  "登高",
  "春望",
  "望庐山瀑布",
  "早发白帝城",
  "黄鹤楼送孟浩然之广陵",
  "黄鹤楼",
  "枫桥夜泊",
  "登鹳雀楼",
  "春晓",
  "相思",
  "出塞",
  "凉州词",
  "送元二使安西",
  "渭城曲",
  "游子吟",
  "赋得古原草送别",
  "乐游原",
  "夜雨寄北",
  "锦瑟",
  "无题",
  "泊秦淮",
  "清明",
  "赤壁",
  "山行",
  "寄扬州韩绰判官",
  "过华清宫",
  "逢入京使",
  "白雪歌送武判官归京",
  "使至塞上",
  "九月九日忆山东兄弟",
  "回乡偶书",
  "登飞来峰",
  "示儿",
  "黄鹤楼",
  "次北固山下",
  "钱塘湖春行",
  "琵琶行",
  "长恨歌",
  "悯农",
  "咏鹅",
  "登幽州台歌",
  "滁州西涧",
  "题破山寺后禅院",
  "芙蓉楼送辛渐",
  "从军行",
  "闺怨",
  "送杜少府之任蜀州",
  "在狱咏蝉",
  "回乡偶书",
  "望月怀远",
  "春江花月夜",
] as const;

/**
 * 词：词牌 + 作者 精确优先。
 * 格式：`${rhythmic}|${author}`
 */
export const FAMOUS_CI_KEYS = [
  "水调歌头|苏轼",
  "念奴娇|苏轼",
  "江城子|苏轼",
  "定风波|苏轼",
  "声声慢|李清照",
  "如梦令|李清照",
  "一剪梅|李清照",
  "永遇乐|李清照",
  "雨霖铃|柳永",
  "满江红|岳飞",
  "青玉案|辛弃疾",
  "破阵子|辛弃疾",
  "永遇乐|辛弃疾",
  "念奴娇|辛弃疾",
  "虞美人|李煜",
  "相见欢|李煜",
  "蝶恋花|欧阳修",
  "蝶恋花|柳永",
  "鹊桥仙|秦观",
  "扬州慢|姜夔",
  "卜算子|陆游",
  "钗头凤|陆游",
  "醉花阴|李清照",
  "渔家傲|范仲淹",
  "苏幕遮|范仲淹",
  "浣溪沙|晏殊",
  "蝶恋花|晏殊",
  "踏莎行|欧阳修",
  "临江仙|晏几道",
  "鹤冲天|柳永",
  "定风波|辛弃疾",
  "丑奴儿|辛弃疾",
  "西江月|辛弃疾",
  "破阵子|李煜",
  "浪淘沙|李煜",
  "乌夜啼|李煜",
] as const;

/**
 * 名篇知名度分（0–约 120）。未命中返回 0。
 * 仅表示「大众熟悉度」，不替代首页 featured 配额逻辑。
 */
export function famousnessScore(poem: Poem): number {
  if (poem.form === "ci" || poem.rhythmic) {
    const key = `${poem.rhythmic ?? poem.title}|${poem.author}`;
    const idx = (FAMOUS_CI_KEYS as readonly string[]).indexOf(key);
    if (idx >= 0) return 120 - Math.min(idx, 40);
    // 词牌在表中、作者未精确命中：弱分
    if (
      (FAMOUS_CI_KEYS as readonly string[]).some((k) =>
        k.startsWith(`${poem.rhythmic}|`),
      )
    ) {
      return 12;
    }
  }

  const title = poem.title ?? "";
  for (let i = 0; i < FAMOUS_SHI_HINTS.length; i++) {
    const h = FAMOUS_SHI_HINTS[i];
    if (title === h) return 120 - Math.min(i, 40);
    if (title.includes(h) && title.length <= h.length + 8) {
      return 90 - Math.min(i, 40);
    }
  }
  return 0;
}

/**
 * 作者作品内「代表作」综合分：名篇信号为主，featured / 人工 enrich 为辅，篇幅仅打平。
 */
export function scoreAuthorRepresentative(poem: Poem): number {
  let score = famousnessScore(poem);
  if (poem.featured) score += 18;
  if (poem.motifsLocked) score += 4;
  if (poem.motifsSource === "llm") score += 1;

  const n = poem.content?.length ?? 0;
  // 弱篇幅信号：避免无任何名篇信号时完全乱序；不再压过名长篇
  if (n >= 2 && n <= 4) score += 2;
  else if (n >= 5 && n <= 8) score += 1;
  else if (n > 0 && n <= 24) score += 0.5;

  return score;
}

/** 按代表作分降序（稳定：同分保持原序） */
export function sortWorksByRepresentative(works: Poem[]): Poem[] {
  return works
    .map((poem, index) => ({ poem, index, score: scoreAuthorRepresentative(poem) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.poem);
}
