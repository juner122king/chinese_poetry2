"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import InkBackground from "./InkBackground";
import type { Poem } from "@/lib/types";
import { getThemeVisual } from "@/lib/theme-map";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

type Props = {
  poem: Poem;
};

/** Shared ease — matches --ease-elegant */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero text entrance timeline.
 * Tune beat / durations here — major-section delays are derived.
 *
 * 诗题 → (+beat) → 作者区(整组) → (+beat) → 诗句(逐字) → CTA → scroll-cue
 */
const HERO_CHOREO = {
  /** Equal start-to-start gap between 题 / 作者 / 正文 */
  beat: 0.9,
  title: { delay: 0.25, duration: 1.2, y: 12 },
  kicker: { duration: 1.0 },
  lines: {
    charStagger: 0.12,
    lineGap: 0.3,
    duration: 0.95,
    /** px; 0 disables blur */
    blur: 4,
  },
  actions: { afterLastChar: 0.55, duration: 1.05, childStagger: 0.1 },
  scrollCue: { afterActions: 0.2, duration: 0.85 },
} as const;

const titleDelay = HERO_CHOREO.title.delay;
/** 作者区起拍 = 诗题起拍 + 1 beat */
const kickerDelay = titleDelay + HERO_CHOREO.beat;
/** 正文起拍 = 诗题起拍 + 2 beats（与题→作者间距相同） */
const linesStart = titleDelay + HERO_CHOREO.beat * 2;

function lineCharCountBefore(lines: string[], lineIndex: number): number {
  let count = 0;
  for (let i = 0; i < lineIndex; i++) {
    count += Array.from(lines[i] ?? "").length;
  }
  return count;
}

/** Absolute delay for a character in the hero couplet. */
function charDelay(
  lineIndex: number,
  charIndex: number,
  lines: string[],
): number {
  const { charStagger, lineGap } = HERO_CHOREO.lines;
  const priorChars = lineCharCountBefore(lines, lineIndex);
  return (
    linesStart +
    priorChars * charStagger +
    lineIndex * lineGap +
    charIndex * charStagger
  );
}

/** When the last character animation finishes (delay + duration). */
function lastCharEnd(lines: string[]): number {
  if (lines.length === 0) return linesStart;

  let lastDelay: number = linesStart;
  lines.forEach((line, lineIndex) => {
    const chars = Array.from(line);
    if (chars.length === 0) {
      lastDelay = Math.max(
        lastDelay,
        linesStart + lineIndex * HERO_CHOREO.lines.lineGap,
      );
      return;
    }
    const d = charDelay(lineIndex, chars.length - 1, lines);
    if (d > lastDelay) lastDelay = d;
  });

  return lastDelay + HERO_CHOREO.lines.duration;
}

function actionsDelay(lines: string[]): number {
  return lastCharEnd(lines) + HERO_CHOREO.actions.afterLastChar;
}

function scrollCueDelay(lines: string[]): number {
  return (
    actionsDelay(lines) +
    HERO_CHOREO.actions.duration * 0.45 +
    HERO_CHOREO.scrollCue.afterActions
  );
}

export default function HeroSection({ poem }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const visual = getThemeVisual(poem.theme);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const lines = poem.content.slice(0, 2);
  const ctaDelay = actionsDelay(lines);
  const cueDelay = scrollCueDelay(lines);
  const useBlur = !reduce && HERO_CHOREO.lines.blur > 0;
  const blurPx = HERO_CHOREO.lines.blur;

  return (
    <section ref={ref} className="hero-section noise-overlay">
      <motion.div
        className="hero-scene"
        style={reduce ? undefined : { y: sceneY }}
      >
        <InkBackground theme={poem.theme} />
        {visual.particles !== "none" && (
          <ParticleBackground
            mode={visual.particles}
            safeCenter={visual.particleSafeCenter}
          />
        )}
      </motion.div>

      <motion.div
        className="hero-content"
        style={reduce ? undefined : { y: textY }}
      >
        {/* 题 | 作者 | 文 — 居中略偏左；CTA 绝对右下 */}
        <div className="hero-poem">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: HERO_CHOREO.title.y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: HERO_CHOREO.title.delay,
              duration: HERO_CHOREO.title.duration,
              ease: EASE,
            }}
          >
            {poem.title}
          </motion.h1>

          <motion.div
            className="hero-kicker"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: kickerDelay,
              duration: HERO_CHOREO.kicker.duration,
              ease: EASE,
            }}
          >
            <span className="hero-dynasty">{poem.dynasty}</span>
            <span className="hero-kicker-rule" aria-hidden="true" />
            <span className="hero-author">{poem.author}</span>
          </motion.div>

          <div className="hero-lines">
            {lines.map((line, lineIndex) => (
              <p key={`${poem.id}-${lineIndex}`}>
                {Array.from(line).map((character, characterIndex) => (
                  <motion.span
                    key={`${line}-${characterIndex}`}
                    initial={
                      reduce
                        ? false
                        : useBlur
                          ? { opacity: 0, filter: `blur(${blurPx}px)` }
                          : { opacity: 0 }
                    }
                    animate={
                      useBlur
                        ? { opacity: 1, filter: "blur(0px)" }
                        : { opacity: 1 }
                    }
                    transition={{
                      delay: charDelay(lineIndex, characterIndex, lines),
                      duration: HERO_CHOREO.lines.duration,
                      ease: EASE,
                    }}
                  >
                    {character}
                  </motion.span>
                ))}
              </p>
            ))}
          </div>
        </div>

        {/* CTA：绝对右下，不参与居中 */}
        <motion.div
          className="hero-actions"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                delayChildren: ctaDelay,
                staggerChildren: HERO_CHOREO.actions.childStagger,
              },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: HERO_CHOREO.actions.duration,
                  ease: EASE,
                },
              },
            }}
          >
            <Link href={`/poem/${poem.id}`} className="hero-action-primary">
              <span>展开阅读</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: HERO_CHOREO.actions.duration,
                  ease: EASE,
                },
              },
            }}
          >
            <Link href="/poems" className="hero-action-secondary">
              阅览诗卷
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Opacity entrance on outer; y-loop on inner to avoid conflicting animate keys */}
      <motion.a
        className="scroll-cue"
        href="#featured"
        aria-label="向下浏览"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: cueDelay,
          duration: HERO_CHOREO.scrollCue.duration,
          ease: EASE,
        }}
      >
        <motion.span
          aria-hidden="true"
          style={{ display: "grid", placeItems: "center" }}
          animate={reduce ? undefined : { y: [0, 7, 0] }}
          transition={
            reduce
              ? undefined
              : {
                  delay: cueDelay + HERO_CHOREO.scrollCue.duration,
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }
          }
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </motion.span>
      </motion.a>
    </section>
  );
}
