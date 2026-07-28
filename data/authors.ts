import { isDemotedAuthor } from "@/lib/author-display";
import { orderWorksWithRepresentative } from "@/lib/author-openings";
import type { Author, Poem, PoemTag } from "@/lib/types";
import authorsJson from "./generated/authors.json";
import { getPoemById } from "./poems";

export const authors: Author[] = authorsJson as Author[];

const authorsBySlug = new Map(authors.map((a) => [a.slug, a]));
const authorsByName = new Map(authors.map((a) => [a.name, a]));

export function getAuthorBySlug(slug: string): Author | undefined {
  return authorsBySlug.get(slug);
}

export function getAuthorByName(name: string): Author | undefined {
  return authorsByName.get(name);
}

export function getFeaturedAuthors(limit = 6): Author[] {
  return [...authors]
    .filter((a) => !isDemotedAuthor(a))
    .sort((a, b) => b.poemIds.length - a.poemIds.length)
    .slice(0, limit);
}

/** 作者本站作品：LLM/人工代表作置顶，其余按名篇分排序 */
export function getAuthorWorks(author: Author): Poem[] {
  const works = author.poemIds
    .map((id) => getPoemById(id))
    .filter((p): p is Poem => Boolean(p));
  return orderWorksWithRepresentative(works, author.slug);
}

/** 作品意境标签频次（降序） */
export function getAuthorTagStats(
  works: Poem[],
  limit = 6,
): { tag: PoemTag; count: number }[] {
  const counts = tagCountsFromWorks(works);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

function tagCountsFromWorks(works: Poem[]): Map<PoemTag, number> {
  const counts = new Map<PoemTag, number>();
  for (const poem of works) {
    for (const tag of poem.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/** 两作者标签重叠分（按共现次数 min 累加） */
function tagOverlapScore(
  a: Map<PoemTag, number>,
  b: Map<PoemTag, number>,
): number {
  let score = 0;
  for (const [tag, countA] of a) {
    const countB = b.get(tag);
    if (countB) score += Math.min(countA, countB);
  }
  return score;
}

/**
 * 同朝相关名家：标签重叠优先，辅以作品量 log，无名氏/不详降权。
 */
export function getRelatedAuthors(
  author: Author,
  limit = 4,
): Author[] {
  const selfTags = tagCountsFromWorks(getAuthorWorks(author));

  const candidates = authors.filter(
    (a) =>
      a.slug !== author.slug &&
      a.dynasty === author.dynasty &&
      a.poemIds.length > 0,
  );

  const scored = candidates.map((a) => {
    const tags = tagCountsFromWorks(getAuthorWorks(a));
    const overlap = tagOverlapScore(selfTags, tags);
    const volume = Math.log2(1 + a.poemIds.length) * 0.35;
    const demote = isDemotedAuthor(a) ? -50 : 0;
    return {
      author: a,
      score: overlap * 2 + volume + demote,
    };
  });

  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    return y.author.poemIds.length - x.author.poemIds.length;
  });

  return scored.slice(0, limit).map((s) => s.author);
}
