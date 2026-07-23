"use client";

import type { PoemTheme } from "@/lib/types";

type Props = {
  theme: PoemTheme;
  showMoon?: boolean;
  showSun?: boolean;
  /** 1 = full hero, 0.7 = soft section */
  scale?: number;
  glow?: string;
};

/**
 * Layered moon / sun for Eastern ink scenes.
 * Core disc + bloom + outer halo; theme-aware placement & temperature.
 */
export default function CelestialBodies({
  theme,
  showMoon,
  showSun,
  scale = 1,
  glow = "rgba(220,230,255,0.25)",
}: Props) {
  if (!showMoon && !showSun) return null;

  const moonWarm = theme === "wine";
  const sunLow = theme === "dawn-dusk";
  const sunHigh = theme === "summer";

  return (
    <>
      {showMoon && (
        <div
          className="celestial-moon absolute"
          style={{
            top: "11%",
            right: moonWarm ? "22%" : "15%",
            width: 120 * scale,
            height: 120 * scale,
          }}
        >
          {/* Outer halo — slow breathe only */}
          <div
            className="celestial-moon-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "220%",
              height: "220%",
              background: moonWarm
                ? `radial-gradient(circle, rgba(220,160,160,0.2) 0%, ${glow} 25%, transparent 68%)`
                : `radial-gradient(circle, rgba(230,235,255,0.22) 0%, ${glow} 28%, transparent 70%)`,
              filter: "blur(8px)",
            }}
          />
          {/* Mid bloom */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "130%",
              height: "130%",
              background: moonWarm
                ? "radial-gradient(circle, rgba(255,230,230,0.28) 0%, rgba(200,140,140,0.08) 50%, transparent 72%)"
                : "radial-gradient(circle, rgba(245,248,255,0.32) 0%, rgba(180,195,220,0.1) 48%, transparent 72%)",
              filter: "blur(2px)",
            }}
          />
          {/* Solid disc */}
          <div
            className="celestial-moon-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "42%",
              height: "42%",
              background: moonWarm
                ? "radial-gradient(circle at 35% 32%, #f8ece8 0%, #e8d0c8 42%, #c8a898 78%, #a88880 100%)"
                : "radial-gradient(circle at 35% 32%, #f4f6fa 0%, #e4eaf2 40%, #c5cedd 75%, #9aabc0 100%)",
              boxShadow: moonWarm
                ? "0 0 24px 6px rgba(220,160,150,0.25), inset 0 0 12px rgba(255,255,255,0.35)"
                : "0 0 28px 8px rgba(200,215,240,0.22), inset 0 0 14px rgba(255,255,255,0.4)",
            }}
          />
          {/* Soft terminator / rim (not a hard white ring) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "42%",
              height: "42%",
              background:
                "radial-gradient(circle at 70% 60%, transparent 45%, rgba(0,0,0,0.12) 100%)",
              mixBlendMode: "multiply",
              opacity: 0.45,
            }}
          />
        </div>
      )}

      {showSun && (
        <div
          className="celestial-sun absolute"
          style={
            sunLow
              ? {
                  /* Off-center low-left: avoid poem text in vertical center */
                  left: "14%",
                  bottom: "16%",
                  width: 168 * scale,
                  height: 168 * scale,
                }
              : sunHigh
                ? {
                    top: "10%",
                    right: "10%",
                    width: 128 * scale,
                    height: 128 * scale,
                  }
                : {
                    left: "12%",
                    bottom: "18%",
                    width: 148 * scale,
                    height: 148 * scale,
                  }
          }
        >
          {/* Soft sky tint — dusk only, muted */}
          {sunLow && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "280%",
                height: "160%",
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(160,120,70,0.08) 0%, transparent 65%)",
                filter: "blur(18px)",
              }}
            />
          )}

          {/* Dim halo — no screen blend (was too bright) */}
          <div
            className="celestial-sun-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "165%",
              height: "165%",
              background: sunLow
                ? "radial-gradient(circle, rgba(200,160,100,0.22) 0%, rgba(150,110,60,0.08) 42%, transparent 70%)"
                : "radial-gradient(circle, rgba(210,180,100,0.2) 0%, rgba(160,130,60,0.07) 45%, transparent 70%)",
              filter: "blur(5px)",
            }}
          />

          {/* Larger, matte ink-gold disc */}
          <div
            className="celestial-sun-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "68%",
              height: "68%",
              background: sunLow
                ? "radial-gradient(circle at 38% 34%, #e8d8b8 0%, #c9a66a 42%, #9a7340 78%, #7a5a34 100%)"
                : sunHigh
                  ? "radial-gradient(circle at 36% 32%, #ecdcb0 0%, #cbb06a 50%, #a08040 92%)"
                  : "radial-gradient(circle at 36% 32%, #e6d4a8 0%, #c4a060 50%, #967840 90%)",
              boxShadow: "0 0 20px 6px rgba(140,100,50,0.12)",
              opacity: 0.82,
            }}
          />
        </div>
      )}
    </>
  );
}
