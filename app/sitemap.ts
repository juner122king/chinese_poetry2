import type { MetadataRoute } from "next";
import { authors } from "@/data/authors";
import meta from "@/data/generated/meta.json";
import { poems } from "@/data/poems";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = meta.generatedAt
    ? new Date(meta.generatedAt)
    : new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/poems"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/authors"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/imagery"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const poemRoutes: MetadataRoute.Sitemap = poems.map((p) => ({
    url: absoluteUrl(`/poem/${p.id}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const authorRoutes: MetadataRoute.Sitemap = authors.map((a) => ({
    url: absoluteUrl(`/author/${a.slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...poemRoutes, ...authorRoutes];
}
