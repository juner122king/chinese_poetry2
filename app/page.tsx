import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import PoemCard from "@/components/PoemCard";
import AuthorCard from "@/components/AuthorCard";
import ScrollReveal from "@/components/ScrollReveal";
import InkBackground from "@/components/InkBackground";
import T from "@/components/T";
import { getFeaturedPoems, getRandomFeaturedPoem } from "@/data/poems";
import { getFeaturedAuthors } from "@/data/authors";

/** 每次刷新随机 Hero 诗；静态预渲染会冻死随机结果 */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const heroPoem = getRandomFeaturedPoem();
  const gridPoems = getFeaturedPoems(6);
  const authors = getFeaturedAuthors(6);

  return (
    <>
      <HeroSection poem={heroPoem} />

      {/* Featured poems */}
      <section
        id="featured"
        className="relative overflow-hidden px-6 py-28 md:px-10 md:py-36"
      >
        <InkBackground theme="landscape" intensity="soft" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
              <p className="font-sans text-[11px] tracking-[0.5em] text-xuan/35">
                SELECTED
              </p>
              <T
                as="h2"
                className="font-wenkai text-2xl tracking-[0.4em] text-xuan md:text-3xl"
              >
                精 选 诗 卷
              </T>
              <span className="mt-2 h-px w-10 bg-cinnabar/50" />
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

      {/* Featured authors */}
      <section className="relative border-t border-xuan/5 px-6 py-28 md:px-10 md:py-36">
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
              <p className="font-sans text-[11px] tracking-[0.5em] text-xuan/35">
                POETS
              </p>
              <T
                as="h2"
                className="font-wenkai text-2xl tracking-[0.4em] text-xuan md:text-3xl"
              >
                精 选 名 家
              </T>
              <span className="mt-2 h-px w-10 bg-cinnabar/50" />
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
          className="font-sans text-[11px] tracking-[0.35em] text-xuan/25"
        >
          墨韵 · 东方诗词视觉体验
        </T>
      </footer>
    </>
  );
}
