/**
 * 人工代表作 + 摘句种子 → data/generated/author-openings.json
 * （API 不可用时兜底；不覆盖 source=llm，除非 --force）
 *
 *   npx tsx scripts/seed-opening-quotes-manual.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AuthorOpeningEntry,
  AuthorOpeningsMap,
} from "../lib/author-openings";
import { sortWorksByRepresentative } from "../lib/famous-poems";
import type { Author, Poem } from "../lib/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const poems = JSON.parse(
  readFileSync(join(ROOT, "data/generated/poems.json"), "utf-8"),
) as Poem[];
const authors = JSON.parse(
  readFileSync(join(ROOT, "data/generated/authors.json"), "utf-8"),
) as Author[];
const outPath = join(ROOT, "data/generated/author-openings.json");
const legacyQuotesPath = join(
  ROOT,
  "data/generated/opening-quotes.json",
);

/** 作者名 → 优先诗题（或词牌） */
const AUTHOR_POEM: Record<string, string> = {
  李白: "静夜思",
  杜甫: "春望",
  王维: "相思",
  苏轼: "水调歌头",
  李清照: "声声慢",
  辛弃疾: "青玉案",
  柳永: "雨霖铃",
  杜牧: "泊秦淮",
  李商隐: "乐游原",
  孟浩然: "春晓",
  白居易: "赋得古原草送别",
  岑参: "逢入京使",
  姜夔: "扬州慢",
  欧阳修: "蝶恋花",
  晏殊: "浣溪沙",
  晏几道: "临江仙",
  范仲淹: "苏幕遮",
  陆游: "卜算子",
  岳飞: "满江红",
  王之涣: "登鹳雀楼",
  张继: "枫桥夜泊",
  孟郊: "游子吟",
  崔颢: "黄鹤楼",
  张九龄: "望月怀远",
  王勃: "杜少府之任蜀州",
  王湾: "次北固山下",
  王昌龄: "出塞",
  秦观: "浣溪沙", // 本站未收《鹊桥仙》
  李煜: "虞美人",
};

/** poemId 或 title|author → 行下标 */
const LINE_BY_KEY: Record<string, number[]> = {
  "静夜思|李白": [2, 3],
  "将进酒|李白": [4, 5],
  "春望|杜甫": [0, 1],
  "登高|杜甫": [2, 3],
  "相思|王维": [2, 3],
  "春晓|孟浩然": [0, 1],
  "水调歌头|苏轼": [17, 18],
  "定风波|苏轼": [0, 1],
  "声声慢|李清照": [0, 2],
  "雨霖铃|柳永": [14, 16],
  "泊秦淮|杜牧": [2, 3],
  "乐游原|李商隐": [2, 3],
  "夜雨寄北|李商隐": [2, 3],
  "锦瑟|李商隐": [6, 7],
  "登鹳雀楼|王之涣": [2, 3],
  "枫桥夜泊|张继": [2, 3],
  "赋得古原草送别|白居易": [2, 3],
  "游子吟|孟郊": [4, 5],
  "逢入京使|岑参": [2, 3],
  "黄鹤楼|崔颢": [6, 7],
  "望月怀远|张九龄": [0, 1],
  "次北固山下|王湾": [4, 5],
  "杜少府之任蜀州|王勃": [6, 7],
  "扬州慢|姜夔": [17, 19],
  "青玉案|辛弃疾": [9, 12],
  "卜算子|陆游": [6, 7],
  "满江红|岳飞": [0, 1],
  "蝶恋花|欧阳修": [8, 9],
  "浣溪沙|晏殊": [4, 5],
  "临江仙|晏几道": [8, 9],
  "苏幕遮|范仲淹": [12, 13],
  jing_ye_si: [2, 3],
  "jing-ye-si": [2, 3],
  "shui-diao-ge-tou-su-shi": [17, 18],
  "sheng-sheng-man-li-qing-zhao": [0, 2],
  "yu-lin-ling-liu-yong": [14, 16],
  "qing-yu-an-xin-qi-ji": [9, 12],
  "yang-zhou-man-jiang-kui": [17, 19],
  "bo-qin-huai": [2, 3],
  "le-you-yuan": [2, 3],
  "fu-de-gu-yuan-cao-song-bie": [2, 3],
  "you-zi-yin": [4, 5],
  "deng-guan-que-lou": [2, 3],
  "man-jiang-hong-yue-fei": [0, 1],
  "bu-suan-zi-lu-you": [6, 7],
};

