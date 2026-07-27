import type { Poem } from "@/lib/types";
import poemsJson from "./generated/poems.json";

export const poems: Poem[] = poemsJson as Poem[];

export function getPoemById(id: string): Poem | undefined {
  return poems.find((p) => p.id === id);
}

/**
 * 首页推荐：在 featured 池内按朝代交错（唐/宋/唐/宋…），
 * 避免前 N 首全是唐诗边塞、宋词挤在后面。
 */
export function getFeaturedPoems(limit = 6): Poem[] {
  const featured = poems.filter((p) => p.featured);
  const pool =
    featured.length > 0 ? featured : poems.filter((p) => !p.featured);

  if (pool.length <= limit) {
    if (featured.length >= limit) return featured.slice(0, limit);
    return [...featured, ...poems.filter((p) => !p.featured)].slice(0, limit);
  }

  const tang = pool.filter((p) => p.dynasty === "唐");
  const song = pool.filter((p) => p.dynasty === "宋");
  const other = pool.filter((p) => p.dynasty !== "唐" && p.dynasty !== "宋");

  /** 首页宋词脸优先级（未命中则靠后） */
  const songTitleRank = (title: string): number => {
    const order = [
      "水调歌头",
      "声声慢",
      "青玉案",
      "念奴娇",
      "雨霖铃",
      "满江红",
      "永遇乐",
      "定风波",
      "江城子",
      "如梦令",
      "一剪梅",
      "破阵子",
      "鹊桥仙",
      "扬州慢",
    ];
    const i = order.indexOf(title);
    return i >= 0 ? i : 100;
  };

  // 组内：锁定名篇 > 词牌优先级 > 原序
  const rank = (list: Poem[]) =>
    [...list].sort((a, b) => {
      const la = a.motifsLocked ? 1 : 0;
      const lb = b.motifsLocked ? 1 : 0;
      if (lb !== la) return lb - la;
      if (a.dynasty === "宋" || b.dynasty === "宋") {
        const ra = songTitleRank(a.title);
        const rb = songTitleRank(b.title);
        if (ra !== rb) return ra - rb;
      }
      return 0;
    });

  const queues = [rank(tang), rank(song), rank(other)].filter((q) => q.length);
  if (queues.length <= 1) {
    return rank(pool).slice(0, limit);
  }

  const cursors = queues.map(() => 0);
  const out: Poem[] = [];
  let guard = 0;
  while (out.length < limit && guard < limit * queues.length + 4) {
    guard += 1;
    let progressed = false;
    for (let q = 0; q < queues.length && out.length < limit; q++) {
      const list = queues[q];
      const i = cursors[q];
      if (i < list.length) {
        out.push(list[i]);
        cursors[q] = i + 1;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  if (out.length < limit) {
    const seen = new Set(out.map((p) => p.id));
    for (const p of pool) {
      if (out.length >= limit) break;
      if (!seen.has(p.id)) out.push(p);
    }
  }

  return out;
}

/** 每次请求随机一首 featured，避免主页长期固定同一首 */
export function getRandomFeaturedPoem(): Poem {
  const featured = poems.filter((p) => p.featured);
  const pool = featured.length > 0 ? featured : poems;
  if (pool.length === 0) {
    throw new Error("No poems available");
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getPoemsByAuthor(author: string): Poem[] {
  return poems.filter((p) => p.author === author);
}

export function getPoemsByTag(tag: string): Poem[] {
  return poems.filter((p) => p.tags.includes(tag as Poem["tags"][number]));
}

function adjacentInPool(
  pool: Poem[],
  id: string,
): { prev: Poem | null; next: Poem | null } | null {
  const index = pool.findIndex((p) => p.id === id);
  if (index < 0) return null;
  return {
    prev: index > 0 ? pool[index - 1]! : null,
    next: index < pool.length - 1 ? pool[index + 1]! : null,
  };
}

/**
 * 语义邻篇：同作者优先 → 同 theme → 全局序保底。
 * 池内保持 poems 原序；不环回。
 */
export function getAdjacentPoems(id: string): {
  prev: Poem | null;
  next: Poem | null;
} {
  const current = getPoemById(id);
  if (!current) return { prev: null, next: null };

  const byAuthor = poems.filter((p) => p.author === current.author);
  if (byAuthor.length > 1) {
    const hit = adjacentInPool(byAuthor, id);
    if (hit) return hit;
  }

  const byTheme = poems.filter((p) => p.theme === current.theme);
  if (byTheme.length > 1) {
    const hit = adjacentInPool(byTheme, id);
    if (hit) return hit;
  }

  return (
    adjacentInPool(poems, id) ?? {
      prev: null,
      next: null,
    }
  );
}

export type RelatedKind = "author" | "theme" | "rhythmic" | "tag" | "featured";

export type RelatedPoem = {
  poem: Poem;
  kind: RelatedKind;
};

function tagOverlap(a: Poem, b: Poem): number {
  const tagsA = new Set(a.tags ?? []);
  let n = 0;
  for (const t of b.tags ?? []) {
    if (tagsA.has(t)) n += 1;
  }
  return n;
}

/**
 * 详情页相关推荐：同作者 → 同词牌 → 同 theme → 标签近意 → featured 保底。
 * 每种 reason 最多 1 篇，避免多张卡同标「同境」。
 */
export function getRelatedPoems(id: string, limit = 3): RelatedPoem[] {
  const current = getPoemById(id);
  if (!current || limit <= 0) return [];

  const seen = new Set<string>([id]);
  const usedKinds = new Set<RelatedKind>();
  const out: RelatedPoem[] = [];

  const push = (poem: Poem | undefined, kind: RelatedKind) => {
    if (!poem || seen.has(poem.id) || out.length >= limit) return;
    if (usedKinds.has(kind)) return;
    seen.add(poem.id);
    usedKinds.add(kind);
    out.push({ poem, kind });
  };

  const byQuality = (a: Poem, b: Poem) => {
    const fa = (a.featured ? 2 : 0) + (a.motifsLocked ? 1 : 0);
    const fb = (b.featured ? 2 : 0) + (b.motifsLocked ? 1 : 0);
    return fb - fa;
  };

  // 1. 同作者
  const sameAuthor = poems
    .filter((p) => p.author === current.author && p.id !== id)
    .sort(byQuality);
  push(sameAuthor[0], "author");

  // 2. 同词牌（词）
  if (current.rhythmic && out.length < limit) {
    const sameRhythmic = poems
      .filter(
        (p) =>
          p.id !== id &&
          p.rhythmic === current.rhythmic &&
          !seen.has(p.id),
      )
      .sort(byQuality);
    push(sameRhythmic[0], "rhythmic");
  }

  // 3. 同 theme：只取 1 篇
  if (out.length < limit) {
    const sameTheme = poems
      .filter(
        (p) => p.id !== id && p.theme === current.theme && !seen.has(p.id),
      )
      .sort(byQuality);
    push(sameTheme[0], "theme");
  }

  // 4. 近意：标签交集最高，且非同 theme（避免再标同境）
  if (out.length < limit) {
    const nearTag = poems
      .filter(
        (p) =>
          p.id !== id &&
          !seen.has(p.id) &&
          p.theme !== current.theme &&
          tagOverlap(current, p) > 0,
      )
      .sort((a, b) => {
        const d = tagOverlap(current, b) - tagOverlap(current, a);
        if (d !== 0) return d;
        return byQuality(a, b);
      });
    push(nearTag[0], "tag");
  }

  // 5. featured 保底（kind 仅用一次）
  if (out.length < limit) {
    const featured = poems
      .filter((p) => p.featured && !seen.has(p.id))
      .sort(byQuality);
    push(featured[0], "featured");
  }

  // 6. 全局序保底：只补篇数（UI 不展示 kind）
  if (out.length < limit) {
    for (const p of poems) {
      if (out.length >= limit) break;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push({ poem: p, kind: "featured" });
    }
  }

  return out;
}

/** 按标签统计本站频次（意境图鉴 / 首页入口） */
export function countPoemsByTag(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const poem of poems) {
    for (const tag of poem.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/** 按主题统计 */
export function countPoemsByTheme(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const poem of poems) {
    counts.set(poem.theme, (counts.get(poem.theme) ?? 0) + 1);
  }
  return counts;
}
