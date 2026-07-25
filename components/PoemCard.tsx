"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem, PoemTag } from "@/lib/types";
import { toDisplayLines } from "@/lib/poem-lines";
import { getTagLabel, taxonomyById } from "@/lib/imagery-taxonomy";
import { getThemeVisual } from "@/lib/theme-map";
import { useScript } from "./ScriptProvider";
import PoemCardAtmosphere from "./PoemCardAtmosphere";

type Props = {
  poem: Poem;
  index?: number;
  className?: string;
};

const CARD_TAG_MAX = 3;

/** 按 taxonomy weight 取前 N 个意境标签 */
function topCardTags(tags: PoemTag[] | undefined, max = CARD_TAG_MAX): PoemTag[] {
  if (!tags?.length) return [];
  return [...tags]
    .sort(
      (a, b) =>
        (taxonomyById[b]?.weight ?? 0) - (taxonomyById[a]?.weight ?? 0),
    )
    .slice(0, max);
}

export default function PoemCard({ poem, index = 0, className = "" }: Props) {
  const { t, tPoem } = useScript();
  const display = tPoem(poem);
  const reduce = useReducedMotion();
  const enterDelay = Math.min(index, 8) * 0.05;
  const excerpts = toDisplayLines(display.content.slice(0, 2));
  const cardTags = topCardTags(poem.tags);
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
          className="relative overflow-hidden rounded-sm border border-xuan/10 bg-xuan/[0.03] px-6 pb-10 pt-7 backdrop-blur-[2px] transition-[border-color,background-color,transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-7 md:pb-11 md:pt-8"
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

          {/* 题：最多两行；字距用 type-card-title */}
          <h3
            title={display.title}
            className="relative z-[1] type-card-title mb-2.5 line-clamp-2 min-h-[2.75em] break-words text-xl leading-snug md:min-h-[2.7em] md:text-[1.35rem]"
          >
            {display.title}
          </h3>

          {/* 作者 · 朝代 同行 */}
          <p className="relative z-[1] flex min-w-0 items-baseline gap-x-2.5 text-sm">
            <span className="type-author min-w-0 truncate">{display.author}</span>
            <span className="type-dynasty shrink-0">{display.dynasty}</span>
          </p>

          {/* 摘句常显 */}
          <div className="relative z-[1] mt-4 min-h-[2.6rem] space-y-1.5 opacity-75 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100">
            {excerpts.map((line) => (
              <p key={line.raw} className="type-card-excerpt truncate">
                {line.text}
              </p>
            ))}
          </div>

          {/* 意境标签：右下，hover / 聚焦同显 */}
          {cardTags.length > 0 ? (
            <div className="pointer-events-none absolute bottom-5 right-5 z-[1] max-w-[calc(100%-2.5rem)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 md:right-6">
              <p
                className="type-quiet flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-1"
                aria-label={t("意境")}
              >
                {cardTags.map((tag, i) => (
                  <span key={tag} className="inline-flex items-center gap-x-1.5">
                    {i > 0 && (
                      <span
                        className="select-none text-[color:var(--type-faint)]"
                        aria-hidden
                      >
                        ·
                      </span>
                    )}
                    <span>{t(getTagLabel(tag))}</span>
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
