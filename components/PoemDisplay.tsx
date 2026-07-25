"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem } from "@/lib/types";
import {
  lineSpacingClass,
  toDisplayLines,
  verticalLineGapClass,
} from "@/lib/poem-lines";
import { getBackgroundLabel } from "@/lib/motifs";
import ImageryTags from "./ImageryTags";
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
  const motifsLabel = getBackgroundLabel(display);

  const authorLabel = `${display.dynasty} · ${display.author}`;

  const authorNode =
    showAuthorLink && author ? (
      <Link
        href={`/author/${author.slug}`}
        className="tracking-[0.3em] text-xuan/50 transition-colors hover:text-cinnabar focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
      >
        {authorLabel}
      </Link>
    ) : (
      <span className="tracking-[0.3em] text-xuan/50">{authorLabel}</span>
    );

  if (vertical) {
    const authorVertical =
      showAuthorLink && author ? (
        <Link href={`/author/${author.slug}`}>{authorLabel}</Link>
      ) : (
        <span>{authorLabel}</span>
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
                className="poem-v-title"
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

        {(motifsLabel || (poem.tags?.length ?? 0) > 0) && (
          <div className="mt-14 flex flex-col items-center gap-6 px-6 text-center">
            {motifsLabel ? (
              <p className="font-sans text-[11px] tracking-[0.4em] text-xuan/30">
                {motifsLabel}
              </p>
            ) : null}
            <ImageryTags tags={poem.tags} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-28 text-center">
      <ScrollReveal delay={0.1}>
        <p className="mb-12 font-wenkai text-xs tracking-[0.45em] text-xuan/45 md:text-sm">
          {authorNode}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <h1 className="mb-16 font-wenkai text-3xl font-normal tracking-[0.35em] text-xuan md:text-5xl md:tracking-[0.4em]">
          {display.title}
        </h1>
      </ScrollReveal>

      <div>
        {lines.map((line, i) => (
          <ScrollReveal
            key={`${line.raw}-${i}`}
            delay={0.08 * Math.min(i, 12)}
            y={20}
          >
            <p
              className={`font-wenkai text-lg tracking-[0.35em] text-xuan/90 md:text-2xl md:tracking-[0.4em] md:leading-relaxed ${lineSpacingClass(line.break, i === lines.length - 1)}`}
            >
              {line.text}
            </p>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.2} className="mt-16">
        <p className="font-sans text-[11px] tracking-[0.4em] text-xuan/30">
          {motifsLabel}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.28} className="mt-8">
        <ImageryTags tags={poem.tags} />
      </ScrollReveal>
    </div>
  );
}
