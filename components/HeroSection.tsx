"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import ThemeScene from "./ThemeScene";
import { useScript } from "./ScriptProvider";
import type { Poem } from "@/lib/types";
import { toDisplayLines, type DisplayLine } from "@/lib/poem-lines";

type Props = {
  poem: Poem;
};

/** Shared ease — matches --ease-elegant */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero text entrance timeline.
 * 诗题 → (+beat) → 作者区 → (+beat) → 诗句 → CTA → scroll-cue（最后呈现）
 * 「段」= 遇 stop（。！？）或文末收束的一组换行句；段内同时浮现，段间 0.7s。
 * 一字一 span 仅布局，不逐字动画。
 */
const HERO_CHOREO = {
  beat: 0.9,
  title: { delay: 0.25, duration: 1.2, y: 12 },
  kicker: { duration: 1.0 },
  lines: {
    /** 隔行段之间的起拍间隔（用户指定） */
    segmentStagger: 1.35,
    /** 单段 fade；不用 filter blur（滚动/入场时 GPU 压力大） */
    duration: 1.15,
    y: 10,
  },
  actions: {
    /**
     * CTA 对齐「超出区域 mask 渐隐」：
     * 有溢出 → 可见区内末段入场 fade 结束；无溢出 → 全文末段 fade 结束。
     */
    duration: 1.05,
    childStagger: 0.1,
  },
  /** 下箭头：CTA 入场完全结束后再出，作为整段入场的收束 */
  scrollCue: { afterActions: 2.15, duration: 0.9 },
} as const;

const titleDelay = HERO_CHOREO.title.delay;
const kickerDelay = titleDelay + HERO_CHOREO.beat;
const linesStart = titleDelay + HERO_CHOREO.beat * 2;

/**
 * 按 stop 句读分组为隔行段；返回每行 delay（段内相同）。
 */
function buildStopSegmentTimeline(displayLines: DisplayLine[]) {
  const { segmentStagger } = HERO_CHOREO.lines;
  const n = displayLines.length;
  const delays = new Array<number>(n).fill(linesStart);

  if (n === 0) return { delays };

  let segmentIndex = 0;

  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1;
    delays[i] = linesStart + segmentIndex * segmentStagger;

    // stop 或文末：当前隔行段结束
    if (displayLines[i].break === "stop" || isLast) {
      if (!isLast) segmentIndex++;
    }
  }

  return { delays };
}

/**
 * 可见区内最后一行下标（与 clip 相交的最后一列/行）。
 * 相对 lines 容器用 getBoundingClientRect，避免 offsetParent 偏差。
 */
function lastVisibleLineIndex(
  linesEl: HTMLElement,
  overflowing: boolean,
  clipLimitPx: number | null,
  mobile: boolean,
): number {
  const children = Array.from(linesEl.children) as HTMLElement[];
  if (children.length === 0) return 0;
  if (!overflowing || clipLimitPx == null) return children.length - 1;

  const parentRect = linesEl.getBoundingClientRect();
  let last = 0;
  for (let i = 0; i < children.length; i++) {
    const r = children[i]!.getBoundingClientRect();
    if (mobile) {
      const top = r.top - parentRect.top;
      if (top < clipLimitPx) last = i;
      else break;
    } else {
      const left = r.left - parentRect.left;
      if (left < clipLimitPx) last = i;
      else break;
    }
  }
  return last;
}

/** 由可见末行 delay + 单段 duration 得到 CTA 绝对时刻（mount 起算，秒） */
function ctaAtFromVisible(
  delays: number[],
  lastVisibleIdx: number,
  duration: number,
): number {
  if (delays.length === 0) return linesStart + duration;
  const idx = Math.min(Math.max(0, lastVisibleIdx), delays.length - 1);
  return delays[idx]! + duration;
}

function heroColumnGapClass(breakType: DisplayLine["break"], isLast: boolean) {
  if (isLast) return "hero-line hero-line-last";
  switch (breakType) {
    case "pause":
      return "hero-line hero-line-pause";
    case "stop":
      return "hero-line hero-line-stop";
    default:
      return "hero-line hero-line-none";
  }
}

/**
 * 正文 clip 上限随行数略增；只改正文可用宽，不移标题。
 * 短诗通常到不了上限（贴合实宽）。
 */