const force = process.argv.includes("--force");
const byId = new Map(poems.map((p) => [p.id, p]));

function findPoemForAuthor(
  author: Author,
  hint?: string,
): Poem | undefined {
  const works = author.poemIds
    .map((id) => byId.get(id))
    .filter((p): p is Poem => Boolean(p));
  if (!works.length) return undefined;

  if (hint) {
    const hit =
      works.find((p) => p.title === hint) ||
      works.find((p) => p.rhythmic === hint) ||
      works.find(
        (p) => p.title.includes(hint) && p.title.length <= hint.length + 8,
      );
    if (hit) return hit;
  }
  return sortWorksByRepresentative(works)[0];
}

function lineIndicesFor(poem: Poem): number[] {
  const key = `${poem.title}|${poem.author}`;
  const fromTable =
    LINE_BY_KEY[poem.id] ?? LINE_BY_KEY[key];
  if (fromTable?.length) {
    return fromTable.filter(
      (i) => i >= 0 && i < (poem.content?.length ?? 0),
    ).slice(0, 2);
  }
  const n = poem.content?.length ?? 0;
  if (n <= 0) return [];
  if (n === 1) return [0];
  return [0, 1];
}

let existing: AuthorOpeningsMap = {};
try {
  existing = JSON.parse(readFileSync(outPath, "utf-8")) as AuthorOpeningsMap;
} catch {
  existing = {};
}

// 兼容旧 opening-quotes.json（按 poemId）
let legacyQuotes: Record<string, { lineIndices?: number[] }> = {};
try {
  legacyQuotes = JSON.parse(
    readFileSync(legacyQuotesPath, "utf-8"),
  ) as typeof legacyQuotes;
} catch {
  legacyQuotes = {};
}

const out: AuthorOpeningsMap = { ...existing };
let hit = 0;
let skip = 0;
let miss = 0;

for (const author of authors) {
  const works = author.poemIds
    .map((id) => byId.get(id))
    .filter((p): p is Poem => Boolean(p));
  if (!works.length) continue;

  const prev = out[author.slug];
  if (prev?.source === "llm" && !force) {
    skip += 1;
    continue;
  }

  const hint = AUTHOR_POEM[author.name];
  // 仅当有人工 hint 或已有名篇分时写入；无 hint 的作者留给 LLM
  if (!hint && !prev) {
    miss += 1;
    continue;
  }

  const poem = findPoemForAuthor(author, hint);
  if (!poem) {
    miss += 1;
    continue;
  }

  let lineIndices = lineIndicesFor(poem);
  if (legacyQuotes[poem.id]?.lineIndices?.length) {
    lineIndices = legacyQuotes[poem.id].lineIndices!.filter(
      (i) => i >= 0 && i < (poem.content?.length ?? 0),
    ).slice(0, 2);
  }
  if (!lineIndices.length) {
    miss += 1;
    continue;
  }

  // 无 AUTHOR_POEM hint 时不覆盖已有 manual（仅迁移）
  if (!hint && prev?.poemId) {
    skip += 1;
    continue;
  }

  const entry: AuthorOpeningEntry = {
    poemId: poem.id,
    lineIndices,
    source: "manual",
  };
  out[author.slug] = entry;
  hit += 1;
  const shown = lineIndices
    .map((i) => (poem.content[i] ?? "").replace(/[，。、；！？]$/u, ""))
    .join(" / ");
  console.log(
    `${author.name} → ${poem.title}${poem.rhythmic ? `/${poem.rhythmic}` : ""} · ${shown}`,
  );
}

writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf-8");
console.log(
  `\nmanual ${hit}, keep-llm ${skip}, left-for-llm ${miss} → ${outPath}`,
);
