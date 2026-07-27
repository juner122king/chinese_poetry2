"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import type { PoemTheme } from "@/lib/types";
import {
  getThemeVisual,
  type CloudForm,
  type HorizonForm,
  type MountainForm,
} from "@/lib/theme-map";
import CelestialBodies from "./CelestialBodies";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type BirdLayout = {
  farSide: "left" | "right";
  farTop: number;
  farInset: number;
  nearSide: "left" | "right";
  nearBottom: number;
  nearInset: number;
};

type LanternSpot = {
  left: number;
  bottom: number;
  w: number;
  h: number;
  dur: number;
  delay: number;
  path: "a" | "b" | "c";
};

function sampleBirdLayout(): BirdLayout {
  return {
    farSide: Math.random() < 0.42 ? "left" : "right",
    farTop: rand(8, 20),
    farInset: rand(2, 12),
    nearSide: Math.random() < 0.5 ? "left" : "right",
    nearBottom: rand(18, 34),
    nearInset: rand(5, 16),
  };
}

function sampleLanterns(): LanternSpot[] {
  const paths: Array<"a" | "b" | "c"> = ["a", "b", "c"];
  const n = 8 + Math.floor(Math.random() * 4);
  const spots: LanternSpot[] = [];
  for (let i = 0; i < n; i++) {
    // Prefer lower thirds left/right — avoid center poem column
    const leftBand = Math.random() < 0.5;
    const left = leftBand ? rand(4, 32) : rand(68, 96);
    spots.push({
      left,
      bottom: rand(3, 24),
      w: rand(5, 10),
      h: rand(7, 13),
      dur: rand(40, 56),
      delay: rand(0, 16),
      path: paths[i % 3],
    });
  }
  return spots;
}

type Props = {
  theme?: PoemTheme;
  className?: string;
  intensity?: "soft" | "full";
};

type MountainPaths = {
  far: string;
  mid?: string;
  near: string;
  heightClass: string;
  opacity: number;
  farFill: string;
  midFill?: string;
  nearFill: string;
  /** CSS blur on far ridge (ink wash) */
  farBlur?: number;
  midBlur?: number;
  /** Foot haze under near ridge — soft dissolve into ground */
  footHaze?: boolean;
};

/**
 * Ink-wash mountain silhouettes: long curves, sparse major rises,
 * atmospheric layers — not zig-zag cartoon peaks.
 */
const MOUNTAIN_FORMS: Record<Exclude<MountainForm, "none">, MountainPaths> = {
  distant: {
    far: "M0,400 L0,308 C200,292 360,278 540,288 C740,300 920,268 1120,282 C1280,292 1380,278 1440,284 L1440,400 Z",
    mid: "M0,400 L0,332 C220,320 460,312 720,322 C980,332 1200,316 1440,324 L1440,400 Z",
    near: "M0,400 L0,354 C260,346 520,350 780,348 C1040,346 1260,352 1440,350 L1440,400 Z",
    heightClass: "h-[36%]",
    opacity: 0.32,
    farFill: "rgba(28,36,48,0.32)",
    midFill: "rgba(18,24,34,0.4)",
    nearFill: "rgba(12,16,24,0.55)",
    farBlur: 4,
    midBlur: 1.5,
    footHaze: true,
  },
  rolling: {
    far: "M0,400 L0,298 C180,268 300,282 460,268 C640,252 800,278 980,262 C1160,248 1300,270 1440,258 L1440,400 Z",
    mid: "M0,400 L0,322 C200,302 380,316 560,304 C760,290 960,312 1160,300 C1300,292 1380,308 1440,302 L1440,400 Z",
    near: "M0,400 L0,348 C220,334 420,344 640,336 C860,328 1060,346 1260,338 C1360,334 1410,342 1440,340 L1440,400 Z",
    heightClass: "h-[40%]",
    opacity: 0.38,
    farFill: "rgba(20,28,22,0.4)",
    midFill: "rgba(12,18,14,0.52)",
    nearFill: "rgba(8,12,10,0.76)",
    farBlur: 3.2,
    midBlur: 1.1,
    footHaze: true,
  },
  /** Monumental ridges: few major rises, rounded shoulders — not sawtooth */
  peaks: {
    far: "M0,400 L0,268 C100,248 180,210 280,228 C400,252 480,160 620,178 C760,196 860,120 1000,148 C1140,176 1240,130 1340,158 C1400,172 1425,188 1440,180 L1440,400 Z",
    mid: "M0,400 L0,298 C120,278 220,248 340,268 C480,292 580,220 740,242 C900,264 1020,210 1180,238 C1300,256 1380,242 1440,250 L1440,400 Z",
    near: "M0,400 L0,332 C140,318 260,298 400,314 C560,334 700,292 860,312 C1020,332 1180,300 1320,318 C1390,326 1420,322 1440,324 L1440,400 Z",
    heightClass: "h-[52%]",
    opacity: 0.46,
    farFill: "rgba(20,26,34,0.45)",
    midFill: "rgba(12,16,22,0.58)",
    nearFill: "rgba(6,8,12,0.84)",
    farBlur: 3.2,
    midBlur: 1,
    footHaze: true,
  },
  /** Cold hardness with sparse structure — curves + few breaks, not dense teeth */
  jagged: {
    far: "M0,400 L0,262 C80,248 130,200 200,218 C280,240 340,168 430,188 C520,208 600,140 700,162 C800,184 900,128 1020,152 C1140,176 1240,148 1340,170 C1400,182 1425,198 1440,192 L1440,400 Z",
    mid: "M0,400 L0,300 C100,286 170,248 260,268 C360,292 450,230 560,252 C680,278 800,228 920,254 C1060,282 1180,248 1300,268 C1380,280 1420,272 1440,276 L1440,400 Z",
    near: "M0,400 L0,336 C120,322 210,300 320,318 C450,340 580,298 720,320 C880,346 1020,310 1180,328 C1300,340 1380,328 1440,334 L1440,400 Z",
    heightClass: "h-[50%]",
    opacity: 0.48,
    farFill: "rgba(22,30,40,0.48)",
    midFill: "rgba(12,18,26,0.6)",
    nearFill: "rgba(6,10,14,0.86)",
    farBlur: 2.8,
    midBlur: 0.8,
    footHaze: true,
  },
  range: {
    far: "M0,400 L0,278 C120,258 200,218 320,228 C460,240 560,180 720,196 C880,212 1000,160 1160,180 C1280,194 1380,210 1440,198 L1440,400 Z",
    mid: "M0,400 L0,308 C140,290 260,268 400,282 C560,298 700,258 860,278 C1020,298 1180,268 1340,284 C1400,290 1425,286 1440,288 L1440,400 Z",
    near: "M0,400 L0,338 C160,322 300,312 460,324 C640,338 820,308 1000,324 C1160,336 1300,318 1440,328 L1440,400 Z",
    heightClass: "h-[46%]",
    opacity: 0.42,
    farFill: "rgba(20,28,36,0.4)",
    midFill: "rgba(12,18,24,0.54)",
    nearFill: "rgba(8,12,16,0.8)",
    farBlur: 3.5,
    midBlur: 1.2,
    footHaze: true,
  },
};

