"use client";

import { type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { getTagLabel, taxonomyById } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import { getThemeVisual } from "@/lib/theme-map";
import type { PoemTag } from "@/lib/types";
import { ATMOS_ENTER, ATMOS_EXIT } from "@/lib/atmosphere-timing";
import { useHoverFocusActive } from "@/lib/use-hover-focus-active";
import PoemCardAtmosphere from "./PoemCardAtmosphere";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

/** 首页意境入门：六道，克制入口，不做成仪表盘 */
const GATES: PoemTag[] = [
  "spring",
  "moon",
  "parting",
  "frontier",
  "rain",
  "wine",
];

type Props = {
  counts: Partial<Record<PoemTag, number>>;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "-8% 0px -8% 0px" } as const;

const MotionGate = motion.create(Link);

function GateCard({
  tag,
  count,
  delay,
  reduce,
  t,
}: {
  tag: PoemTag;
  count: number;
  delay: number;
  reduce: boolean | null;
  t: (s: string) => string;
}) {
  const meta = taxonomyById[tag];
  const visual = getThemeVisual(meta.defaultTheme);
  const motifs = meta.motifPool.slice(0, 2);
  const { active, onPointerEnter, onPointerLeave, onFocus, onBlur } =
    useHoverFocusActive();

  const shellStyle = {
    ...(active
      ? {
          backgroundColor: "transparent",
          boxShadow: reduce
            ? undefined
            : `0 14px 44px -22px color-mix(in srgb, ${visual.glow} 50%, transparent)`,
          transform: reduce ? undefined : "translateY(-2px)",
        }
      : undefined),
  } as CSSProperties;

  return (
    <li>
      <MotionGate
        href={buildPoemsHref({ tag })}
        className={`imagery-band__gate${active ? " is-active" : ""}`}
        style={shellStyle}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: reduce ? 0 : 0.8, delay, ease }}
      >
        <PoemCardAtmosphere
          theme={meta.defaultTheme}
          active={active}
          reduce={!!reduce}
          seed={`gate:${tag}`}
          enterDuration={ATMOS_ENTER}
          exitDuration={ATMOS_EXIT}
        />
        <motion.span
          className="imagery-band__label"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{
            duration: reduce ? 0 : 0.6,
            delay: reduce ? 0 : delay + 0.12,
            ease,
          }}
        >
          {t(getTagLabel(tag))}
        </motion.span>
        {motifs.length > 0 ? (
          <p
            className="imagery-band__motifs"
            style={{ opacity: active ? 1 : 0 }}
            aria-label={t("意境词")}
          >
            {motifs.map((motif, mi) => (
              <span key={`${motif}-${mi}`} className="imagery-band__motif">
                {mi > 0 ? (
                  <span className="imagery-band__dot" aria-hidden>
                    ·
                  </span>
                ) : null}
                <span>{t(motif)}</span>
              </span>
            ))}
          </p>
        ) : null}
        {count > 0 ? (
          <span
            className="imagery-band__count"
            style={{ opacity: active ? 1 : 0 }}
          >
            {t(`得 ${count} 篇`)}
          </span>
        ) : null}
      </MotionGate>
    </li>
  );
}

/**
 * 意境入门 —— 六道独立卡片。
 * hover 动效与诗卷 / 意境卡一致（PoemCardAtmosphere + 壳体；时长见 atmosphere-timing）。
 */
export default function HomeImageryGates({ counts }: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();

  return (
    <section className="relative px-6 pb-24 pt-20 md:px-10 md:pb-28 md:pt-24">
      <div className="relative z-10 mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-14 flex flex-col items-center md:mb-16">
            <span className="ink-rule mb-8" aria-hidden />
            <h2 className="type-group-label tracking-[0.55em]">
              {t("按 意 境 入 门")}
            </h2>
          </div>
        </ScrollReveal>

        <ul className="imagery-band">
          {GATES.map((tag, i) => (
            <GateCard
              key={tag}
              tag={tag}
              count={counts[tag] ?? 0}
              delay={i * 0.07}
              reduce={reduce}
              t={t}
            />
          ))}
        </ul>

        <ScrollReveal className="mt-12 text-center" delay={0.1}>
          <Link href="/imagery" className="text-link-elegant">
            {t("遍览意境")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
