"use client";

import Link from "next/link";
import type { Author, PoemTag } from "@/lib/types";
import { isPlaceholderBio } from "@/lib/author-display";
import { authorYears } from "@/lib/author-years";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import { useScript } from "./ScriptProvider";

type Props = {
  author: Author;
  tagStats: { tag: PoemTag; count: number }[];
};

export default function AuthorPageHeader({ author, tagStats }: Props) {
  const { t, tAuthor } = useScript();
  const display = tAuthor(author);
  const seal = display.name.slice(0, 1);
  const showBio = !isPlaceholderBio(display.bio);
  const years = authorYears(author);

  return (
    <header className="mb-16 flex flex-col items-center text-center">
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
        <span
          className="absolute inset-0 border border-cinnabar/60"
          style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
        />
        <span className="font-wenkai text-3xl text-cinnabar">{seal}</span>
      </div>
      <p className="type-dynasty mb-3 text-[11px] tracking-[0.45em]">
        {display.dynasty}
      </p>
      <h1 className="type-display mb-3 text-3xl md:text-4xl">{display.name}</h1>
      {years && (
        <p className="type-meta mb-6 text-[11px] tracking-[0.28em]">
          {years.replace(/—/g, " — ")}
        </p>
      )}
      {showBio && (
        <p
          className={`max-w-lg font-serif text-sm leading-[2] tracking-[0.12em] text-[color:var(--type-secondary)] ${years ? "" : "mt-5"}`}
        >
          {display.bio}
        </p>
      )}

      {tagStats.length > 0 && (
        <ul
          className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
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
                className="type-meta tracking-[0.3em] transition-colors duration-300 hover:text-[color:var(--type-active)]"
                title={t(`本家 ${count} 篇`)}
              >
                {t(getTagLabel(tag))}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <span className="mt-10 h-px w-12 bg-[color:var(--type-faint)]" />
    </header>
  );
}
