"use client";

import { useState } from "react";
import Link from "next/link";
import type { Poem, PoemTag } from "@/lib/types";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import PoemCard from "./PoemCard";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

/** 首屏展示篇数；超出后需展开 */
export const AUTHOR_WORKS_PREVIEW = 4;

type Props = {
  works: Poem[];
  /** 无生平段时，意境标签挂在此处 */
  authorSlug?: string;
  tagStats?: { tag: PoemTag; count: number }[];
};

/**
 * 古卷第三叠：诗作
 * 卡牌双栏，与全站诗卷卡片一致。
 */
export default function AuthorWorksList({
  works,
  authorSlug,
  tagStats = [],
}: Props) {
  const { t } = useScript();
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = works.length > AUTHOR_WORKS_PREVIEW;
  const visible =
    expanded || !needsCollapse
      ? works
      : works.slice(0, AUTHOR_WORKS_PREVIEW);
  const hiddenCount = works.length - AUTHOR_WORKS_PREVIEW;

  return (
    <section
      id="author-works"
      className="relative scroll-mt-24 px-6 py-24 md:px-10 md:py-32"
      aria-labelledby="author-works-heading"
    >
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-14 flex flex-col items-center md:mb-16">
            <span className="ink-rule mb-8" aria-hidden />
            <h2
              id="author-works-heading"
              className="type-group-label tracking-[0.55em]"
            >
              {t("诗 作")}
            </h2>
            {works.length > 0 && (
              <p className="mt-5 type-meta tracking-[0.28em]">
                {t(`收 ${works.length} 篇`)}
              </p>
            )}
            {authorSlug && tagStats.length > 0 && (
              <ul
                className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
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
                      href={buildPoemsHref({ tag, author: authorSlug })}
                      className="type-meta tracking-[0.32em] transition-colors duration-300 hover:text-[color:var(--type-active)]"
                      title={t(`得 ${count} 篇`)}
                    >
                      {t(getTagLabel(tag))}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollReveal>

        {works.length === 0 ? (
          <p className="type-meta py-8 text-center text-sm">
            {t("本站暂未收录作品。")}
          </p>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2">
            {visible.map((poem, i) => (
              <PoemCard key={poem.id} poem={poem} index={i} />
            ))}
          </div>
        )}

        {needsCollapse && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            {!expanded ? (
              // 计数并入按钮：一个元件做一件事，也省掉第五种计数说法
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-link-elegant text-[11px]"
              >
                {t(`展开余下 ${hiddenCount} 篇`)}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="type-meta text-[11px] transition-colors duration-300 hover:text-[color:var(--type-active)]"
              >
                {t("收起")}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
