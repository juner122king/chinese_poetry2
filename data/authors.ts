import type { Author, Poem, PoemTag } from "@/lib/types";
import authorsJson from "./generated/authors.json";
import { getPoemById } from "./poems";

export const authors: Author[] = authorsJson as Author[];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function getAuthorByName(name: string): Author | undefined {
  return authors.find((a) => a.name === name);
}

export function getFeaturedAuthors(limit = 6): Author[] {
  return [...authors]
    .sort((a, b) => b.poemIds.length - a.poemIds.length)
    .slice(0, limit);
}

/** 作者本站作品 */
export function getAuthorWorks(author: Author): Poem[] {
  return author.poemIds
    .map((id) => getPoemById(id))
    .filter((p): p is Poem => Boolean(p));
}

/** 作品意境标签频次（降序） */
export function getAuthorTagStats(
  works: Poem[],
  limit = 6,
): { tag: PoemTag; count: number }[] {
  const counts = new Map<PoemTag, number>();
  for (const poem of works) {
    for (const tag of poem.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

/** 同朝代相关诗人（按本站作品数） */
export function getRelatedAuthors(
  author: Author,
  limit = 4,
): Author[] {
  return authors
    .filter(
      (a) =>
        a.slug !== author.slug &&
        a.dynasty === author.dynasty &&
        a.poemIds.length > 0,
    )
    .sort((a, b) => b.poemIds.length - a.poemIds.length)
    .slice(0, limit);
}