const HERO_LAYOUT = {
  lineShort: 4,
  lineLong: 16,
  clipMaxMin: 420,
  clipMaxMax: 960,
  /** 桌面正文可用宽相对视口：短 → 长（最长 85% 页宽） */
  desktopWidthRatio: 0.68,
  desktopWidthRatioLong: 0.78,
  mobileMaxHeightMin: 240,
  mobileMaxHeightMax: 420,
  /** 移动正文可用高相对视口上限 */
  mobileHeightRatio: 0.5,
  /** 题–作者–文 gap（px）：短从容 → 长收紧 */
  gapShort: 64,
  gapLong: 40,
  /** 诗组右侧 margin（px）：长文略减，给正文让位 */
  marginEndShort: 130,
  marginEndLong: 48,
  /** 淡区占 clip 主尺寸比例（与容量同比） */
  fadeRatio: 0.32,
  /** 淡区内半透明拐点（相对淡区长度） */
  fadeMidRatio: 0.38,
  fadeMinPx: 72,
  fadeMaxPx: 280,
} as const;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function densityFromLineCount(lineCount: number) {
  const { lineShort, lineLong } = HERO_LAYOUT;
  return clamp01((lineCount - lineShort) / (lineLong - lineShort));
}

function layoutTFrom(lineCount: number, overflowing: boolean) {
  const density = densityFromLineCount(lineCount);
  return overflowing ? Math.max(density, 0.75) : density;
}

function clipMaxForT(t: number) {
  return Math.round(
    lerp(HERO_LAYOUT.clipMaxMin, HERO_LAYOUT.clipMaxMax, t),
  );
}

function desktopWidthRatioForT(t: number) {
  return lerp(
    HERO_LAYOUT.desktopWidthRatio,
    HERO_LAYOUT.desktopWidthRatioLong,
    t,
  );
}

function mobileMaxHeightForT(t: number) {
  return Math.round(
    lerp(HERO_LAYOUT.mobileMaxHeightMin, HERO_LAYOUT.mobileMaxHeightMax, t),
  );
}

function poemGapForT(t: number) {
  return Math.round(lerp(HERO_LAYOUT.gapShort, HERO_LAYOUT.gapLong, t));
}

function poemMarginEndForT(t: number) {
  return Math.round(
    lerp(HERO_LAYOUT.marginEndShort, HERO_LAYOUT.marginEndLong, t),
  );
}

/** 由 clip 主尺寸推导淡区，与容量同一套参数 */
function fadeMetrics(sizePx: number): { fadeOutPx: number; fadeMidPx: number } {
  const fadeOutPx = clamp(
    Math.round(sizePx * HERO_LAYOUT.fadeRatio),
    HERO_LAYOUT.fadeMinPx,
    HERO_LAYOUT.fadeMaxPx,
  );
  const fadeMidPx = Math.max(
    24,
    Math.round(fadeOutPx * HERO_LAYOUT.fadeMidRatio),
  );
  return { fadeOutPx, fadeMidPx };
}

type ClipLayout = {
  /** 桌面：clip 像素宽；移动：不用宽 */
  widthPx: number | null;
  /** 移动：clip 像素高上限 */
  maxHeightPx: number | null;
  overflowing: boolean;
  /** 距末端开始离开全实；未溢出为 null */
  fadeOutPx: number | null;
  fadeMidPx: number | null;
};

function clipLayoutsEqual(a: ClipLayout, b: ClipLayout) {
  return (
    a.widthPx === b.widthPx &&
    a.maxHeightPx === b.maxHeightPx &&
    a.overflowing === b.overflowing &&
    a.fadeOutPx === b.fadeOutPx &&
    a.fadeMidPx === b.fadeMidPx
  );
}