function resolveMountainForm(
  form: MountainForm | undefined,
): Exclude<MountainForm, "none"> | null {
  if (!form || form === "none") return null;
  return form;
}

function resolveCloudForm(
  form: CloudForm | undefined,
): "high" | "band" | "sea" | null {
  if (form === undefined || form === false) return null;
  return form;
}

/** Flat ink-wash bands — not puffy cartoon clouds */
function CloudBand({
  className,
  style,
  glow,
  warm = false,
}: {
  className: string;
  style: CSSProperties;
  glow: string;
  warm?: boolean;
}) {
  const soft = warm
    ? "rgba(245,239,226,0.07)"
    : "rgba(200,215,230,0.06)";
  return (
    <div
      className={className}
      style={{
        ...style,
        background: [
          `radial-gradient(ellipse 72% 55% at 38% 48%, ${glow} 0%, transparent 68%)`,
          `radial-gradient(ellipse 55% 50% at 68% 52%, ${soft} 0%, transparent 70%)`,
          `linear-gradient(90deg, transparent 0%, ${soft} 28%, ${soft} 55%, transparent 100%)`,
        ].join(", "),
        borderRadius: "100%",
        filter: style.filter ?? "blur(28px)",
      }}
    />
  );
}

function resolveHorizonForm(
  form: HorizonForm | undefined,
): "plain" | "water" | "frost" | null {
  if (form === undefined || form === false) return null;
  return form;
}

/**
 * Soft ground / water atmosphere — never a thin white stripe.
 * plain = 关外尘岚, water = 水际, frost = 寒江.
 */
