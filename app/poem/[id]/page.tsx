import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PoemAdjacentNav from "@/components/PoemAdjacentNav";
import PoemKeyboardNav from "@/components/PoemKeyboardNav";
import PoemReadingView from "@/components/PoemReadingView";
import PoemRelated from "@/components/PoemRelated";
import ShelfButton from "@/components/ShelfButton";
import ThemeScene from "@/components/ThemeScene";
import {
  getAdjacentPoems,
  getPoemById,
  getRelatedPoems,
  poems,
} from "@/data/poems";
import {
  absoluteUrl,
  jsonLdScript,
  poemDescription,
  SITE_NAME,
} from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return poems.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const poem = getPoemById(id);
  if (!poem) return { title: "诗词" };

  const title = `${poem.title} · ${poem.author}`;
  const description = poemDescription(
    poem.content,
    poem.author,
    poem.dynasty,
  );
  const url = absoluteUrl(`/poem/${poem.id}`);

  return {
    title,
    description,
    alternates: {
      canonical: `/poem/${poem.id}`,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      type: "article",
      locale: "zh_CN",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export default async function PoemDetailPage({ params }: Props) {
  const { id } = await params;
  const poem = getPoemById(id);
  if (!poem) notFound();

  const { prev, next } = getAdjacentPoems(id);
  const related = getRelatedPoems(id, 3);
  const pageUrl = absoluteUrl(`/poem/${poem.id}`);
  const fullText = poem.content.filter(Boolean).join("\n");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: poem.title,
      headline: poem.title,
      author: {
        "@type": "Person",
        name: poem.author,
      },
      text: fullText,
      inLanguage: "zh-CN",
      genre: poem.form === "ci" ? "词" : "诗",
      about: poem.dynasty,
      url: pageUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "首页",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "诗卷",
          item: absoluteUrl("/poems"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: poem.title,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ThemeScene theme={poem.theme} seed={poem.id} />
      <PoemReadingView poem={poem} />
      <PoemRelated items={related} />
      <PoemAdjacentNav prev={prev} next={next} />
      <PoemKeyboardNav
        prevId={prev?.id ?? null}
        nextId={next?.id ?? null}
      />
      <ShelfButton poemId={poem.id} />
    </div>
  );
}
