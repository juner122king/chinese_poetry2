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

      {/* Catalog whisper */}
      <section className="relative border-b border-xuan/5 px-6 py-12 md:px-10">
        <ScrollReveal>
          <p className="mx-auto max-w-2xl text-center font-serif text-xs leading-relaxed tracking-[0.22em] text-[color:var(--type-meta)] md:text-[13px]">
            <T>
              {`收唐诗 ${tang} · 宋词 ${ci} · 凡 ${poemCount} 篇 · ${authorCount} 家`}
            </T>
          </p>
        </ScrollReveal>
      </section>

      {/* Featured poems */}
      <section
        id="featured"
        className="relative overflow-hidden px-6 py-28 md:px-10 md:py-36"
      >
        <InkBackground theme="landscape" intensity="soft" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
              <p className="type-eyebrow">SELECTED</p>
              <T as="h2" className="type-display text-2xl md:text-3xl">
                精 选 诗 卷
              </T>
              <span className="mt-2 h-px w-10 bg-[color:var(--type-faint)]" />
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

      {/* Featured authors */}
      <section className="relative border-t border-xuan/5 px-6 py-28 md:px-10 md:py-36">
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
              <p className="type-eyebrow">POETS</p>
              <T as="h2" className="type-display text-2xl md:text-3xl">
                精 选 名 家
              </T>
              <span className="mt-2 h-px w-10 bg-[color:var(--type-faint)]" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {authors.map((author, i) => (
              <AuthorCard key={author.slug} author={author} index={i} />
            ))}
          </div>

          <ScrollReveal className="mt-16 text-center" delay={0.1}>
            <Link href="/authors" className="text-link-elegant">
              <T>遍览名家</T>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-xuan/5 px-6 py-12 text-center">
        <T
          as="p"
          className="type-quiet tracking-[0.35em]"
        >
          墨韵 · 东方诗词视觉体验
        </T>
      </footer>
    </>
  );
}
