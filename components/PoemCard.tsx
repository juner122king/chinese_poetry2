"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem } from "@/lib/types";
import { toDisplayLines, type DisplayLine } from "@/lib/poem-lines";
import { getThemeVisual } from "@/lib/theme-map";
import { useScript } from "./ScriptProvider";
import PoemCardAtmosphere from "./PoemCardAtmosphere";

type Props = {
  poem: Poem;
  index?: number;
  className?: string;
};

const CARD_MOTIF_MAX = 3;
const CARD_EXCERPT_MAX_LINES = 2;

/**
 * 摘句取第一个完整句读单元 —— 到首个句号为止。
 * 宁可少取一行，也不让诗句被省略号从中间截断。
 */
function firstSentence(lines: DisplayLine[]): DisplayLine[] {
  const out: DisplayLine[] = [];
  for (const line of lines) {
    out.push(line);
    if (line.break === "stop" || out.length >= CARD_EXCERPT_MAX_LINES) break;
  }
  return out;
}

export default function PoemCard({ poem, index = 0, className = "" }: Props) {
  const { t, tPoem } = useScript();
  const display = tPoem(poem);
  const reduce = useReducedMotion();
  const enterDelay = Math.min(index, 8) * 0.05;
  const excerpts = firstSentence(toDisplayLines(display.content));
  const cardMotifs = (display.motifs ?? []).filter(Boolean).slice(0, CARD_MOTIF_MAX);
  const visual = getThemeVisual(poem.theme);

  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const [active, setActive] = useState(false);

  const syncActive = useCallback(() => {
    setActive(hoveredRef.current || focusedRef.current);
  }, []);

  const onPointerEnter = useCallback(() => {
    hoveredRef.current = true;
    syncActive();
  }, [syncActive]);

  const onPointerLeave = useCallback(() => {
    hoveredRef.current = false;
    syncActive();
  }, [syncActive]);

  const onFocus = useCallback(() => {
    focusedRef.current = true;
    syncActive();
  }, [syncActive]);

  const onBlur = useCallback(() => {
    focusedRef.current = false;
    syncActive();
  }, [syncActive]);

  return (
    <motion.article
      className={`group break-inside-avoid mb-6 ${className}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        duration: 0.85,
        delay: reduce ? 0 : enterDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/poem/${poem.id}`}
        className="block rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div
          className="relative overflow-hidden rounded-sm border border-rule-faint bg-rule-wash px-6 pb-7 pt-7 backdrop-blur-[2px] transition-[border-color,background-color,transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-7 md:pb-8 md:pt-8"
          style={
            (active
              ? {
                  borderColor: `color-mix(in srgb, ${visual.accent} 40%, transparent)`,
                  backgroundColor: "transparent",
                  boxShadow: reduce
                    ? undefined
                    : `0 14px 44px -22px color-mix(in srgb, ${visual.glow} 50%, transparent)`,
                  transform: reduce ? undefined : "translateY(-2px)",
                }
              : undefined) as CSSProperties | undefined
          }
        >
          <PoemCardAtmosphere
            theme={poem.theme}
            active={active}
            reduce={!!reduce}
          />

          {/* 题：最多两行 */}
          <h3
            title={display.title}
            className="relative z-[1] type-card-title mb-2.5 line-clamp-2 break-words text-xl leading-snug md:text-[1.35rem]"
          >
            {display.title}
          </h3>

          {/* 作者 · 朝代 同行 */}
          <p className="relative z-[1] flex min-w-0 items-baseline gap-x-2.5 text-sm">
            <span className="type-author min-w-0 truncate">{display.author}</span>
            <span className="type-dynasty shrink-0">{display.dynasty}</span>
          </p>

          {/* 摘句常显；不定高，瀑布流参差本就正确 */}
          <div className="relative z-[1] mt-4 space-y-1.5 opacity-75 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100">
            {excerpts.map((line) => (
              <p key={line.raw} className="type-card-excerpt break-words">
                {line.text}
              </p>
            ))}
          </div>

          {/* 意象题跋：右下常显（触屏无 hover），hover / 聚焦提亮 */}
          {cardMotifs.length > 0 ? (
            <div className="relative z-[1] mt-5 opacity-55 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100">
              <p
                className="flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 font-wenkai text-[11px] tracking-[0.22em] text-[color:var(--type-quiet)] md:text-xs"
                aria-label={t("意象")}
              >
                {cardMotifs.map((motif, i) => (
                  <span
                    key={`${motif}-${i}`}
                    className="inline-flex items-center gap-x-1.5"
                  >
                    {i > 0 && (
                      <span
                        className="select-none text-[color:var(--type-faint)]"
                        aria-hidden
                      >
                        ·
                      </span>
                    )}
                    <span>{motif}</span>
                  </span>
                ))}
              </p>
            </div>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
