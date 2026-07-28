import { isDemotedAuthor } from "@/lib/author-display";
import type { Author } from "@/lib/types";

export const AUTHORS_PAGE_SIZE = 36;

export type AuthorListFilters = {
  dynasty?: string;
  q?: string;
  page: number;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** 从 page searchParams 解析筛选（非法值忽略） */
export function parseAuthorListFilters(
  searchParams: Record<string, string | string[] | undefined>,
  knownDynasties: string[],
): AuthorListFilters {
  const dynastyRaw = firstParam(searchParams.dynasty)?.trim();
  const qRaw = firstParam(searchParams.q)?.trim();
  const pageRaw = firstParam(searchParams.page);
  const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : 1;

  return {
    dynasty:
      dynastyRaw && knownDynasties.includes(dynastyRaw)
        ? dynastyRaw
        : undefined,
    q: qRaw || undefined,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
  };
}

export function hasActiveAuthorFilters(filters: AuthorListFilters): boolean {
  return Boolean(filters.dynasty || filters.q);
}

/** 构建 /authors 查询串；改筛选时默认回到第 1 页 */
export function buildAuthorsHref(
  filters: Omit<AuthorListFilters, "page"> & { page?: number },
): string {
  const params = new URLSearchParams();
  if (filters.dynasty) params.set("dynasty", filters.dynasty);
  if (filters.q) params.set("q", filters.q);
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }
  const qs = params.toString();
  return qs ? `/authors?${qs}` : "/authors";
}

export function paginateAuthors<T>(
  items: T[],
  page: number,
  pageSize = AUTHORS_PAGE_SIZE,
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

/**
 * 按朝代顺序拼平列表，保证分页切片与页面「按朝分组」视觉顺序一致。
 */
export function orderAuthorsByDynasty(
  list: Author[],
  dynastyOrder: string[],
): Author[] {
  return dynastyOrder.flatMap((d) => list.filter((a) => a.dynasty === d));
}

/** 组内：正常名家在前，无名氏/不详靠后；同档按作品数降序 */
export function sortAuthorsForDisplay(list: Author[]): Author[] {
  return [...list].sort((a, b) => {
    const demoteA = isDemotedAuthor(a) ? 1 : 0;
    const demoteB = isDemotedAuthor(b) ? 1 : 0;
    if (demoteA !== demoteB) return demoteA - demoteB;
    return b.poemIds.length - a.poemIds.length;
  });
}

export function filterAuthors(
  all: Author[],
  filters: AuthorListFilters,
): Author[] {
  const q = filters.q?.toLowerCase();

  const filtered = all.filter((author) => {
    if (filters.dynasty && author.dynasty !== filters.dynasty) return false;
    if (q) {
      const hay = `${author.name}${author.slug}${author.bio}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return sortAuthorsForDisplay(filtered);
}

export function dynastiesFromAuthors(all: Author[]): string[] {
  return Array.from(new Set(all.map((a) => a.dynasty)));
}
