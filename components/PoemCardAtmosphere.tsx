"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { PoemTheme } from "@/lib/types";
import { getThemeVisual } from "@/lib/theme-map";
import InkBackground from "./InkBackground";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

type Props = {
  theme: PoemTheme;
  active: boolean;
  reduce: boolean;
  /** 入场淡入秒数；默认与诗卷卡一致 */
  enterDuration?: number;
  /** 离场淡出秒数；加长可做出「慢慢淡去」 */
  exitDuration?: number;
};

/** 卡片内密度倍率：避免迷你区域内粒子过密 */
const CARD_PARTICLE_DENSITY = 0.7;

const DEFAULT_ENTER = 0.45;
const DEFAULT_EXIT = 0.45;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 卡片选中态场景：与 Hero 同源（InkBackground + ParticleBackground）。
 * 仅 active 时挂载，离开后由 AnimatePresence 卸载。
 */
export default function PoemCardAtmosphere({
  theme,
  active,
  reduce,
  enterDuration = DEFAULT_ENTER,
  exitDuration = DEFAULT_EXIT,
}: Props) {
  const visual = getThemeVisual(theme);
  const density = (visual.particleDensity ?? 1) * CARD_PARTICLE_DENSITY;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key={`card-scene-${theme}`}
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: enterDuration, ease: EASE },
          }}
          exit={{
            opacity: 0,
            transition: { duration: exitDuration, ease: EASE },
          }}
        >
          <InkBackground theme={theme} intensity="soft" />
          {!reduce && visual.particles !== "none" && (
            <ParticleBackground
              mode={visual.particles}
              safeCenter={false}
              density={density}
            />
          )}
          {/* 轻 scrim，保证题名/摘句对比度 */}
          <div className="absolute inset-0 bg-ink/25" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
