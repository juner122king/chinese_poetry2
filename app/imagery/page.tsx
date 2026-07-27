import type { Metadata } from "next";
import Link from "next/link";
import InkBackground from "@/components/InkBackground";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import { countPoemsByTag } from "@/data/poems";
import {
  imageryTaxonomy,
  type TagGroup,
} from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";

export const metadata: Metadata = {
  title: "意境 · 墨韵",
  description: "按意境归集浏览诗词：四季、山水、花木、人事…",
};

const GROUP_ORDER: TagGroup[] = [
  "四季物候",
  "天象时辰",
  "山水地理",
  "花木禽鱼",
  "人事情感",
  "行旅器物",
];

export default function ImageryPage() {
  const counts = countPoemsByTag();

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    tags: imageryTaxonomy.filter((t) => t.group === group),
  })).filter((g) => g.tags.length > 0);

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <header className="mb-20 flex flex-col items-center gap-4 text-center">
            <p className="type-eyebrow">IMAGERY</p>
            <T as="h1" className="type-display text-3xl md:text-4xl">
              意 境
            </T>
            <T
              as="p"
              className="mt-2 max-w-md font-serif text-xs leading-relaxed tracking-[0.2em] text-[color:var(--type-meta)]"
            >
              按归集标签入诗卷。春月离别，各有门径。
            </T>
            <span className="mt-4 h-px w-12 bg-[color:var(--type-faint)]" />
          </header>
        </ScrollReveal>

        {byGroup.map(({ group, tags }, gi) => (
          <section key={group} className="mb-16">
            <ScrollReveal delay={Math.min(gi, 4) * 0.04}>
              <div className="mb-8 flex items-center gap-6">
                <T as="span" className="type-group-label">
                  {group}
                </T>
                <span className="h-px flex-1 bg-gradient-to-r from-xuan/15 to-transparent" />
              </div>
            </ScrollReveal>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {tags.map((tag, i) => {
                const n = counts.get(tag.id) ?? 0;
                return (
                  <li key={tag.id}>
                    <ScrollReveal delay={Math.min(i, 8) * 0.03}>
                      <Link
                        href={buildPoemsHref({ tag: tag.id })}
                        className="group flex flex-col items-center gap-2 rounded-sm border border-xuan/10 bg-xuan/[0.02] px-4 py-6 text-center transition-[border-color,background-color] duration-500 hover:border-cinnabar/35 hover:bg-xuan/[0.04]"
                      >
                        <T
                          as="span"
                          className="font-wenkai text-lg tracking-[0.35em] text-[color:var(--type-primary)] transition-colors duration-300 group-hover:text-cinnabar"
                        >
                          {tag.label}
                        </T>
                        <span className="type-quiet text-[11px]">
                          {n > 0 ? (
                            <T>{`${n} 篇`}</T>
                          ) : (
                            <T>暂无</T>
                          )}
                        </span>
                      </Link>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="mt-8 text-center">
          <Link href="/poems" className="text-link-elegant">
            <T>回诗卷</T>
          </Link>
        </div>
      </div>
    </div>
  );
}
