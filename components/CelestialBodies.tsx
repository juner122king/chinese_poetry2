"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import type { MoonForm, SunForm } from "@/lib/theme-map";
import { makeRng, rngRange, type Rng } from "@/lib/scene-seed";

type Props = {
  /** Explicit moon form; false/undefined = no moon */
  moon?: MoonForm;
  /** Explicit sun form; false/undefined = no sun */
  sun?: SunForm;
  /** 1 = full hero, 0.7 = soft, 卡片内再压 */
  scale?: number;
  glow?: string;
  /** 确定性构图种子（如 poem.id） */
  seed?: string;
  /** 卡片画布：限制日月直径相对容器高度 */
  card?: boolean;
};

function resolveSunForm(form: SunForm | undefined): "low" | "high" | "pale" | null {
  if (form === undefined || form === false) return null;
  return form;
}

type SunPlacement = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
};

function sampleSunPlacement(
  form: "low" | "high" | "pale",
  rng: Rng,
): SunPlacement {
  if (form === "low") {
    return {
      left: rngRange(rng, 8, 22),
      bottom: rngRange(rng, 12, 24),
      size: rngRange(rng, 155, 180),
    };
  }
  if (form === "high") {
    return {
      top: rngRange(rng, 6, 16),
      right: rngRange(rng, 6, 18),
      size: rngRange(rng, 115, 140),
    };
  }
  return {
    top: rngRange(rng, 8, 18),
    left: rngRange(rng, 10, 30),
    size: rngRange(rng, 90, 115),
  };
}

export type MoonVariant =
  | "default"
  | "warm"
  | "far"
  | "pastoral"
  | "mountain"
  | "river"
  | "crescent";

type MoonBase = {
  size: number;
  opacity: number;
  halo: number;
  haloH: number;
  blur: number;
  bloom: number;
  core: number;
  discHx: number;
  discHy: number;
  termX: number;
  termY: number;
  termOp: number;
  warm: boolean;
  riverTint: boolean;
  ellipseHalo: boolean;
  reflection: boolean;
  scaleX: number;
};

/** Absolute sky slot — sampled in a wide safe band per variant */
type MoonPlacement = {
  top: number;
  side: "left" | "right";
  /** % inset from left or right edge */
  inset: number;
};

type MoonJitter = {
  placement: MoonPlacement;
  scaleMul: number;
  opacityMul: number;
  haloMul: number;
  blurAdd: number;
  bloomMul: number;
  coreAdd: number;
  termX: number;
  termY: number;
  termOp: number;
  discHx: number;
  discHy: number;
};

/**
 * Wide sky region per form — avoid center column so vertical text stays clear.
 */
function sampleMoonPlacement(v: MoonVariant, rng: Rng): MoonPlacement {
  const roll = rng();
  switch (v) {
    case "warm":
      return {
        top: rngRange(rng, 6, 16),
        side: "right",
        inset: rngRange(rng, 12, 32),
      };
    case "far":
      return {
        top: rngRange(rng, 4, 14),
        side: roll < 0.38 ? "left" : "right",
        inset: roll < 0.38 ? rngRange(rng, 4, 16) : rngRange(rng, 4, 20),
      };
    case "pastoral":
      return {
        top: rngRange(rng, 5, 16),
        side: roll < 0.35 ? "left" : "right",
        inset: roll < 0.35 ? rngRange(rng, 8, 20) : rngRange(rng, 6, 26),
      };
    case "mountain":
      return {
        top: rngRange(rng, 12, 28),
        side: roll < 0.4 ? "left" : "right",
        inset: roll < 0.4 ? rngRange(rng, 6, 18) : rngRange(rng, 6, 24),
      };
    case "river":
      return {
        top: rngRange(rng, 32, 52),
        side: roll < 0.42 ? "left" : "right",
        inset: roll < 0.42 ? rngRange(rng, 6, 20) : rngRange(rng, 6, 24),
      };
    case "crescent":
      return {
        top: rngRange(rng, 5, 16),
        side: roll < 0.36 ? "left" : "right",
        inset: roll < 0.36 ? rngRange(rng, 8, 22) : rngRange(rng, 8, 28),
      };
    default:
      return {
        top: rngRange(rng, 5, 18),
        side: roll < 0.35 ? "left" : "right",
        inset: roll < 0.35 ? rngRange(rng, 6, 22) : rngRange(rng, 6, 28),
      };
  }
}

