"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem } from "@/lib/types";
import {
  lineSpacingClass,
  toDisplayLines,
  verticalLineGapClass,
} from "@/lib/poem-lines";
import MotifTags from "./MotifTags";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";
import { getAuthorByName } from "@/data/authors";

type Props = {
  poem: Poem;
  vertical?: boolean;
  showAuthorLink?: boolean;
  animateEntry?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** 阅读页标题按字数分档：短题大字仪式感，长题降权，极长题序体弱化。 */
function titleLen(title: string): number {
  return Array.from(title).length;
}

function poemTitleClass(len: number): string {
  const base = "font-wenkai font-normal text-balance text-[color:var(--type-primary)]";
  if (len <= 6) {
    return `${base} mb-16 text-3xl tracking-[var(--track-poem)] md:text-5xl md:tracking-[var(--track-display)]`;
  }
  if (len <= 12) {
    return `${base} mb-12 max-w-xl text-3xl tracking-[0.18em] md:text-4xl md:tracking-[0.22em]`;
  }
  if (len <= 20) {
    return `${base} mb-10 max-w-lg text-2xl leading-relaxed tracking-[0.1em] md:text-3xl`;
  }
  // epic：题序体，明确让位于正文（弱于 primary）
  return `font-wenkai font-normal text-balance mb-8 max-w-md text-xl leading-[1.85] tracking-[0.08em] text-[color:var(--type-secondary)] md:text-2xl`;
}

/** 竖排标题档位 class（配合 .poem-v-title） */
function poemVerticalTitleTier(len: number): string {
  if (len <= 6) return "poem-v-title-short";
  if (len <= 12) return "poem-v-title-medium";
  if (len <= 20) return "poem-v-title-long";
  return "poem-v-title-epic";
}

export default function PoemDisplay({
  poem,
  vertical = false,
  showAuthorLink = true,
  animateEntry = true,
}: Props) {
  const reduce = useReducedMotion();
  const { tPoem } = useScript();
  const display = tPoem(poem);
  const lines = toDisplayLines(display.content);
  const author = getAuthorByName(poem.author);
  const titleChars = titleLen(display.title);

  const authorVerticalLabel = `${display.dynasty} · ${display.author}`;

  const authorNode =
    showAuthorLink && author ? (
      <Link
        href={`/author/${author.slug}`}
        className="focus-ring inline-flex flex-wrap items-baseline justify-center gap-x-2.5 transition-colors hover:text-[color:var(--type-active)]"
      >
        <span className="type-dynasty">{display.dynasty}</span>
        <span className="type-author text-xs md:text-sm">{display.author}</span>
      </Link>
    ) : (
      <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2.5">
        <span className="type-dynasty">{display.dynasty}</span>
        <span className="type-author text-xs md:text-sm">{display.author}</span>
      </span>
    );

  if (vertical) {
    const authorVertical =
      showAuthorLink && author ? (
        <Link href={`/author/${author.slug}`}>{authorVerticalLabel}</Link>
      ) : (
        <span>{authorVerticalLabel}</span>
      );

    return (
      <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-24 md:py-28">
        {/*
          组 row-reverse：右侧为题+作者，左侧正文列。
          题/作者 meta 内 LTR：作者在标题右边，顶对齐。
        */}
        <div className="poem-v-stage">
          <div className="poem-v-group">
            <div className="poem-v-meta">
              <motion.h1
                className={`poem-v-title ${poemVerticalTitleTier(titleChars)}`}
                initial={animateEntry && !reduce ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.15, ease }}
              >
                {display.title}
              </motion.h1>

              <motion.div
                className="poem-v-author"
                initial={animateEntry && !reduce ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.28, ease }}
              >
                {authorVertical}
              </motion.div>
            </div>

            <div className="poem-v-lines">
              {lines.map((line, i) => {
                const chars = Array.from(line.text);
                return (
                  <motion.p
                    key={`${line.raw}-${i}`}
                    className={verticalLineGapClass(
                      line.break,
                      i === lines.length - 1,
                    )}
                    initial={
                      animateEntry && !reduce ? { opacity: 0 } : false
                    }
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.85,
                      delay: 0.4 + Math.min(i, 12) * 0.08,
                      ease,
                    }}
                  >
                    {chars.map((ch, ci) => (
                      <span key={`${line.raw}-${ci}`}>{ch}</span>
                    ))}
                  </motion.p>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center px-6 text-center md:mt-16">
          <span className="ink-rule" aria-hidden />
          {(display.motifs?.length ?? 0) > 0 ? (
            <div className="mt-10">
              <MotifTags motifs={display.motifs} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 pb-20 pt-28 text-center md:pb-28 md:pt-32">
      <ScrollReveal delay={0.1}>
        <p className="mb-12">{authorNode}</p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <h1 className={poemTitleClass(titleChars)}>{display.title}</h1>
      </ScrollReveal>

      <div>
        {lines.map((line, i) => (
          <ScrollReveal
            key={`${line.raw}-${i}`}
            delay={0.08 * Math.min(i, 12)}
            y={20}
          >
            <p
              className={`type-poem-body text-lg md:text-2xl md:tracking-[var(--track-display)] md:leading-relaxed ${lineSpacingClass(line.break, i === lines.length - 1)}`}
            >
              {line.text}
            </p>
          </ScrollReveal>
        ))}
      </div>

      {/* 读毕收束：梭形线 → 题跋，再落入相关区 */}
      <ScrollReveal delay={0.15} className="mt-16 flex w-full flex-col items-center md:mt-20">
        <span className="ink-rule" aria-hidden />
        {(display.motifs?.length ?? 0) > 0 ? (
          <div className="mt-10">
            <MotifTags motifs={display.motifs} />
          </div>
        ) : null}
      </ScrollReveal>
    </div>
  );
}
