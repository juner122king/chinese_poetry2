import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthorCard from "@/components/AuthorCard";
import AuthorLifeSection from "@/components/AuthorLifeSection";
import AuthorScrollHero from "@/components/AuthorScrollHero";
import AuthorWorksList from "@/components/AuthorWorksList";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import ThemeScene from "@/components/ThemeScene";
import {
  authors,
  getAuthorBySlug,
  getAuthorTagStats,
  getAuthorWorks,
  getRelatedAuthors,
} from "@/data/authors";
import {
  getAuthorOpening,
  isPlaceholderBio,
  formatCardBio,
} from "@/lib/author-display";
import {
  absoluteUrl,
  jsonLdScript,
  SITE_NAME,
  truncateDescription,
} from "@/lib/seo";

type Props = {
  params: Promise<{ name: string }>;
};

export function generateStaticParams() {
  return authors.map((a) => ({ name: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const author = getAuthorBySlug(name);
  if (!author) return { title: "名家" };

  const title = `${author.name} · 名家`;
  const description = truncateDescription(
    author.bio || `${author.dynasty}代诗人${author.name}，收录于墨韵。`,
  );
  const url = absoluteUrl(`/author/${author.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: `/author/${author.slug}`,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      type: "website",
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

/**
 * 诗人详情 = 一本数字古卷
 * 第一屏：人 · 时代 · 代表诗
 * 下卷：生平 → 诗作 → 同朝
 */
export default async function AuthorPage({ params }: Props) {
  const { name } = await params;
  const author = getAuthorBySlug(name);
  if (!author) notFound();

  const works = getAuthorWorks(author);
  const tagStats = getAuthorTagStats(works, 6);
  const related = getRelatedAuthors(author, 4);
  const opening = getAuthorOpening(works, author);
  const hasLife = !isPlaceholderBio(formatCardBio(author.bio));
  /** 与开卷代表作同源意境；无作品时回退山水 */
  const bgTheme = opening?.poem.theme ?? "landscape";
  const pageUrl = absoluteUrl(`/author/${author.slug}`);
  const bio =
    author.bio || `${author.dynasty}代诗人${author.name}，收录于墨韵。`;

  const personDescription = truncateDescription(
    author.years ? `${bio}（${author.years}）` : bio,
    200,
  );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: author.name,
      description: personDescription,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
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
          name: "名家",
          item: absoluteUrl("/authors"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: author.name,
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
      <ThemeScene theme={bgTheme} seed={`author:${author.slug}`} />
      <div className="relative z-10">
        <AuthorScrollHero
          author={author}
          opening={opening}
          nextSectionId={hasLife ? "author-life" : "author-works"}
        />

        <AuthorLifeSection author={author} tagStats={tagStats} />

        <AuthorWorksList
          works={works}
          authorSlug={author.slug}
          tagStats={hasLife ? [] : tagStats}
        />

        {related.length > 0 && (
          <section className="px-6 pb-8 pt-8 md:px-10 md:pt-12">
            <div className="mx-auto max-w-5xl">
              <ScrollReveal>
                <div className="mb-12 flex flex-col items-center md:mb-14">
                  <span
                    className="ink-rule mb-8"
                    aria-hidden
                  />
                  <T
                    as="h2"
                    className="type-group-label tracking-[0.55em]"
                  >
                    同 朝
                  </T>
                </div>
              </ScrollReveal>
              <div className="grid auto-rows-fr grid-cols-2 gap-4 md:grid-cols-4">
                {related.map((a, i) => (
                  <AuthorCard
                    key={a.slug}
                    author={a}
                    index={i}
                    variant="compact"
                    hideDynasty
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col items-center gap-4 px-6 pb-28 pt-16 text-center sm:flex-row sm:justify-center sm:gap-10 md:px-10">
          <Link
            href="/authors"
            className="type-meta text-xs transition-colors duration-300 hover:text-[color:var(--type-active)]"
          >
            <T>返回名家目录</T>
          </Link>
          <Link
            href="/poems"
            className="type-meta text-xs transition-colors duration-300 hover:text-[color:var(--type-active)]"
          >
            <T>返回诗卷目录</T>
          </Link>
        </div>
      </div>
    </div>
  );
}
