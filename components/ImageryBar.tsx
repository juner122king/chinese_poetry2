"use client";

import { type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { PoemTheme } from "@/lib/types";
import { ATMOS_ENTER, ATMOS_EXIT } from "@/lib/atmosphere-timing";
import { useHoverFocusActive } from "@/lib/use-hover-focus-active";
import PoemCardAtmosphere from "./PoemCardAtmosphere";
import { useScript } from "./ScriptProvider";

type Props = {
  label: string;
  /** 本意境的篇数；0 则不作链接 */
  count: number;
  href: string | null;
  /** 意境词（motifPool 截取） */
  motifs: string[];
  theme: PoemTheme;
  glow: string;
  delay: number;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

/** 放宽入视口：避免首屏卡要滚很深才淡入、像点了没反应 */
const VIEWPORT = { once: true, amount: 0.05, margin: "0px 0px -5% 0px" } as const;

/**
 * 意境卡 —— hover/focus 动效与诗卷/首页入口一致（壳体 + PoemCardAtmosphere）。
 * 时长见 lib/atmosphere-timing；静置仅标题，选中显意境词与篇数。
 */
export default function ImageryBar({
  label,
  count,
  href,
  motifs,
  theme,
  glow,
  delay,
}: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();
  const { active, onPointerEnter, onPointerLeave, onFocus, onBlur } =
    useHoverFocusActive();

  const shellStyle = {
    ...(active
      ? {
          backgroundColor: "transparent",
          boxShadow: reduce
            ? undefined
            : `0 14px 44px -22px color-mix(in srgb, ${glow} 50%, transparent)`,
          transform: reduce ? undefined : "translateY(-2px)",
        }
      : undefined),
  } as CSSProperties;

  const face = (
    <>
      <PoemCardAtmosphere
        theme={theme}
        active={active}
        reduce={!!reduce}
        seed={`tag:${label}`}
        enterDuration={ATMOS_ENTER}
        exitDuration={ATMOS_EXIT}
      />
      <span className="imagery-bar__label">{t(label)}</span>
      {motifs.length > 0 ? (
        <p
          className="imagery-bar__motifs"
          style={{ opacity: active ? 1 : 0 }}
          aria-label={t("意境词")}
        >
          {motifs.map((motif, i) => (
            <span key={`${motif}-${i}`} className="imagery-bar__motif">
              {i > 0 ? (
                <span className="imagery-bar__dot" aria-hidden>
                  ·
                </span>
              ) : null}
              <span>{t(motif)}</span>
            </span>
          ))}
        </p>
      ) : null}
      <span
        className="imagery-bar__count"
        style={{ opacity: active ? 1 : 0 }}
      >
        {count > 0 ? t(`得 ${count} 篇`) : t("暂无")}
      </span>
    </>
  );

  const interaction = {
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
  };

  const body = href ? (
    <Link
      href={href}
      className={`imagery-bar${active ? " is-active" : ""}`}
      style={shellStyle}
      {...interaction}
    >
      {face}
    </Link>
  ) : (
    <div
      className={`imagery-bar imagery-bar--empty${active ? " is-active" : ""}`}
      style={shellStyle}
    >
      {face}
    </div>
  );

  if (reduce) return <li>{body}</li>;

  return (
    <motion.li
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.45, delay: Math.min(delay, 0.28), ease }}
      style={{ pointerEvents: "auto" }}
    >
      {body}
    </motion.li>
  );
}
