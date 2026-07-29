"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem } from "@/lib/types";
import { resolveOpeningDisplayLines } from "@/lib/opening-quotes";
import { getThemeVisual } from "@/lib/theme-map";
import { useScript } from "./ScriptProvider";
import PoemCardAtmosphere from "./PoemCardAtmosphere";

type Props = {
  poem: Poem;
  index?: number;
  className?: string;
};

const CARD_MOTIF_MAX = 3;

export default function PoemCard({ poem, index = 0, className = "" }: Props) {
  const { t, tPoem } = useScript();
  const display = tPoem(poem);
  const reduce = useReducedMotion();
  const enterDelay = Math.min(index, 8) * 0.05;
  // 下标以原文 content 为准；粘合后整行做繁简
  const excerpts = resolveOpeningDisplayLines(poem).map((line) => t(line));
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
      className={`group flex break-inside-avoid mb-6 flex-col ${className}`}
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
        className="flex h-full min-h-0 flex-col rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div
          className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-sm border border-rule-faint bg-rule-wash px-6 pb-7 pt-7 backdrop-blur-[2px] transition-[border-color,background-color,transform,box-shadow] duration-[1.15s] ease-[cubic-bezier(0.22,1,0.36,1)] md:px-7 md:pb-8 md:pt-8"
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
            seed={poem.id}
          />

          {/* 题：固定两行槽，避免长短题拉高卡片 */}
          <h3
            title={display.title}
            className="relative z-[1] type-card-title mb-2.5 line-clamp-2 min-h-[2.6em] break-words text-xl leading-snug md:min-h-[2.7em] md:text-[1.35rem]"
          >
            {display.title}
          </h3>

          {/* 作者 · 朝代 同行 */}
          <p className="relative z-[1] flex min-w-0 shrink-0 items-baseline gap-x-2.5 text-sm">
            <span className="type-author min-w-0 truncate">{display.author}</span>
            <span className="type-dynasty shrink-0">{display.dynasty}</span>
          </p>

          {/* 摘句：占满中段，两视觉行槽，过长截断 */}
          <div className="relative z-[1] mt-4 flex min-h-[2.75rem] flex-1 flex-col justify-start gap-y-1.5 opacity-75 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 md:min-h-[3rem]">
            {excerpts.map((line) => (
              <p
                key={line}
                className="type-card-excerpt line-clamp-2 break-words leading-relaxed"
              >
                {line}
              </p>
            ))}
          </div>

          {/* 意象题跋：底栏固定槽，无意象也占位以齐高 */}
          <div className="relative z-[1] mt-5 min-h-[1.25rem] opacity-55 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 md:min-h-[1.35rem]">
            {cardMotifs.length > 0 ? (
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
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
