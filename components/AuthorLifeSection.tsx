"use client";

import Link from "next/link";
import type { Author, PoemTag } from "@/lib/types";
import {
  formatCardBio,
  isPlaceholderBio,
} from "@/lib/author-display";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

type Props = {
  author: Author;
  tagStats: { tag: PoemTag; count: number }[];
};

/**
 * 古卷第二叠：生平
 * 长文阅读节奏，不做成百科条目。
 */
export default function AuthorLifeSection({ author, tagStats }: Props) {
  const { t, tAuthor } = useScript();
  const display = tAuthor(author);
  const bio = formatCardBio(display.bio);
  const showBio = !isPlaceholderBio(bio);

  // 无传记时不硬撑「生平」；意境标签改挂在诗作区
  if (!showBio) return null;

  return (
    <section
      id="author-life"
      className="relative scroll-mt-24 px-6 py-24 md:px-10 md:py-32"
      aria-labelledby="author-life-heading"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <ScrollReveal>
          <div className="mb-14 flex flex-col items-center md:mb-16">
            <span
              className="ink-rule mb-8"
              aria-hidden
            />
            <h2
              id="author-life-heading"
              className="type-group-label tracking-[0.55em]"
            >
              {t("生 平")}
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <p className="text-center font-serif text-[0.95rem] leading-[2.15] tracking-[0.14em] text-[color:var(--type-secondary)] md:text-base md:leading-[2.25] md:tracking-[0.16em]">
            {bio}
          </p>
        </ScrollReveal>

        {tagStats.length > 0 && (
          <ScrollReveal delay={0.16}>
            <ul
              className="mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5 md:mt-16"
              aria-label={t("主写意境")}
            >
              {tagStats.map(({ tag, count }, i) => (
                <li key={tag} className="inline-flex items-center gap-x-3">
                  {i > 0 && (
                    <span
                      className="select-none text-[11px] text-[color:var(--type-faint)]"
                      aria-hidden
                    >
                      ·
                    </span>
                  )}
                  <Link
                    href={buildPoemsHref({ tag, author: author.slug })}
                    className="type-meta tracking-[0.32em] transition-colors duration-300 hover:text-[color:var(--type-active)]"
                    title={t(`本家 ${count} 篇`)}
                  >
                    {t(getTagLabel(tag))}
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
