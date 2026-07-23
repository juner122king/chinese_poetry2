"use client";

import type { CSSProperties } from "react";
import type { PoemTheme } from "@/lib/types";
import {
  getThemeVisual,
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
  near: string;
  heightClass: string;
  opacity: number;
  farFill: string;
  nearFill: string;
};

/** Distinct silhouettes — not the same path scaled */
const MOUNTAIN_FORMS: Record<Exclude<MountainForm, "none">, MountainPaths> = {
  soft: {
    far: "M0,400 L0,280 C120,240 200,180 320,200 C480,230 520,120 680,140 C840,160 900,80 1080,120 C1220,150 1320,200 1440,170 L1440,400 Z",
    near: "M0,400 L0,320 C180,300 280,250 420,270 C600,300 700,220 860,250 C1020,280 1180,230 1440,260 L1440,400 Z",
    heightClass: "h-[42%]",
    opacity: 0.38,
    farFill: "rgba(12,14,18,0.75)",
    nearFill: "rgba(8,10,14,0.88)",
  },
  strong: {
    far: "M0,400 L0,240 C80,200 160,100 280,130 C400,160 480,40 640,70 C800,100 900,20 1080,60 C1220,90 1340,140 1440,100 L1440,400 Z",
    near: "M0,400 L0,300 C160,270 300,200 460,230 C620,260 760,170 960,200 C1140,230 1280,190 1440,220 L1440,400 Z",
    heightClass: "h-[54%]",
    opacity: 0.52,
    farFill: "rgba(10,12,16,0.8)",
    nearFill: "rgba(6,8,12,0.92)",
  },
  distant: {
    far: "M0,400 L0,300 C200,280 360,250 520,265 C700,280 900,240 1100,255 C1260,268 1380,250 1440,260 L1440,400 Z",
    near: "M0,400 L0,340 C240,325 480,310 720,320 C980,332 1200,315 1440,328 L1440,400 Z",
    heightClass: "h-[34%]",
    opacity: 0.28,
    farFill: "rgba(18,22,28,0.55)",
    nearFill: "rgba(12,16,22,0.72)",
  },
  rolling: {
    far: "M0,400 L0,290 C180,250 300,270 450,255 C620,238 780,270 960,250 C1140,232 1280,260 1440,245 L1440,400 Z",
    near: "M0,400 L0,330 C200,300 380,320 560,305 C780,288 980,315 1180,300 C1320,292 1400,310 1440,305 L1440,400 Z",
    heightClass: "h-[40%]",
    opacity: 0.36,
    farFill: "rgba(14,18,14,0.7)",
    nearFill: "rgba(8,12,10,0.88)",
  },
  peaks: {
    far: "M0,400 L0,260 L120,200 L220,280 L360,90 L480,240 L600,140 L740,260 L900,60 L1040,220 L1180,120 L1320,240 L1440,160 L1440,400 Z",
    near: "M0,400 L0,310 L100,250 L200,320 L340,180 L480,300 L620,220 L780,310 L920,200 L1080,300 L1240,240 L1440,280 L1440,400 Z",
    heightClass: "h-[56%]",
    opacity: 0.48,
    farFill: "rgba(10,12,16,0.78)",
    nearFill: "rgba(6,8,12,0.92)",
  },
  jagged: {
    far: "M0,400 L0,250 L80,250 L140,160 L190,240 L280,100 L340,210 L420,70 L500,200 L580,90 L660,220 L760,50 L860,190 L960,80 L1080,200 L1180,110 L1280,230 L1360,140 L1440,210 L1440,400 Z",
    near: "M0,400 L0,300 L90,300 L150,230 L230,300 L320,170 L400,280 L500,160 L600,290 L720,150 L840,280 L960,180 L1100,290 L1240,200 L1360,290 L1440,240 L1440,400 Z",
    heightClass: "h-[52%]",
    opacity: 0.5,
    farFill: "rgba(12,16,22,0.8)",
    nearFill: "rgba(6,10,14,0.94)",
  },
  range: {
    far: "M0,400 L0,270 C100,250 180,200 280,210 C400,225 500,160 640,175 C800,190 920,130 1080,150 C1220,168 1340,200 1440,185 L1440,400 Z",
    near: "M0,400 L0,315 C140,295 260,270 400,285 C560,300 700,255 860,275 C1020,295 1180,265 1440,280 L1440,400 Z",
    heightClass: "h-[46%]",
    opacity: 0.4,
    farFill: "rgba(12,16,20,0.72)",
    nearFill: "rgba(8,12,16,0.9)",
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

export default function InkBackground({
  theme = "night-moon",
  className = "",
  intensity = "full",
}: Props) {
  const visual = getThemeVisual(theme);
  const mountainForm = resolveMountainForm(visual.mountains ?? "rolling");
  const mountainStyle = mountainForm ? MOUNTAIN_FORMS[mountainForm] : null;
  const size = intensity === "full" ? 1 : 0.7;
  const mistLevel =
    visual.mist === "soft"
      ? "soft"
      : visual.mist === "heavy"
        ? "heavy"
        : null;

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

      {/* Mountains — distinct forms per theme */}
      {mountainStyle && (
        <svg
          className={`absolute bottom-0 left-0 w-full ${mountainStyle.heightClass}`}
          style={{ opacity: mountainStyle.opacity * (intensity === "soft" ? 0.75 : 1) }}
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          <path d={mountainStyle.far} fill={mountainStyle.farFill} />
          <path d={mountainStyle.near} fill={mountainStyle.nearFill} />
        </svg>
      )}

      {/* Soft horizon glow — never a hard 1px edge */}
      {visual.horizon && (
        <div
          className="absolute left-0 right-0 h-12 opacity-40"
          style={{
            bottom: "24%",
            background:
              "linear-gradient(90deg, transparent 5%, rgba(245,239,226,0.08) 35%, rgba(245,239,226,0.12) 50%, rgba(245,239,226,0.08) 65%, transparent 95%), linear-gradient(180deg, transparent 0%, rgba(245,239,226,0.06) 45%, transparent 100%)",
            filter: "blur(1.5px)",
          }}
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

      {/* Mist — soft | heavy | off */}
      {mistLevel && (
        <>
          <div
            className="mist-layer absolute -left-[10%] top-[30%] h-[40%] w-[120%] rounded-[100%] blur-3xl"
            style={{
              background: `radial-gradient(ellipse, ${visual.glow} 0%, transparent 70%)`,
              opacity: mistLevel === "heavy" ? 0.55 : 0.32,
            }}
          />
          {(mistLevel === "heavy" || intensity === "full") && (
            <div
              className="mist-layer-2 absolute -left-[5%] top-[55%] h-[30%] w-[110%] rounded-[100%] blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(245,239,226,0.08) 0%, transparent 70%)",
                opacity: mistLevel === "heavy" ? 1 : 0.65,
              }}
            />
          )}
        </>
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
