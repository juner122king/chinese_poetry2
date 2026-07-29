"use client";

import dynamic from "next/dynamic";
import InkBackground from "./InkBackground";
import type { PoemTheme } from "@/lib/types";
import { getThemeVisual } from "@/lib/theme-map";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

type Props = {
  theme: PoemTheme;
  /** 确定性构图种子（推荐 poem.id） */
  seed?: string;
};

export default function ThemeScene({ theme, seed }: Props) {
  const visual = getThemeVisual(theme);
  const sceneSeed = seed ?? `theme:${theme}`;

  return (
    <div className="noise-overlay pointer-events-none fixed inset-0 -z-10">
      <InkBackground theme={theme} seed={sceneSeed} />
      {visual.particles !== "none" && (
        <ParticleBackground
          mode={visual.particles}
          safeCenter={visual.particleSafeCenter}
          density={visual.particleDensity}
        />
      )}
    </div>
  );
}
