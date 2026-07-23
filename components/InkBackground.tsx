"use client";

import type { PoemTheme } from "@/lib/types";
import { getThemeVisual } from "@/lib/theme-map";
import CelestialBodies from "./CelestialBodies";

type Props = {
  theme?: PoemTheme;
  className?: string;
  intensity?: "soft" | "full";
};

export default function InkBackground({
  theme = "night-moon",
  className = "",
  intensity = "full",
}: Props) {
  const visual = getThemeVisual(theme);
  const mountains = visual.mountains ?? "soft";
  const size = intensity === "full" ? 1 : 0.7;

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

      {/* Mountains */}
      {mountains !== "none" && (
        <svg
          className={`absolute bottom-0 left-0 w-full ${
            mountains === "strong" ? "h-[52%] opacity-50" : "h-[42%] opacity-35"
          }`}
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,400 L0,280 C120,240 200,180 320,200 C480,230 520,120 680,140 C840,160 900,80 1080,120 C1220,150 1320,200 1440,170 L1440,400 Z"
            fill="rgba(10,12,16,0.85)"
          />
          <path
            d="M0,400 L0,320 C180,300 280,250 420,270 C600,300 700,220 860,250 C1020,280 1180,230 1440,260 L1440,400 Z"
            fill="rgba(8,10,14,0.9)"
          />
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

      {/* Mist */}
      {visual.mist && (
        <>
          <div
            className="mist-layer absolute -left-[10%] top-[30%] h-[40%] w-[120%] rounded-[100%] blur-3xl"
            style={{
              background: `radial-gradient(ellipse, ${visual.glow} 0%, transparent 70%)`,
              opacity: 0.4,
            }}
          />
          <div
            className="mist-layer-2 absolute -left-[5%] top-[55%] h-[30%] w-[110%] rounded-[100%] blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, rgba(245,239,226,0.08) 0%, transparent 70%)",
            }}
          />
        </>
      )}

      {/* Rain streaks */}
      {visual.rain && (
        <div className="rain-layer absolute inset-0 opacity-40" />
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