export default function HeroSection({ poem }: Props) {
  const ref = useRef<HTMLElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { t, tPoem, mode } = useScript();
  const display = tPoem(poem);

  /** 稳定 key：避免 tPoem 每次新数组引用触发 effect 死循环 */
  const contentKey = `${poem.id}:${mode}:${poem.content.join("\u0001")}`;
  const displayLines = useMemo(
    () => toDisplayLines(display.content),
    // display 随 mode/contentKey 更新；不依赖 display.content 引用
    // eslint-disable-next-line react-hooks/exhaustive-deps -- contentKey 覆盖内容与简繁
    [contentKey],
  );
  const lineTimeline = useMemo(
    () => buildStopSegmentTimeline(displayLines),
    [displayLines],
  );
  const [clipLayout, setClipLayout] = useState<ClipLayout>({
    widthPx: null,
    maxHeightPx: null,
    overflowing: false,
    fadeOutPx: null,
    fadeMidPx: null,
  });
  /** CTA 绝对时刻（秒，mount 起算）；null = 尚未量完 clip */
  const [ctaAtSec, setCtaAtSec] = useState<number | null>(null);
  const [ctaShow, setCtaShow] = useState(false);
  const [cueShow, setCueShow] = useState(false);
  const mountAtRef = useRef(
    typeof performance !== "undefined" ? performance.now() : 0,
  );

  useLayoutEffect(() => {
    mountAtRef.current = performance.now();
    setCtaShow(!!reduce);
    setCueShow(!!reduce);
    setCtaAtSec(null);
  }, [contentKey, reduce]);

  useLayoutEffect(() => {
    const linesEl = linesRef.current;
    if (!linesEl) return;

    const lineCount = displayLines.length;
    const delays = lineTimeline.delays;
    const lineDuration = HERO_CHOREO.lines.duration;

    const applyClip = (next: ClipLayout) => {
      setClipLayout((prev) => (clipLayoutsEqual(prev, next) ? prev : next));
    };

    const measure = () => {
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      const density = densityFromLineCount(lineCount);

      if (mobile) {
        // 先按密度估上限，溢出则抬 layoutT 再算一次
        let t = density;
        let maxH = Math.min(
          mobileMaxHeightForT(t),
          window.innerHeight * HERO_LAYOUT.mobileHeightRatio,
        );
        const contentH = linesEl.scrollHeight;
        const wouldOverflow = contentH > maxH + 1;
        t = layoutTFrom(lineCount, wouldOverflow);
        maxH = Math.min(
          mobileMaxHeightForT(t),
          window.innerHeight * HERO_LAYOUT.mobileHeightRatio,
        );
        const overflowing = contentH > maxH + 1;
        const roundedH = Math.round(maxH);
        const fade = overflowing ? fadeMetrics(roundedH) : null;
        applyClip({
          widthPx: null,
          maxHeightPx: roundedH,
          overflowing,
          fadeOutPx: fade?.fadeOutPx ?? null,
          fadeMidPx: fade?.fadeMidPx ?? null,
        });
        const lastVis = lastVisibleLineIndex(
          linesEl,
          overflowing,
          roundedH,
          true,
        );
        setCtaAtSec(ctaAtFromVisible(delays, lastVis, lineDuration));
        return;
      }

      let t = density;
      let maxW = Math.min(
        clipMaxForT(t),
        window.innerWidth * desktopWidthRatioForT(t),
      );
      const contentW = linesEl.scrollWidth;
      const wouldOverflow = contentW > maxW + 1;
      t = layoutTFrom(lineCount, wouldOverflow);
      maxW = Math.min(
        clipMaxForT(t),
        window.innerWidth * desktopWidthRatioForT(t),
      );
      const widthPx = Math.round(Math.min(contentW, maxW));
      const overflowing = contentW > maxW + 1;
      const fade = overflowing ? fadeMetrics(widthPx) : null;
      applyClip({
        widthPx,
        maxHeightPx: null,
        overflowing,
        fadeOutPx: fade?.fadeOutPx ?? null,
        fadeMidPx: fade?.fadeMidPx ?? null,
      });
      const lastVis = lastVisibleLineIndex(
        linesEl,
        overflowing,
        widthPx,
        false,
      );
      setCtaAtSec(ctaAtFromVisible(delays, lastVis, lineDuration));
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(linesEl);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [contentKey, displayLines.length, lineTimeline.delays]);

  // CTA：与正文同一 mount 时钟，在 ctaAtSec（可见末段 fade 结束）呈现
  useEffect(() => {
    if (reduce) {
      setCtaShow(true);
      return;
    }
    if (ctaAtSec == null) return;
    const wait = Math.max(
      0,
      ctaAtSec * 1000 - (performance.now() - mountAtRef.current),
    );
    const id = window.setTimeout(() => setCtaShow(true), wait);
    return () => window.clearTimeout(id);
  }, [ctaAtSec, reduce, contentKey]);

  // scroll-cue：等 CTA 入场动画全部结束后再出（最后一拍）
  useEffect(() => {
    if (reduce) {
      setCueShow(true);
      return;
    }
    if (!ctaShow) return;
    const wait =
      (HERO_CHOREO.actions.duration + HERO_CHOREO.scrollCue.afterActions) *
      1000;
    const id = window.setTimeout(() => setCueShow(true), wait);
    return () => window.clearTimeout(id);
  }, [ctaShow, reduce, contentKey]);

  const layoutT = layoutTFrom(
    displayLines.length,
    clipLayout.overflowing,
  );

  const poemStyle = useMemo(() => {
    const style: CSSProperties & Record<string, string> = {
      "--hero-poem-gap": `${poemGapForT(layoutT)}px`,
      "--hero-poem-margin-end": `${poemMarginEndForT(layoutT)}px`,
    };
    return style;
  }, [layoutT]);

  const clipStyle = useMemo(() => {
    const style: CSSProperties & Record<string, string> = {};
    if (clipLayout.widthPx != null) {
      style["--hero-clip-w"] = `${clipLayout.widthPx}px`;
      style["--hero-clip-max"] = `${clipLayout.widthPx}px`;
    }
    if (clipLayout.maxHeightPx != null) {
      style["--hero-clip-max-h"] = `${clipLayout.maxHeightPx}px`;
    }
    if (
      clipLayout.overflowing &&
      clipLayout.fadeOutPx != null &&
      clipLayout.fadeMidPx != null
    ) {
      style["--hero-fade-out"] = `${clipLayout.fadeOutPx}px`;
      style["--hero-fade-mid"] = `${clipLayout.fadeMidPx}px`;
    }
    return style;
  }, [clipLayout]);

  const lineY = HERO_CHOREO.lines.y;

  function handleScrollCue(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = ref.current;
    const featured = document.getElementById("featured");
    const y = el
      ? el.offsetTop + el.offsetHeight
      : (featured?.offsetTop ?? 0);
    window.scrollTo({
      top: y,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <section ref={ref} className="hero-section noise-overlay">
      {/* 与读诗页相同：ThemeScene fixed 钉视口，仅意境背景；正文文档流滚动 */}
      <ThemeScene theme={poem.theme} seed={poem.id} />

      <div className="hero-content">
        <div className="hero-poem" style={poemStyle}>
          <motion.h1
            key={`hero-title-${contentKey}`}
            initial={reduce ? false : { opacity: 0, y: HERO_CHOREO.title.y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: HERO_CHOREO.title.delay,
              duration: HERO_CHOREO.title.duration,
              ease: EASE,
            }}
          >
            {display.title}
          </motion.h1>

          <motion.div
            key={`hero-kicker-${contentKey}`}
            className="hero-kicker"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: kickerDelay,
              duration: HERO_CHOREO.kicker.duration,
              ease: EASE,
            }}
          >
            <span className="hero-dynasty">{display.dynasty}</span>
            <span className="hero-kicker-rule" aria-hidden="true" />
            <span className="hero-author">{display.author}</span>
          </motion.div>

          <div
            className={`hero-lines-clip${clipLayout.overflowing ? " is-overflowing" : ""}`}
            style={clipStyle}
          >
            <div className="hero-lines" ref={linesRef}>
              {displayLines.map((line, lineIndex) => {
                const isLast = lineIndex === displayLines.length - 1;
                const chars = Array.from(line.text);
                const delay =
                  lineTimeline.delays[lineIndex] ?? linesStart;

                return (
                  <motion.p
                    key={`${display.id}-${lineIndex}-${line.raw}`}
                    className={heroColumnGapClass(line.break, isLast)}
                    initial={reduce ? false : { opacity: 0, y: lineY }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay,
                      duration: HERO_CHOREO.lines.duration,
                      ease: EASE,
                    }}
                  >
                    {/* 一字一 span：桌面竖排列的布局依赖，非逐字动画 */}
                    {chars.map((character, characterIndex) => (
                      <span key={`${line.raw}-${characterIndex}`}>
                        {character}
                      </span>
                    ))}
                  </motion.p>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div key={`hero-cta-${poem.id}`} className="hero-actions">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={
              ctaShow || reduce
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 6 }
            }
            transition={{
              duration: HERO_CHOREO.actions.duration,
              ease: EASE,
            }}
          >
            <Link href={`/poem/${poem.id}`} className="hero-action-primary">
              <span>{t("展卷细读")}</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        className="scroll-cue"
        href="#featured"
        aria-label={t("继续浏览")}
        onClick={handleScrollCue}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: cueShow || reduce ? 1 : 0 }}
        transition={{
          duration: HERO_CHOREO.scrollCue.duration,
          ease: EASE,
        }}
      >
        <motion.span
          aria-hidden="true"
          style={{ display: "grid", placeItems: "center" }}
          animate={
            reduce || !cueShow ? undefined : { y: [0, 7, 0] }
          }
          transition={
            reduce || !cueShow
              ? undefined
              : {
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
