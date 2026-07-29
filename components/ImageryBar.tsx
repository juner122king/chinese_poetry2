"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { PoemTheme } from "@/lib/types";
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

const VIEWPORT = { once: true, margin: "-8% 0px -8% 0px" } as const;

/**
 * 意境卡 —— hover/focus 动效与诗卷卡片一致（壳体 + PoemCardAtmosphere）。
 * 静置仅标题；选中显意境词与右下篇数。
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
      <PoemCardAtmosphere theme={theme} active={active} reduce={!!reduce} />
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.75, delay, ease }}
    >
      {body}
    </motion.li>
  );
}
