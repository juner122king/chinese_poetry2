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