function HorizonAtmosphere({
  form,
  glow,
  intensityScale,
}: {
  form: "plain" | "water" | "frost";
  glow: string;
  intensityScale: number;
}) {
  if (form === "plain") {
    return (
      <div className="absolute inset-0" style={{ opacity: intensityScale }}>
        <div
          className="absolute -left-[10%] w-[120%]"
          style={{
            bottom: "10%",
            height: "26%",
            borderRadius: "100%",
            filter: "blur(28px)",
            opacity: 0.55,
            background: [
              `radial-gradient(ellipse 90% 55% at 50% 70%, ${glow} 0%, transparent 72%)`,
              "radial-gradient(ellipse 70% 45% at 40% 55%, rgba(140,100,50,0.1) 0%, transparent 70%)",
              "linear-gradient(90deg, transparent 0%, rgba(120,90,50,0.06) 30%, rgba(120,90,50,0.08) 50%, rgba(120,90,50,0.05) 70%, transparent 100%)",
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            bottom: 0,
            height: "22%",
            background:
              "linear-gradient(to top, rgba(18,14,10,0.55) 0%, rgba(20,16,12,0.2) 45%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  if (form === "frost") {
    return (
      <div className="absolute inset-0" style={{ opacity: intensityScale * 0.9 }}>
        <div
          className="absolute -left-[12%] w-[124%]"
          style={{
            bottom: "12%",
            height: "22%",
            borderRadius: "100%",
            filter: "blur(32px)",
            opacity: 0.42,
            background: [
              `radial-gradient(ellipse 88% 50% at 50% 60%, ${glow} 0%, transparent 74%)`,
              "radial-gradient(ellipse 60% 40% at 55% 50%, rgba(180,200,220,0.06) 0%, transparent 70%)",
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            bottom: "6%",
            height: "16%",
            background:
              "linear-gradient(to top, rgba(12,16,22,0.35) 0%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  // water
  return (
    <div className="absolute inset-0" style={{ opacity: intensityScale }}>
      <div
        className="absolute -left-[10%] w-[120%]"
        style={{
          bottom: "8%",
          height: "24%",
          borderRadius: "100%",
          filter: "blur(30px)",
          opacity: 0.5,
          background: [
            `radial-gradient(ellipse 92% 48% at 50% 65%, ${glow} 0%, transparent 72%)`,
            "radial-gradient(ellipse 70% 42% at 45% 55%, rgba(80,120,150,0.08) 0%, transparent 70%)",
            "linear-gradient(180deg, transparent 0%, rgba(50,80,100,0.06) 55%, rgba(30,50,65,0.1) 100%)",
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-x-[8%]"
        style={{
          bottom: "14%",
          height: "10%",
          borderRadius: "100%",
          filter: "blur(18px)",
          opacity: 0.28,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(140,180,200,0.06) 35%, rgba(140,180,200,0.08) 50%, rgba(140,180,200,0.05) 65%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default function InkBackground({
  theme = "night-moon",
  className = "",
  intensity = "full",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const visual = getThemeVisual(theme);
  const mountainForm = resolveMountainForm(visual.mountains ?? "rolling");
  const mountainStyle = mountainForm ? MOUNTAIN_FORMS[mountainForm] : null;
  const size = intensity === "full" ? 1 : 0.7;
  const nearGradId = `ink-mtn-near-${uid}`;
  const mistLevel =
    visual.mist === "soft"
      ? "soft"
      : visual.mist === "heavy"
        ? "heavy"
        : null;
  const cloudForm = resolveCloudForm(visual.clouds);
  const horizonForm = resolveHorizonForm(visual.horizon);
  const atmScale = intensity === "soft" ? 0.72 : 1;

  const [birdLayout, setBirdLayout] = useState<BirdLayout | null>(null);
  const [lanterns, setLanterns] = useState<LanternSpot[] | null>(null);
  const [boatLeft, setBoatLeft] = useState(30);

  useEffect(() => {
    if (visual.birds) setBirdLayout(sampleBirdLayout());
    else setBirdLayout(null);
  }, [theme, visual.birds]);

  useEffect(() => {
    if (visual.lanterns) setLanterns(sampleLanterns());
    else setLanterns(null);
  }, [theme, visual.lanterns]);

  useEffect(() => {
    if (!visual.boat) return;
    setBoatLeft(rand(18, 48));
  }, [theme, visual.boat]);

  const birdPos = birdLayout ?? {
    farSide: "right" as const,
    farTop: 12,
    farInset: 4,
    nearSide: "left" as const,
    nearBottom: 26,
    nearInset: 7,
  };

  const lanternList = useMemo(
    () =>
      lanterns ?? [
        { left: 10, bottom: 6, w: 6, h: 9, dur: 42, delay: 0, path: "a" as const },
        { left: 80, bottom: 12, w: 8, h: 11, dur: 50, delay: 3, path: "b" as const },
      ],
    [lanterns],
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{ background: visual.gradient }}
      />

      {/* Celestial behind mountain silhouettes (low sun / high moon) */}
      <CelestialBodies
        theme={theme}
        moon={visual.moon}
        sun={visual.sun}
        scale={size}
        glow={visual.glow}
      />

      {/* High clouds — behind ridges (远山入云) */}
      {cloudForm && (
        <div className="absolute inset-0" style={{ opacity: atmScale }}>
          {(cloudForm === "high" ||
            cloudForm === "band" ||
            cloudForm === "sea") && (
            <>
              <CloudBand
                className="ink-cloud ink-cloud-a absolute -left-[12%] w-[85%]"
                glow={visual.glow}
                style={{
                  top: "7%",
                  height: "11%",
                  opacity: cloudForm === "high" ? 0.2 : 0.16,
                  filter: "blur(32px)",
                }}
              />
              <CloudBand
                className="ink-cloud ink-cloud-b absolute left-[25%] w-[90%]"
                glow={visual.glow}
                style={{
                  top: cloudForm === "high" ? "14%" : "12%",
                  height: "9%",
                  opacity: 0.12,
                  filter: "blur(36px)",
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Mountains — layered ink wash (far soft → near solid) */}
      {mountainStyle && (
        <div
          className={`absolute bottom-0 left-0 w-full ${mountainStyle.heightClass}`}
          style={{
            opacity:
              mountainStyle.opacity * (intensity === "soft" ? 0.75 : 1),
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            style={{
              filter:
                mountainStyle.farBlur != null
                  ? `blur(${mountainStyle.farBlur}px)`
                  : undefined,
            }}
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <path d={mountainStyle.far} fill={mountainStyle.farFill} />
          </svg>
          {mountainStyle.mid && (
            <svg
              className="absolute inset-0 h-full w-full"
              style={{
                filter:
                  mountainStyle.midBlur != null
                    ? `blur(${mountainStyle.midBlur}px)`
                    : undefined,
              }}
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >
              <path
                d={mountainStyle.mid}
                fill={mountainStyle.midFill ?? mountainStyle.farFill}
              />
            </svg>
          )}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={nearGradId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                {/* Ridge softens into mass, then sinks into ink at the foot */}
                <stop offset="0%" stopColor="rgb(16,20,28)" stopOpacity="0.72" />
                <stop offset="38%" stopColor="rgb(10,13,18)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="rgb(6,8,12)" stopOpacity="0.98" />
              </linearGradient>
            </defs>
            <path d={mountainStyle.near} fill={mountainStyle.nearFill} />
            <path
              d={mountainStyle.near}
              fill={`url(#${nearGradId})`}
              style={{ opacity: 0.55 }}
            />
          </svg>
          {mountainStyle.footHaze && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[38%]"
              style={{
                background:
                  "linear-gradient(to top, var(--ink) 0%, rgba(13,13,13,0.55) 35%, transparent 100%)",
              }}
            />
          )}
        </div>
      )}

      {/* Horizon atmosphere — plain dust / water / frost (not a white bar) */}
      {horizonForm && (
        <HorizonAtmosphere
          form={horizonForm}
          glow={visual.glow}
          intensityScale={atmScale}
        />
      )}

      {/* Pastoral fields — soft ink bands, no hard ridge strokes */}
      {visual.fields && (
        <div
          className="absolute bottom-0 left-0 w-full h-[38%]"
          style={{ opacity: 0.55 * atmScale }}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[70%]"
            style={{
              background:
                "linear-gradient(to top, rgba(40,60,28,0.35) 0%, rgba(50,75,35,0.12) 45%, transparent 100%)",
            }}
          />
          <div
            className="absolute -left-[5%] w-[110%]"
            style={{
              bottom: "42%",
              height: "28%",
              borderRadius: "100%",
              filter: "blur(14px)",
              opacity: 0.45,
              background:
                "radial-gradient(ellipse 90% 50% at 50% 60%, rgba(70,100,50,0.28) 0%, transparent 72%)",
            }}
          />
          <div
            className="absolute -left-[8%] w-[116%]"
            style={{
              bottom: "22%",
              height: "22%",
              borderRadius: "100%",
              filter: "blur(18px)",
              opacity: 0.35,
              background:
                "radial-gradient(ellipse 85% 45% at 48% 55%, rgba(55,85,40,0.22) 0%, transparent 70%)",
            }}
          />
          {/* Soft terrace hints — thick blur, not 1px lines */}
          <div
            className="absolute inset-x-[5%]"
            style={{
              bottom: "28%",
              height: "3%",
              borderRadius: "100%",
              filter: "blur(6px)",
              opacity: 0.2,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(245,239,226,0.08) 30%, rgba(245,239,226,0.1) 50%, rgba(245,239,226,0.06) 70%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-x-[10%]"
            style={{
              bottom: "18%",
              height: "2.5%",
              borderRadius: "100%",
              filter: "blur(5px)",
              opacity: 0.14,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(245,239,226,0.06) 40%, transparent 100%)",
            }}
          />
        </div>
      )}

      {/* Bamboo — soft ink stems + leaf washes (not line-art sticks) */}
      {visual.bamboo && (
        <div
          className="absolute inset-y-0 left-0 w-[32%] max-w-[280px]"
          style={{
            opacity: (theme === "reclusion" ? 0.16 : 0.22) * atmScale,
            filter: "blur(0.6px)",
          }}
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 220 640"
            preserveAspectRatio="xMinYMid slice"
            aria-hidden
          >
            <defs>
              <linearGradient id={`${uid}-bamboo`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(140,180,140,0.15)" />
                <stop offset="40%" stopColor="rgba(120,160,120,0.45)" />
                <stop offset="100%" stopColor="rgba(40,60,40,0.55)" />
              </linearGradient>
            </defs>
            {/* Stems: slight curve, taper via stroke */}
            {[
              { d: "M36,40 C40,180 32,320 38,520 C40,580 42,620 44,640", w: 3.2 },
              { d: "M62,70 C58,200 68,340 60,500 C58,560 56,610 55,640", w: 2.4 },
              { d: "M92,30 C98,160 88,300 96,480 C100,560 102,610 104,640", w: 3.8 },
              { d: "M128,90 C122,220 134,360 126,520 C124,580 122,620 120,640", w: 2.2 },
              { d: "M158,50 C164,190 152,330 160,500 C162,570 164,615 166,640", w: 2.8 },
            ].map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                stroke={`url(#${uid}-bamboo)`}
                strokeWidth={s.w}
                strokeLinecap="round"
              />
            ))}
            {/* Leaf clusters as soft blots */}
            {[
              { cx: 48, cy: 140, rx: 22, ry: 9, rot: -28, o: 0.28 },
              { cx: 78, cy: 200, rx: 18, ry: 7, rot: 18, o: 0.22 },
              { cx: 108, cy: 120, rx: 26, ry: 10, rot: -12, o: 0.3 },
              { cx: 140, cy: 240, rx: 20, ry: 8, rot: 25, o: 0.2 },
              { cx: 52, cy: 320, rx: 16, ry: 6, rot: -35, o: 0.18 },
              { cx: 118, cy: 300, rx: 24, ry: 9, rot: 8, o: 0.24 },
              { cx: 168, cy: 180, rx: 18, ry: 7, rot: -20, o: 0.2 },
              { cx: 98, cy: 400, rx: 20, ry: 8, rot: 15, o: 0.16 },
            ].map((l, i) => (
              <ellipse
                key={`lf-${i}`}
                cx={l.cx}
                cy={l.cy}
                rx={l.rx}
                ry={l.ry}
                fill="rgba(130,175,130,0.55)"
                opacity={l.o}
                transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
                style={{ filter: "blur(1.2px)" }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Mid / sea clouds — in front of ridges, still airy */}
      {cloudForm && (cloudForm === "band" || cloudForm === "sea") && (
        <div className="absolute inset-0" style={{ opacity: atmScale }}>
          <CloudBand
            className="ink-cloud ink-cloud-a absolute -left-[8%] w-[110%]"
            glow={visual.glow}
            style={{
              top: "28%",
              height: cloudForm === "sea" ? "16%" : "12%",
              opacity: cloudForm === "sea" ? 0.18 : 0.14,
              filter: "blur(30px)",
            }}
          />
          {cloudForm === "sea" && (
            <CloudBand
              className="ink-cloud ink-cloud-b absolute left-[-5%] w-[120%]"
              glow={visual.glow}
              warm
              style={{
                top: "40%",
                height: "14%",
                opacity: 0.15,
                filter: "blur(34px)",
              }}
            />
          )}
        </div>
      )}

      {/* Mist — horizontal 岚气 bands (waist + valley), not glow blobs */}
      {mistLevel && (
        <div className="absolute inset-0" style={{ opacity: atmScale }}>
          {mistLevel === "heavy" && (
            <div
              className="ink-mist-sheet absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(120,140,160,0.05) 0%, transparent 28%, transparent 48%, rgba(40,50,60,0.1) 100%)",
                opacity: 0.85,
              }}
            />
          )}
          {/* Waist mist — 山腰 */}
          <div
            className="ink-mist ink-mist-a absolute -left-[15%] w-[130%]"
            style={{
              top: mistLevel === "heavy" ? "38%" : "44%",
              height: mistLevel === "heavy" ? "22%" : "16%",
              opacity: mistLevel === "heavy" ? 0.38 : 0.22,
              borderRadius: "100%",
              filter: "blur(36px)",
              background: [
                `radial-gradient(ellipse 80% 50% at 45% 50%, ${visual.glow} 0%, transparent 72%)`,
                "linear-gradient(90deg, transparent 0%, rgba(245,239,226,0.06) 25%, rgba(245,239,226,0.08) 50%, rgba(245,239,226,0.05) 72%, transparent 100%)",
              ].join(", "),
            }}
          />
          {/* Valley fog — 谷底 */}
          <div
            className="ink-mist ink-mist-b absolute -left-[10%] w-[120%]"
            style={{
              bottom: "6%",
              height: mistLevel === "heavy" ? "20%" : "14%",
              opacity: mistLevel === "heavy" ? 0.32 : 0.18,
              borderRadius: "100%",
              filter: "blur(40px)",
              background: [
                "radial-gradient(ellipse 85% 55% at 50% 60%, rgba(245,239,226,0.07) 0%, transparent 70%)",
                `radial-gradient(ellipse 60% 45% at 30% 50%, ${visual.glow} 0%, transparent 75%)`,
              ].join(", "),
            }}
          />
          {(mistLevel === "heavy" || intensity === "full") && (
            <div
              className="ink-mist ink-mist-a absolute left-[5%] w-[95%]"
              style={{
                top: "52%",
                height: "12%",
                opacity: mistLevel === "heavy" ? 0.2 : 0.12,
                borderRadius: "100%",
                filter: "blur(42px)",
                background:
                  "linear-gradient(90deg, transparent 5%, rgba(180,200,220,0.07) 40%, rgba(180,200,220,0.06) 60%, transparent 95%)",
              }}
            />
          )}
        </div>
      )}

      {/* Rain — unified wind, depth layers, mild tilt jitter */}
      {visual.rain && (
        <div className="rain-field pointer-events-none absolute inset-0 overflow-hidden">
          <div className="rain-veil absolute inset-0" />
          {(
            [
              // left%, delay, dur, len, opacity, tilt (wind ~+4°), layer 0=far 1=near
              [4, 0, 5.6, 22, 0.16, 3, 0],
              [7, 0.5, 5.8, 20, 0.14, 5, 0],
              [10, 1.1, 5.4, 24, 0.15, 4, 0],
              [13, 1.7, 5.9, 18, 0.14, 2, 0],
              [16, 0.3, 5.5, 25, 0.16, 5, 0],
              [19, 2.4, 5.7, 21, 0.15, 3, 0],
              [23, 1.4, 5.3, 26, 0.16, 6, 0],
              [26, 3.0, 6.0, 19, 0.13, 4, 0],
              [30, 0.8, 5.5, 23, 0.15, 3, 0],
              [34, 2.0, 5.8, 21, 0.14, 5, 0],
              [38, 3.5, 5.4, 24, 0.15, 2, 0],
              [60, 0.4, 5.6, 22, 0.15, 4, 0],
              [63, 1.3, 5.9, 20, 0.14, 3, 0],
              [66, 2.6, 5.4, 25, 0.16, 5, 0],
              [69, 0.9, 5.7, 18, 0.13, 6, 0],
              [72, 3.2, 5.5, 23, 0.15, 2, 0],
              [76, 1.6, 5.8, 21, 0.14, 4, 0],
              [79, 3.8, 5.3, 26, 0.16, 3, 0],
              [83, 0.2, 5.9, 19, 0.13, 5, 0],
              [86, 2.2, 5.5, 24, 0.15, 4, 0],
              [90, 3.6, 5.7, 20, 0.14, 2, 0],
              [93, 1.0, 5.4, 25, 0.16, 6, 0],
              [96, 4.2, 5.8, 21, 0.13, 3, 0],
              [5, 4.6, 5.5, 22, 0.14, 4, 0],
              [28, 4.9, 5.6, 20, 0.14, 5, 0],
              [74, 5.1, 5.7, 24, 0.15, 2, 0],
              [8, 0.2, 3.9, 40, 0.28, 5, 1],
              [11, 0.7, 4.0, 38, 0.26, 3, 1],
              [14, 1.3, 3.7, 44, 0.3, 4, 1],
              [18, 1.9, 4.1, 36, 0.26, 6, 1],
              [21, 0.5, 3.8, 42, 0.28, 2, 1],
              [25, 2.5, 4.0, 39, 0.27, 5, 1],
              [29, 1.2, 3.7, 45, 0.3, 3, 1],
              [33, 3.1, 4.2, 35, 0.24, 4, 1],
              [37, 2.0, 3.9, 41, 0.28, 6, 1],
              [61, 0.4, 3.8, 40, 0.28, 4, 1],
              [65, 1.5, 4.1, 37, 0.26, 3, 1],
              [68, 2.8, 3.7, 43, 0.29, 5, 1],
              [72, 0.8, 4.0, 39, 0.27, 2, 1],
              [75, 2.2, 3.8, 44, 0.3, 6, 1],
              [79, 3.4, 4.2, 36, 0.25, 4, 1],
              [82, 1.0, 3.9, 41, 0.28, 3, 1],
              [85, 2.6, 4.0, 38, 0.26, 5, 1],
              [88, 3.7, 3.7, 45, 0.29, 2, 1],
              [92, 0.6, 4.1, 40, 0.27, 6, 1],
              [95, 1.8, 3.8, 37, 0.25, 4, 1],
              [9, 4.4, 4.0, 42, 0.26, 3, 1],
              [16, 4.8, 3.8, 39, 0.26, 5, 1],
              [23, 5.0, 4.1, 36, 0.24, 2, 1],
              [31, 5.3, 3.9, 43, 0.27, 6, 1],
              [70, 5.5, 4.0, 40, 0.26, 4, 1],
              [77, 5.7, 3.7, 44, 0.28, 3, 1],
              [84, 5.9, 4.1, 38, 0.25, 5, 1],
              [91, 6.1, 3.9, 41, 0.26, 2, 1],
              [43, 2.3, 5.7, 22, 0.12, 4, 0],
              [47, 3.9, 4.0, 36, 0.2, 5, 1],
              [53, 5.2, 5.6, 21, 0.12, 3, 0],
              [57, 6.0, 4.1, 38, 0.2, 4, 1],
            ] as const
          ).map(([left, delay, dur, h, op, tilt, layer], i) => (
            <span
              key={i}
              className={`rain-drop absolute ${layer === 0 ? "rain-drop--far" : "rain-drop--near"}`}
              style={
                {
                  left: `${left}%`,
                  height: h,
                  opacity: op,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  "--rain-tilt": `${tilt}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Soft ground snow wash — under falling particles */}
      {visual.snow && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.55 * atmScale }}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[32%]"
            style={{
              background:
                "linear-gradient(to top, rgba(200,215,230,0.1) 0%, rgba(180,200,220,0.04) 40%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: [
                "radial-gradient(1.2px 1.2px at 12% 22%, rgba(255,255,255,0.35) 50%, transparent 50%)",
                "radial-gradient(1px 1px at 28% 48%, rgba(255,255,255,0.22) 50%, transparent 50%)",
                "radial-gradient(1.4px 1.4px at 44% 18%, rgba(255,255,255,0.28) 50%, transparent 50%)",
                "radial-gradient(1px 1px at 61% 62%, rgba(255,255,255,0.2) 50%, transparent 50%)",
                "radial-gradient(1.2px 1.2px at 76% 30%, rgba(255,255,255,0.3) 50%, transparent 50%)",
                "radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.18) 50%, transparent 50%)",
                "radial-gradient(1.3px 1.3px at 18% 72%, rgba(255,255,255,0.16) 50%, transparent 50%)",
                "radial-gradient(1px 1px at 52% 80%, rgba(255,255,255,0.14) 50%, transparent 50%)",
              ].join(", "),
            }}
          />
        </div>
      )}

      {/*
        远渚舟影：一抹墨痕，无桅杆/完整船形（忌卡通图标）。
        江湖 / 寒江签名共用。
      */}
      {visual.boat && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${boatLeft}%`,
            bottom: `${theme === "snow-river" ? 13 : 15}%`,
            width: "min(11vw, 88px)",
            opacity: (intensity === "soft" ? 0.1 : 0.14) * atmScale,
            filter: "blur(1.6px)",
          }}
        >
          <svg viewBox="0 0 96 28" className="h-auto w-full" aria-hidden>
            {/* 水底拖尾墨晕 */}
            <ellipse
              cx="48"
              cy="20"
              rx="36"
              ry="5"
              fill="rgba(245,239,226,0.06)"
            />
            {/* 主笔：扁弧一叶，不可辨船头船尾细节 */}
            <path
              d="M14 16 C28 11.5 40 10.5 48 11 C58 11.6 70 14 82 17.5 C68 19.5 56 20.5 48 20 C36 19.4 24 18 14 16 Z"
              fill="rgba(245,239,226,0.2)"
            />
            {/* 次笔：更淡内弧，增墨色层次 */}
            <path
              d="M22 15.5 C34 12.8 42 12.2 48 12.4 C56 12.7 64 14.2 74 16.5"
              fill="none"
              stroke="rgba(245,239,226,0.12)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/*
        瓣光：春 = 淡青绿粉 wash；花意 = 更强绛桃签名（侧位+底落英，中栏护字）。
        粒子瓣落由 ParticleBackground 承担。
      */}
      {visual.petals && theme === "spring" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.32 * atmScale,
            backgroundImage: [
              "radial-gradient(ellipse 26% 20% at 16% 36%, rgba(190,150,160,0.14) 0%, transparent 70%)",
              "radial-gradient(ellipse 22% 18% at 74% 54%, rgba(160,140,130,0.1) 0%, transparent 68%)",
              "radial-gradient(ellipse 28% 22% at 48% 70%, rgba(170,160,140,0.08) 0%, transparent 72%)",
            ].join(", "),
          }}
        />
      )}

      {theme === "flowers" && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ opacity: atmScale }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 30% 34% at 14% 28%, rgba(210,90,120,0.22) 0%, transparent 68%)",
                "radial-gradient(ellipse 26% 28% at 86% 42%, rgba(200,80,110,0.16) 0%, transparent 66%)",
                "radial-gradient(ellipse 24% 22% at 22% 72%, rgba(220,120,140,0.12) 0%, transparent 70%)",
                "radial-gradient(ellipse 28% 20% at 78% 78%, rgba(190,70,100,0.1) 0%, transparent 68%)",
                "radial-gradient(ellipse 70% 16% at 50% 94%, rgba(180,60,90,0.1) 0%, transparent 72%)",
              ].join(", "),
            }}
          />
          {/* 中栏微暗：护题与正文 */}
          <div
            className="absolute left-1/2 top-[16%] h-[58%] w-[min(44%,440px)] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 50% 45%, rgba(13,13,13,0.2) 0%, transparent 72%)",
            }}
          />
        </div>
      )}

      {/*
        对酒签名：中心偏下暖焰光核 + 左右琥珀余烬（单主动画：脉动）。
        中柱护字：光核在 58% 纵位、两侧余烬避开正文；无月。
      */}
      {theme === "wine" && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ opacity: atmScale }}
        >
          {/* 左右余烬 — 宴席暖边，不进中栏 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 22% 38% at 12% 68%, rgba(178,58,72,0.16) 0%, transparent 70%)",
                "radial-gradient(ellipse 20% 34% at 88% 64%, rgba(200,120,70,0.12) 0%, transparent 68%)",
                "radial-gradient(ellipse 36% 18% at 50% 92%, rgba(120,50,40,0.14) 0%, transparent 72%)",
              ].join(", "),
            }}
          />
          {/* 酒焰光核 — 慢脉动 */}
          <div
            className="wine-ember absolute left-1/2 top-[56%] h-[min(42vh,320px)] w-[min(48vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: [
                `radial-gradient(ellipse 50% 50% at 50% 50%, ${visual.glow} 0%, transparent 62%)`,
                "radial-gradient(ellipse 42% 40% at 50% 55%, rgba(178,58,72,0.22) 0%, transparent 68%)",
                "radial-gradient(ellipse 55% 48% at 48% 48%, rgba(220,160,90,0.1) 0%, transparent 72%)",
              ].join(", "),
              filter: "blur(2px)",
            }}
          />
          {/* 中栏微暗罩：护正文对比 */}
          <div
            className="absolute left-1/2 top-[18%] h-[58%] w-[min(42%,420px)] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 50% 45%, rgba(13,13,13,0.22) 0%, transparent 72%)",
            }}
          />
        </div>
      )}

      {/* Water ripples — softer ink rings, low chroma (avoid cartoon pools) */}
      {visual.ripples && (
        <div
          className="absolute bottom-[14%] left-1/2 w-[min(62%,460px)] -translate-x-1/2"
          style={{ opacity: 0.72 * atmScale }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="ripple-ring absolute left-1/2 top-0 -translate-x-1/2 rounded-[100%]"
              style={{
                width: `${48 + i * 28}%`,
                height: 12 + i * 7,
                border: "none",
                background: `radial-gradient(ellipse 50% 50% at 50% 50%, transparent 44%, rgba(245,239,226,${0.045 - i * 0.01}) 58%, transparent 74%)`,
                filter: "blur(1.8px)",
                animationDelay: `${i * 1.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lanterns — per-mount position sample, side bands only */}
      {visual.lanterns && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {lanternList.map((p, i) => (
            <div
              key={i}
              className={`lantern-rise lantern-rise-${p.path} absolute`}
              style={{
                left: `${p.left}%`,
                bottom: `${p.bottom}%`,
                width: p.w,
                height: p.h,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Birds — flock placement sampled per mount */}
      {visual.birds && (
        <>
          <div
            className="absolute left-1/2 top-0 h-[42%] w-[90%] -translate-x-1/2 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(180,200,220,0.14) 0%, transparent 70%)",
            }}
          />
          <div
            className="birds-flock-drift absolute w-[min(44vw,300px)] opacity-[0.4]"
            style={
              birdPos.farSide === "left"
                ? { left: `${birdPos.farInset}%`, top: `${birdPos.farTop}%` }
                : { right: `${birdPos.farInset}%`, top: `${birdPos.farTop}%` }
            }
          >
            <svg viewBox="0 0 280 100" fill="none" aria-hidden className="h-auto w-full">
              {[
                { x: 20, y: 72, s: 1, o: 0.55, delay: "0s" },
                { x: 55, y: 58, s: 0.9, o: 0.5, delay: "0.4s" },
                { x: 88, y: 48, s: 0.82, o: 0.45, delay: "0.9s" },
                { x: 118, y: 40, s: 0.72, o: 0.4, delay: "1.3s" },
                { x: 145, y: 32, s: 0.62, o: 0.35, delay: "1.8s" },
                { x: 170, y: 26, s: 0.52, o: 0.3, delay: "2.2s" },
                { x: 192, y: 22, s: 0.42, o: 0.25, delay: "2.7s" },
              ].map((b, i) => (
                <g
                  key={i}
                  transform={`translate(${b.x},${b.y}) scale(${b.s})`}
                  opacity={b.o}
                >
                  <g className="birds-bob" style={{ animationDelay: b.delay }}>
                    <path
                      d="M0,0 C-8,-6 -16,-4 -22,-1 C-12,-2 -6,1 0,2 C6,1 12,-2 22,-1 C16,-4 8,-6 0,0 Z"
                      fill="rgba(230,236,242,0.9)"
                    />
                  </g>
                </g>
              ))}
            </svg>
          </div>
          <div
            className="birds-near-drift absolute w-28 opacity-[0.28]"
            style={
              birdPos.nearSide === "left"
                ? {
                    left: `${birdPos.nearInset}%`,
                    bottom: `${birdPos.nearBottom}%`,
                  }
                : {
                    right: `${birdPos.nearInset}%`,
                    bottom: `${birdPos.nearBottom}%`,
                  }
            }
          >
            <svg viewBox="0 0 80 36" fill="none" aria-hidden className="h-auto w-full">
              <g transform="translate(12,18)">
                <g className="birds-bob" style={{ animationDelay: "0.6s" }}>
                  <path
                    d="M0,0 C-6,-4 -12,-3 -16,-1 C-9,-1 -4,1 0,1.5 C3,1 7,-1 12,0 C8,-3 4,-4 0,0 Z"
                    fill="rgba(220,228,236,0.85)"
                  />
                </g>
              </g>
              <g transform="translate(48,12)">
                <g className="birds-bob" style={{ animationDelay: "1.4s" }}>
                  <path
                    d="M0,0 C-5,-3 -10,-2 -14,0 C-8,-1 -3,0.5 0,1 C3,0.5 6,-1 11,0 C7,-2 3,-3 0,0 Z"
                    fill="rgba(220,228,236,0.7)"
                  />
                </g>
              </g>
            </svg>
          </div>
        </>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
