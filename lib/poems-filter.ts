import { taxonomyById } from "@/lib/imagery-taxonomy";
import { themeMap } from "@/lib/theme-map";
import type { Poem, PoemTag, PoemTheme } from "@/lib/types";

export const POEMS_PAGE_SIZE = 36;

export type PoemListFilters = {
  dynasty?: string;
  tag?: PoemTag;
  theme?: PoemTheme;
  q?: string;
  page: number;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isPoemTag(value: string): value is PoemTag {
  return value in taxonomyById;
}

function isPoemTheme(value: string): value is PoemTheme {
  return value in themeMap;
}

/** 从 page searchParams 解析筛选（非法值忽略） */
export function parsePoemListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PoemListFilters {
  const dynastyRaw = firstParam(searchParams.dynasty)?.trim();
  const tagRaw = firstParam(searchParams.tag)?.trim();
  const themeRaw = firstParam(searchParams.theme)?.trim();
  const qRaw = firstParam(searchParams.q)?.trim();
  const pageRaw = firstParam(searchParams.page);

  const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : 1;

  return {
    dynasty: dynastyRaw || undefined,
    tag: tagRaw && isPoemTag(tagRaw) ? tagRaw : undefined,
    theme: themeRaw && isPoemTheme(themeRaw) ? themeRaw : undefined,
    q: qRaw || undefined,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
  };
}

export function hasActivePoemFilters(filters: PoemListFilters): boolean {
  return Boolean(filters.dynasty || filters.tag || filters.theme || filters.q);
}

/** 构建 /poems 查询串；改筛选时默认回到第 1 页 */
export function buildPoemsHref(
  filters: Omit<PoemListFilters, "page"> & { page?: number },
): string {
  const params = new URLSearchParams();
  if (filters.dynasty) params.set("dynasty", filters.dynasty);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.theme) params.set("theme", filters.theme);
  if (filters.q) params.set("q", filters.q);
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }
  const qs = params.toString();
  return qs ? `/poems?${qs}` : "/poems";
}

export function filterPoems(
  all: Poem[],
  filters: PoemListFilters,
): Poem[] {
  const q = filters.q?.toLowerCase();

  return all.filter((poem) => {
    if (filters.dynasty && poem.dynasty !== filters.dynasty) return false;
    if (filters.tag && !poem.tags?.includes(filters.tag)) return false;
    if (filters.theme && poem.theme !== filters.theme) return false;
    if (q) {
      const hay = `${poem.title}${poem.author}${poem.content.join("")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function paginatePoems<T>(
  items: T[],
  page: number,
  pageSize = POEMS_PAGE_SIZE,
): { pageItems: T[]; totalPages: number; page: number; total: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    totalPages,
    page: safePage,
    total,
  };
}

/** 出现频次最高的标签（工具条 chips） */
export function topTagsFromPoems(all: Poem[], limit = 12): PoemTag[] {
  const counts = new Map<PoemTag, number>();
  for (const poem of all) {
    for (const tag of poem.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

/** 出现频次最高的主题 */
export function topThemesFromPoems(all: Poem[], limit = 10): PoemTheme[] {
  const counts = new Map<PoemTheme, number>();
  for (const poem of all) {
    counts.set(poem.theme, (counts.get(poem.theme) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export function dynastiesFromPoems(all: Poem[]): string[] {
  return Array.from(new Set(all.map((p) => p.dynasty)));
}
