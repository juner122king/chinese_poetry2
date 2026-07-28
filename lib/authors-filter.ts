import { isDemotedAuthor } from "@/lib/author-display";
import type { Author } from "@/lib/types";

export type AuthorListFilters = {
  dynasty?: string;
  q?: string;
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

  return {
    dynasty:
      dynastyRaw && knownDynasties.includes(dynastyRaw)
        ? dynastyRaw
        : undefined,
    q: qRaw || undefined,
  };
}

export function hasActiveAuthorFilters(filters: AuthorListFilters): boolean {
  return Boolean(filters.dynasty || filters.q);
}

/** 构建 /authors 查询串 */
export function buildAuthorsHref(filters: AuthorListFilters): string {
  const params = new URLSearchParams();
  if (filters.dynasty) params.set("dynasty", filters.dynasty);
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  return qs ? `/authors?${qs}` : "/authors";
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
