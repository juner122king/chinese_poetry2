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
};

export default function ThemeScene({ theme }: Props) {
  const visual = getThemeVisual(theme);

  return (
    <div className="noise-overlay pointer-events-none fixed inset-0 -z-10">
      <InkBackground theme={theme} />
      {visual.particles !== "none" && (
        <ParticleBackground mode={visual.particles} />
      )}
    </div>
  );
}