function sampleMoonJitter(v: MoonVariant, rng: Rng): MoonJitter {
  return {
    placement: sampleMoonPlacement(v, rng),
    scaleMul: rngRange(rng, 0.96, 1.05),
    opacityMul: rngRange(rng, 0.96, 1.04),
    haloMul: rngRange(rng, 0.92, 1.1),
    blurAdd: rngRange(rng, -1.5, 2),
    bloomMul: rngRange(rng, 0.94, 1.08),
    coreAdd: rngRange(rng, -2, 2.2),
    termX: rngRange(rng, v === "crescent" ? -6 : -4, v === "crescent" ? 5 : 4),
    termY: rngRange(rng, -4, 4),
    termOp: rngRange(rng, -0.04, 0.05),
    discHx: rngRange(rng, -3, 3),
    discHy: rngRange(rng, -3, 3),
  };
}

function resolveMoonVariant(form: MoonForm | undefined): MoonVariant | null {
  if (form === undefined || form === false) return null;
  return form;
}

function moonBase(v: MoonVariant): MoonBase {
  switch (v) {
    case "warm":
      return {
        size: 0.95,
        opacity: 1,
        halo: 220,
        haloH: 220,
        blur: 8,
        bloom: 130,
        core: 42,
        discHx: 35,
        discHy: 32,
        termX: 70,
        termY: 60,
        termOp: 0.45,
        warm: true,
        riverTint: false,
        ellipseHalo: false,
        reflection: false,
        scaleX: 1,
      };
    case "far":
      return {
        size: 0.72,
        opacity: 0.85,
        halo: 200,
        haloH: 200,
        blur: 9,
        bloom: 125,
        core: 42,
        discHx: 35,
        discHy: 32,
        termX: 70,
        termY: 60,
        termOp: 0.42,
        warm: false,
        riverTint: false,
        ellipseHalo: false,
        reflection: false,
        scaleX: 1,
      };
    case "pastoral":
      return {
        size: 0.88,
        opacity: 0.92,
        halo: 280,
        haloH: 280,
        blur: 12,
        bloom: 160,
        core: 38,
        discHx: 35,
        discHy: 32,
        termX: 70,
        termY: 60,
        termOp: 0.4,
        warm: false,
        riverTint: false,
        ellipseHalo: false,
        reflection: false,
        scaleX: 1,
      };
    case "mountain":
      return {
        size: 0.82,
        opacity: 0.9,
        halo: 195,
        haloH: 195,
        blur: 7,
        bloom: 118,
        core: 40,
        discHx: 34,
        discHy: 30,
        termX: 68,
        termY: 58,
        termOp: 0.48,
        warm: false,
        riverTint: false,
        ellipseHalo: false,
        reflection: false,
        scaleX: 1,
      };
    case "river":
      return {
        size: 0.78,
        opacity: 0.88,
        halo: 240,
        haloH: 160,
        blur: 11,
        bloom: 135,
        core: 40,
        discHx: 36,
        discHy: 34,
        termX: 65,
        termY: 55,
        termOp: 0.4,
        warm: false,
        riverTint: true,
        ellipseHalo: true,
        reflection: true,
        scaleX: 1,
      };
    case "crescent":
      return {
        size: 0.85,
        opacity: 0.9,
        halo: 200,
        haloH: 200,
        blur: 9,
        bloom: 120,
        core: 40,
        discHx: 28,
        discHy: 30,
        termX: 78,
        termY: 48,
        termOp: 0.72,
        warm: false,
        riverTint: false,
        ellipseHalo: false,
        reflection: false,
        scaleX: 0.96,
      };
    default:
      return {
        size: 1,
        opacity: 1,
        halo: 220,
        haloH: 220,
        blur: 8,
        bloom: 130,
        core: 42,
        discHx: 35,
        discHy: 32,
        termX: 70,
        termY: 60,
        termOp: 0.45,
        warm: false,
        riverTint: false,
        ellipseHalo: false,
        reflection: false,
        scaleX: 1,
      };
  }
}

/**
 * Layered moon / sun for Eastern ink scenes.
 * Seven moon forms + SunForm；构图由 seed 决定，首帧即定稿、无跳变。
 */
