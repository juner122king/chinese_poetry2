import type { Author } from "@/lib/types";
import authorsJson from "./generated/authors.json";

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
