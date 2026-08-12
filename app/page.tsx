import type { Metadata } from "next";
import Link from "next/link";
import AuthorCard from "@/components/AuthorCard";
import HomeHero from "@/components/HomeHero";
import HomeImageryGates from "@/components/HomeImageryGates";
import HomeScrollCue from "@/components/HomeScrollCue";
import PoemCard from "@/components/PoemCard";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import { getFeaturedAuthors } from "@/data/authors";
import {
  countPoemsByTag,
  getFeaturedPoemPool,
  getFeaturedPoems,
} from "@/data/poems";
import {
  jsonLdScript,
  SITE_DESCRIPTION_SHORT,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_URL,
} from "@/lib/seo";
import type { PoemTag } from "@/lib/types";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE_DEFAULT,
  },
  description: SITE_DESCRIPTION_SHORT,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION_SHORT,
    url: SITE_URL,
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION_SHORT,
  },
};

export default function HomePage() {
  const heroPool = getFeaturedPoemPool();
  const gridPoems = getFeaturedPoems(6);
  const authors = getFeaturedAuthors(6);

  const tagCounts = countPoemsByTag();
  const gateTags: PoemTag[] = [
    "spring",
    "moon",
    "parting",
    "frontier",
    "rain",
    "wine",
  ];
  const gateCounts: Partial<Record<PoemTag, number>> = {};
  for (const tag of gateTags) {
    gateCounts[tag] = tagCounts.get(tag) ?? 0;
  }

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_TITLE_DEFAULT,
    url: SITE_URL,
    description: SITE_DESCRIPTION_SHORT,
    inLanguage: "zh-CN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteLd) }}
      />
      <HomeHero pool={heroPool} />
      {/* 固定 ↓：按内容区锚点 hero → featured → imagery-gates → authors-featured */}
      <HomeScrollCue />

      {/* Featured poems — 锚点挂内容核，避免 section 大 padding 顶对齐裁掉下半 */}
      <section className="relative overflow-hidden px-6 py-28 md:px-10 md:py-36">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(104, 130, 156, 0.07), transparent 70%)",
          }}
        />
        <div
          id="featured"
          className="home-anchor relative z-10 mx-auto max-w-6xl"
        >
          <ScrollReveal y={0} duration={0.4}>
            <div className="mb-16 flex flex-col items-center md:mb-20">
              <span className="ink-rule mb-8" aria-hidden />
              <T as="h2" className="type-group-label">
                精 选 诗 卷
              </T>
            </div>
          </ScrollReveal>

          {/* 等宽等高网格（非瀑布流），精选区卡片对齐 */}
          <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridPoems.map((poem, i) => (
              <PoemCard
                key={poem.id}
                poem={poem}
                index={i}
                reveal="fade"
                className="!mb-0 h-full"
              />
            ))}
          </div>

          <ScrollReveal className="mt-16 text-center" delay={0.05} y={0} duration={0.35}>
            <Link href="/poems" className="text-link-elegant">
              <T>遍览诗卷</T>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <HomeImageryGates counts={gateCounts} />

      {/* Featured authors —— 锚点挂内容核；底 padding 保证滚得动露全 */}
      <section className="relative px-6 py-28 pb-36 md:px-10 md:py-40 md:pb-44">
        <div
          id="authors-featured"
          className="home-anchor relative z-10 mx-auto max-w-6xl"
        >
          <ScrollReveal y={0} duration={0.4}>
            <div className="mb-16 flex flex-col items-center md:mb-20">
              <span className="ink-rule mb-8" aria-hidden />
              <T as="h2" className="type-group-label">
                精 选 名 家
              </T>
            </div>
          </ScrollReveal>

          {/* 3 列完整卡：含简介/生卒，避免 6 列 compact 过简 */}
          <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {authors.map((author, i) => (
              <AuthorCard
                key={author.slug}
                author={author}
                index={i}
                variant="default"
              />
            ))}
          </div>

          <ScrollReveal className="mt-16 text-center" delay={0.05} y={0} duration={0.35}>
            <Link href="/authors" className="text-link-elegant">
              <T>遍览名家</T>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