export default function CelestialBodies({
  moon,
  sun,
  scale = 1,
  glow = "rgba(220,230,255,0.25)",
  seed = "celestial",
  card = false,
}: Props) {
  const variant = resolveMoonVariant(moon);
  const sunForm = resolveSunForm(sun);

  const jitter = useMemo(() => {
    if (!variant) return null;
    return sampleMoonJitter(variant, makeRng(`${seed}:moon:${variant}`));
  }, [variant, seed]);

  const sunPlace = useMemo(() => {
    if (!sunForm) return null;
    return sampleSunPlacement(sunForm, makeRng(`${seed}:sun:${sunForm}`));
  }, [sunForm, seed]);

  if (!variant && !sunForm) return null;

  const sunLow = sunForm === "low";
  const sunHigh = sunForm === "high";
  const sunPale = sunForm === "pale";

  let moonNode: ReactNode = null;
  if (variant && jitter) {
    const base = moonBase(variant);
    const j = jitter;
    // 卡片内 cap 相对高度，避免糊满整格
    const rawSize = 120 * scale * base.size * j.scaleMul;
    const sizePx = card ? Math.min(rawSize, 28) : rawSize;
    const opacity = Math.min(1, Math.max(0.72, base.opacity * j.opacityMul));
    const halo = base.halo * j.haloMul;
    const haloH = base.haloH * j.haloMul;
    const blur = Math.max(5, base.blur + j.blurAdd);
    const bloom = base.bloom * j.bloomMul;
    const core = Math.max(34, Math.min(46, base.core + j.coreAdd));
    const discHx = base.discHx + j.discHx;
    const discHy = base.discHy + j.discHy;
    const termX = base.termX + j.termX;
    const termY = base.termY + j.termY;
    const termOp = Math.min(0.85, Math.max(0.28, base.termOp + j.termOp));

    const place = j.placement;
    const pos: CSSProperties = {
      top: `${place.top}%`,
      ...(place.side === "left"
        ? { left: `${place.inset}%` }
        : { right: `${place.inset}%` }),
    };

    const outerGlow = base.warm
      ? `radial-gradient(circle, rgba(220,160,160,0.2) 0%, ${glow} 25%, transparent 68%)`
      : base.riverTint
        ? `radial-gradient(ellipse 70% 55% at 50% 50%, rgba(160,200,220,0.2) 0%, ${glow} 30%, transparent 72%)`
        : variant === "pastoral"
          ? `radial-gradient(circle, rgba(230,238,255,0.28) 0%, ${glow} 32%, transparent 72%)`
          : `radial-gradient(circle, rgba(230,235,255,0.22) 0%, ${glow} 28%, transparent 70%)`;

    const midBloom = base.warm
      ? "radial-gradient(circle, rgba(255,230,230,0.28) 0%, rgba(200,140,140,0.08) 50%, transparent 72%)"
      : base.riverTint
        ? "radial-gradient(circle, rgba(220,240,250,0.3) 0%, rgba(140,180,200,0.1) 48%, transparent 75%)"
        : variant === "pastoral"
          ? "radial-gradient(circle, rgba(245,250,255,0.38) 0%, rgba(180,200,230,0.14) 48%, transparent 75%)"
          : "radial-gradient(circle, rgba(245,248,255,0.32) 0%, rgba(180,195,220,0.1) 48%, transparent 72%)";

    const disc = base.warm
      ? `radial-gradient(circle at ${discHx}% ${discHy}%, #f8ece8 0%, #e8d0c8 42%, #c8a898 78%, #a88880 100%)`
      : base.riverTint
        ? `radial-gradient(circle at ${discHx}% ${discHy}%, #eef4f8 0%, #d8e6ee 40%, #b0c8d4 75%, #8aa8b8 100%)`
        : `radial-gradient(circle at ${discHx}% ${discHy}%, #f4f6fa 0%, #e4eaf2 40%, #c5cedd 75%, #9aabc0 100%)`;

    const discShadow = base.warm
      ? "0 0 24px 6px rgba(220,160,150,0.25), inset 0 0 12px rgba(255,255,255,0.35)"
      : variant === "pastoral"
        ? "0 0 36px 14px rgba(190,210,240,0.28), inset 0 0 14px rgba(255,255,255,0.4)"
        : base.riverTint
          ? "0 0 26px 8px rgba(140,180,200,0.2), inset 0 0 12px rgba(255,255,255,0.35)"
          : "0 0 28px 8px rgba(200,215,240,0.22), inset 0 0 14px rgba(255,255,255,0.4)";

    // Crescent: soft dark veil; full: light rim only
    const termBg =
      variant === "crescent"
        ? `radial-gradient(circle at ${termX}% ${termY}%, transparent 18%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.72) 100%)`
        : `radial-gradient(circle at ${termX}% ${termY}%, transparent 45%, rgba(0,0,0,0.12) 100%)`;

    moonNode = (
      <div
        className="celestial-moon absolute"
        style={{
          ...pos,
          width: sizePx,
          height: sizePx,
          opacity,
          transform: base.scaleX !== 1 ? `scaleX(${base.scaleX})` : undefined,
        }}
      >
        {/* Outer halo */}
        <div
          className="celestial-moon-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${halo}%`,
            height: `${haloH}%`,
            background: outerGlow,
            filter: `blur(${blur}px)`,
          }}
        />
        {/* Mid bloom */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${bloom}%`,
            height: `${bloom}%`,
            background: midBloom,
            filter: "blur(2px)",
          }}
        />
        {/* Solid disc */}
        <div
          className="celestial-moon-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${core}%`,
            height: `${core}%`,
            background: disc,
            boxShadow: discShadow,
          }}
        />
        {/* Terminator / soft dark limb */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${core}%`,
            height: `${core}%`,
            background: termBg,
            mixBlendMode: "multiply",
            opacity: termOp,
          }}
        />
        {/* River: faint water reflection under moon */}
        {base.reflection && (
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 rounded-full"
            style={{
              width: "70%",
              height: "55%",
              marginTop: "18%",
              opacity: 0.1,
              filter: "blur(10px)",
              background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${glow} 0%, rgba(160,200,220,0.15) 40%, transparent 72%)`,
              transform: "scaleY(0.45)",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {moonNode}

      {sunForm && sunPlace && (() => {
        const place = sunPlace;
        const rawDim = place.size * scale;
        const dim = card ? Math.min(rawDim, 32) : rawDim;
        const pos: CSSProperties = {
          width: dim,
          height: dim,
          opacity: sunPale ? 0.72 : 1,
        };
        if (place.top != null) pos.top = `${place.top}%`;
        if (place.bottom != null) pos.bottom = `${place.bottom}%`;
        if (place.left != null) pos.left = `${place.left}%`;
        if (place.right != null) pos.right = `${place.right}%`;

        return (
          <div className="celestial-sun absolute" style={pos}>
            {sunLow && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: "300%",
                  height: "170%",
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(180,100,50,0.12) 0%, rgba(160,80,60,0.05) 40%, transparent 68%)",
                  filter: "blur(20px)",
                }}
              />
            )}
            {sunHigh && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: "240%",
                  height: "240%",
                  background:
                    "radial-gradient(circle, rgba(220,190,100,0.1) 0%, transparent 65%)",
                  filter: "blur(16px)",
                }}
              />
            )}

            <div
              className="celestial-sun-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: sunPale ? "200%" : sunLow ? "175%" : "165%",
                height: sunPale ? "200%" : sunLow ? "175%" : "165%",
                background: sunLow
                  ? "radial-gradient(circle, rgba(200,140,80,0.28) 0%, rgba(150,90,50,0.1) 42%, transparent 70%)"
                  : sunHigh
                    ? "radial-gradient(circle, rgba(230,200,100,0.26) 0%, rgba(180,140,50,0.08) 45%, transparent 70%)"
                    : "radial-gradient(circle, rgba(210,200,160,0.14) 0%, rgba(160,150,120,0.05) 48%, transparent 72%)",
                filter: `blur(${sunPale ? 8 : 5}px)`,
              }}
            />

            <div
              className="celestial-sun-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: sunPale ? "58%" : "68%",
                height: sunPale ? "58%" : "68%",
                background: sunLow
                  ? "radial-gradient(circle at 38% 34%, #f0d4a8 0%, #d4a060 40%, #a06838 76%, #704828 100%)"
                  : sunHigh
                    ? "radial-gradient(circle at 36% 32%, #f2e4a8 0%, #e0c060 45%, #c49840 88%)"
                    : "radial-gradient(circle at 36% 32%, #e8e0c8 0%, #d0c8a8 50%, #a8a080 92%)",
                boxShadow: sunLow
                  ? "0 0 28px 8px rgba(180,100,40,0.18)"
                  : sunHigh
                    ? "0 0 24px 8px rgba(200,160,50,0.16)"
                    : "0 0 18px 4px rgba(160,150,120,0.1)",
                opacity: sunPale ? 0.55 : sunLow ? 0.88 : 0.85,
              }}
            />
          </div>
        );
      })()}
    </>
  );
}
