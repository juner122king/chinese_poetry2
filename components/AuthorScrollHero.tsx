"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import type { Author } from "@/lib/types";
import {
  extractArtName,
  extractCourtesyName,
  formatScrollName,
  formatYearsDisplay,
  type AuthorOpening,
} from "@/lib/author-display";
import { authorYears } from "@/lib/author-years";
import { useScript } from "./ScriptProvider";

type Props = {
  author: Author;
  opening: AuthorOpening | null;
  /** 卷下第一叠锚点：有生平则 #author-life，否则 #author-works */
  nextSectionId?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 诗人古卷 · 第一页
 * 只呈现：人 · 时代 · 一句代表诗 · 氛围
 * 不堆叠简介、头像、作品列表。
 */
export default function AuthorScrollHero({
  author,
  opening,
  nextSectionId = "author-works",
}: Props) {
  const { t, tAuthor, tPoem } = useScript();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const display = tAuthor(author);
  const years = authorYears(author);
  const yearsLabel = years ? formatYearsDisplay(years) : undefined;
  const courtesy = extractCourtesyName(display.bio);
  const artName = extractArtName(display.bio);
  const nameSpaced = formatScrollName(display.name);

  const openingPoem = opening ? tPoem(opening.poem) : null;
  const openingLines = opening
    ? opening.lines.map((line) => t(line))
    : [];
  const openingTitle = openingPoem ? openingPoem.title : null;

  const fade = (delay: number, y = 16) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.05, delay, ease: EASE },
        };

  /** 滚到开卷屏底沿，使 ↓ 刚好离开视口（不靠锚点 scroll-mt 停半截） */
  function handleScrollCue(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = sectionRef.current;
    const next = document.getElementById(nextSectionId);
    const y = el
      ? el.offsetTop + el.offsetHeight
      : (next?.offsetTop ?? 0);
    window.scrollTo({
      top: y,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] min-h-[100dvh] flex-col items-center justify-center px-6 pb-24 pt-28 md:px-10"
      aria-label={t("开卷")}
    >
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        {/* 朝代 · 时代感（单字朝名补「代」：唐→唐代） */}
        <motion.p
          className="type-dynasty mb-8 text-[11px] tracking-[0.55em] md:mb-10"
          {...fade(0.15, 10)}
        >
          {display.dynasty.length === 1
            ? `${display.dynasty}${t("代")}`
            : display.dynasty}
        </motion.p>

        {/* 人名 */}
        <motion.h1
          className="type-display mb-6 text-[2.35rem] leading-none tracking-[0.35em] md:mb-7 md:text-5xl md:tracking-[0.42em]"
          {...fade(0.35, 14)}
        >
          {nameSpaced}
        </motion.h1>

        {/* 生卒 */}
        {yearsLabel && (
          <motion.p
            className="type-meta mb-5 text-[11px] tracking-[0.32em] md:mb-6"
            {...fade(0.55, 10)}
          >
            {yearsLabel}
          </motion.p>
        )}

        {/* 字 / 号 */}
        {(courtesy || artName) && (
          <motion.div
            className="mb-8 flex flex-col items-center gap-2 md:mb-10"
            {...fade(0.7, 10)}
          >
            {courtesy && (
              <p className="font-wenkai text-sm tracking-[0.45em] text-[color:var(--type-secondary)] md:text-[0.95rem]">
                {t("字")}
                <span className="mx-[0.15em]" aria-hidden>
                  {" "}
                </span>
                {courtesy}
              </p>
            )}
            {artName && (
              <p className="font-wenkai text-xs tracking-[0.4em] text-[color:var(--type-meta)] md:text-[0.8rem]">
                {t("号")}
                <span className="mx-[0.15em]" aria-hidden>
                  {" "}
                </span>
                {artName}
              </p>
            )}
          </motion.div>
        )}

        {/* 卷中印点 */}
        <motion.span
          className="mb-10 block h-1.5 w-1.5 rounded-full bg-cinnabar/55 md:mb-12"
          aria-hidden
          {...fade(0.9, 0)}
        />

        {/* 代表诗 · 开卷引文 */}
        {opening && openingTitle && openingLines.length > 0 && (
          <motion.div
            className="flex max-w-md flex-col items-center"
            {...fade(1.05, 18)}
          >
            <Link
              href={`/poem/${opening.poem.id}`}
              className="group flex flex-col items-center rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-6 focus-visible:outline-cinnabar/50"
            >
              <p className="mb-5 font-wenkai text-xs tracking-[0.42em] text-[color:var(--type-quiet)] transition-colors duration-500 group-hover:text-[color:var(--type-meta)] md:mb-6 md:text-[0.8rem]">
                {openingTitle}
              </p>
              <div className="space-y-3 md:space-y-3.5">
                {openingLines.map((line) => (
                  <p
                    key={line}
                    className="font-wenkai text-base leading-[1.9] tracking-[0.28em] text-[color:var(--type-primary)] transition-colors duration-500 group-hover:text-cinnabar/90 md:text-lg md:tracking-[0.32em]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      {/* 下卷提示：点击滚出本屏，按钮刚好不可见 */}
      <motion.a
        href={`#${nextSectionId}`}
        className="scroll-cue"
        aria-label={t("向下展卷")}
        onClick={handleScrollCue}
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.9, delay: 1.85, ease: EASE },
            })}
      >
        <span
          className="block text-[11px] tracking-[0.35em] text-[color:var(--type-faint)]"
          aria-hidden
        >
          ↓
        </span>
      </motion.a>
    </section>
  );
}
