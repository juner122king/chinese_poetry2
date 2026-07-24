"use client";

import { useId, type CSSProperties } from "react";
import type { PoemTheme } from "@/lib/types";
import {
  getThemeVisual,
  type CloudForm,
  type HorizonForm,
  type MountainForm,
} from "@/lib/theme-map";
import CelestialBodies from "./CelestialBodies";

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
  soft: {
    far: "M0,400 L0,292 C160,268 280,248 420,258 C580,270 700,238 860,248 C1020,258 1180,228 1440,242 L1440,400 Z",
    mid: "M0,400 L0,318 C180,300 320,288 480,298 C680,312 860,286 1040,298 C1200,308 1320,292 1440,300 L1440,400 Z",
    near: "M0,400 L0,342 C200,328 380,336 580,330 C800,322 1020,338 1220,332 C1340,328 1400,336 1440,334 L1440,400 Z",
    heightClass: "h-[42%]",
    opacity: 0.4,
    farFill: "rgba(22,28,36,0.42)",
    midFill: "rgba(14,18,24,0.55)",
    nearFill: "rgba(8,10,14,0.78)",
    farBlur: 3.5,
    midBlur: 1.2,
    footHaze: true,
  },
  strong: {
    far: "M0,400 L0,250 C140,220 240,168 380,188 C540,212 640,120 820,148 C980,172 1100,100 1260,128 C1360,144 1410,168 1440,158 L1440,400 Z",
    mid: "M0,400 L0,292 C160,262 300,240 460,258 C640,280 800,228 980,252 C1140,272 1280,248 1440,262 L1440,400 Z",
    near: "M0,400 L0,328 C180,308 340,292 520,308 C720,328 900,288 1100,308 C1260,322 1360,310 1440,316 L1440,400 Z",
    heightClass: "h-[54%]",
    opacity: 0.5,
    farFill: "rgba(18,24,32,0.48)",
    midFill: "rgba(12,16,22,0.62)",
    nearFill: "rgba(6,8,12,0.86)",
    farBlur: 3,
    midBlur: 1,
    footHaze: true,
  },
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
  if (form === "soft") return "rolling";
  if (form === "strong") return "peaks";
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
        showMoon={visual.moon}
        showSun={visual.sun}
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

      {/* Pastoral fields */}
      {visual.fields && (
        <svg
          className="absolute bottom-0 left-0 w-full h-[35%] opacity-25"
          viewBox="0 0 1440 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,180 Q360,140 720,170 T1440,150 L1440,300 L0,300 Z"
            fill="rgba(60,90,40,0.35)"
          />
          <path
            d="M0,220 Q400,190 800,210 T1440,200"
            stroke="rgba(245,239,226,0.12)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,250 Q500,230 900,245 T1440,235"
            stroke="rgba(245,239,226,0.08)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      )}

      {/* Bamboo silhouettes */}
      {visual.bamboo && (
        <svg
          className="absolute inset-y-0 left-0 w-[28%] opacity-20"
          viewBox="0 0 200 600"
          preserveAspectRatio="xMinYMid slice"
        >
          {[30, 55, 85, 120, 150].map((x, i) => (
            <g key={x}>
              <line
                x1={x}
                y1={80 + i * 10}
                x2={x + (i % 2 ? 4 : -3)}
                y2={580}
                stroke="rgba(160,200,160,0.5)"
                strokeWidth={2 + (i % 3)}
              />
              <ellipse
                cx={x + 12}
                cy={160 + i * 40}
                rx={14}
                ry={6}
                fill="rgba(140,180,140,0.25)"
                transform={`rotate(${-20 + i * 5} ${x + 12} ${160 + i * 40})`}
              />
            </g>
          ))}
        </svg>
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

      {/* Snow dots (static CSS) */}
      {visual.snow && (
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.5) 50%, transparent 50%), radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.4) 50%, transparent 50%), radial-gradient(1.5px 1.5px at 80% 20%, rgba(255,255,255,0.45) 50%, transparent 50%), radial-gradient(1px 1px at 40% 85%, rgba(255,255,255,0.35) 50%, transparent 50%), radial-gradient(1px 1px at 10% 60%, rgba(255,255,255,0.3) 50%, transparent 50%)",
          }}
        />
      )}

      {/* Petal glow spots */}
      {visual.petals && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 40%, rgba(200,120,140,0.25) 0%, transparent 12%), radial-gradient(circle at 70% 55%, rgba(180,100,120,0.18) 0%, transparent 10%), radial-gradient(circle at 45% 70%, rgba(220,160,160,0.12) 0%, transparent 14%)",
          }}
        />
      )}

      {/* Water ripples */}
      {visual.ripples && (
        <div className="absolute bottom-[18%] left-1/2 w-[60%] -translate-x-1/2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="ripple-ring absolute left-1/2 top-0 -translate-x-1/2 rounded-[100%]"
              style={{
                width: `${40 + i * 25}%`,
                height: 12 + i * 6,
                border: "1px solid rgba(150,200,210,0.12)",
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lanterns template — slow rise, varied paths, extinguish (festival) */}
      {visual.lanterns && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { left: "10%", bottom: "6%", w: 6, h: 9, dur: "42s", delay: "0s", path: "a" },
            { left: "18%", bottom: "12%", w: 9, h: 12, dur: "50s", delay: "3.5s", path: "b" },
            { left: "26%", bottom: "4%", w: 5, h: 8, dur: "46s", delay: "7s", path: "c" },
            { left: "72%", bottom: "8%", w: 8, h: 11, dur: "52s", delay: "1.5s", path: "a" },
            { left: "80%", bottom: "15%", w: 7, h: 10, dur: "44s", delay: "5s", path: "c" },
            { left: "88%", bottom: "5%", w: 10, h: 13, dur: "54s", delay: "9s", path: "b" },
            { left: "6%", bottom: "18%", w: 5, h: 7, dur: "48s", delay: "12s", path: "c" },
            { left: "94%", bottom: "20%", w: 6, h: 9, dur: "40s", delay: "4s", path: "a" },
            { left: "14%", bottom: "22%", w: 8, h: 10, dur: "56s", delay: "15s", path: "b" },
            { left: "84%", bottom: "11%", w: 5, h: 8, dur: "49s", delay: "11s", path: "c" },
          ].map((p, i) => (
            <div
              key={i}
              className={`lantern-rise lantern-rise-${p.path} absolute`}
              style={{
                left: p.left,
                bottom: p.bottom,
                width: p.w,
                height: p.h,
                animationDuration: p.dur,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Birds theme template — shared by all poems with visual.birds */}
      {visual.birds && (
        <>
          <div
            className="absolute left-1/2 top-0 h-[42%] w-[90%] -translate-x-1/2 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(180,200,220,0.14) 0%, transparent 70%)",
            }}
          />
          {/* Far flock: slow drift, staggered bob — off center-right */}
          <div className="birds-flock-drift absolute right-[4%] top-[12%] w-[min(44vw,300px)] opacity-[0.4]">
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
                    <path
                      d="M-1,1 L4,6"
                      stroke="rgba(230,236,242,0.75)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              ))}
            </svg>
          </div>
          {/* Near pair: same cool silhouette language, slower */}
          <div className="birds-near-drift absolute bottom-[26%] left-[7%] w-28 opacity-[0.28]">
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
