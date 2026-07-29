import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import PoemCard from "@/components/PoemCard";
import AuthorCard from "@/components/AuthorCard";
import HomeImageryGates from "@/components/HomeImageryGates";
import ScrollReveal from "@/components/ScrollReveal";
import InkBackground from "@/components/InkBackground";
import T from "@/components/T";
import { getFeaturedAuthors } from "@/data/authors";
import {
  countPoemsByTag,
  getFeaturedPoems,
  getRandomFeaturedPoem,
  poems,
} from "@/data/poems";
import type { PoemTag } from "@/lib/types";
import meta from "@/data/generated/meta.json";

/** 每次刷新随机 Hero 诗；静态预渲染会冻死随机结果 */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const heroPoem = getRandomFeaturedPoem();
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

  const poemCount = meta.poemCount ?? poems.length;
  const authorCount = meta.authorCount ?? authors.length;
  const tang = meta.tang ?? 0;
  const ci = meta.ci ?? 0;

  return (
    <>
      <HeroSection key={heroPoem.id} poem={heroPoem} />

      {/* Featured poems */}
      <section
        id="featured"
        className="relative overflow-hidden px-6 py-28 md:px-10 md:py-36"
      >
        <InkBackground theme="landscape" intensity="soft" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 flex flex-col items-center md:mb-20">
              <span className="ink-rule mb-8" aria-hidden />
              <T as="h2" className="type-group-label tracking-[0.55em]">
                精 选 诗 卷
              </T>
            </div>
          </ScrollReveal>

          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {gridPoems.map((poem, i) => (
              <PoemCard key={poem.id} poem={poem} index={i} />
            ))}
          </div>

          <ScrollReveal className="mt-16 text-center" delay={0.1}>
            <Link href="/poems" className="text-link-elegant">
              <T>遍览诗卷</T>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <HomeImageryGates counts={gateCounts} />

      {/* Featured authors —— 与上方意境带长短相间，不再用水平灰线分区 */}
      <section className="relative px-6 py-28 md:px-10 md:py-40">
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 flex flex-col items-center md:mb-20">
              <span className="ink-rule mb-8" aria-hidden />
              <T as="h2" className="type-group-label tracking-[0.55em]">
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

          <ScrollReveal className="mt-16 text-center" delay={0.1}>
            <Link href="/authors" className="text-link-elegant">
              <T>遍览名家</T>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-rule-faint px-6 py-12 text-center md:py-14">
        <ScrollReveal>
          <p className="mx-auto max-w-2xl font-serif text-xs leading-relaxed tracking-[0.22em] text-[color:var(--type-meta)] md:text-[13px]">
            <T>
              {`收唐诗 ${tang} · 宋词 ${ci} · 凡 ${poemCount} 篇 · ${authorCount} 家`}
            </T>
          </p>
        </ScrollReveal>
        <T
          as="p"
          className="type-quiet mt-6 tracking-[0.35em]"
        >
          墨韵 · 东方诗词视觉体验
        </T>
      </footer>
    </>
  );
}
