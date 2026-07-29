"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PoemTheme } from "@/lib/types";
import { ATMOS_ENTER, ATMOS_EXIT } from "@/lib/atmosphere-timing";
import InkBackground from "./InkBackground";

type Props = {
  theme: PoemTheme;
  active: boolean;
  reduce: boolean;
  /** 确定性构图种子（poem.id / tag） */
  seed?: string;
  /** 入场淡入秒数 */
  enterDuration?: number;
  /** 离场淡出秒数 */
  exitDuration?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 卡片选中态场景：与 Hero 同源 CSS 层（InkBackground intensity=card）。
 * 故意不挂 WebGL：卡片尺度下粒子亚像素且易触发上下文 churn。
 * 仅 active 时挂载，离开后由 AnimatePresence 卸载。
 */
export default function PoemCardAtmosphere({
  theme,
  active,
  reduce,
  seed,
  enterDuration = ATMOS_ENTER,
  exitDuration = ATMOS_EXIT,
}: Props) {
  void reduce;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key={`card-scene-${theme}-${seed ?? ""}`}
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
          <InkBackground
            theme={theme}
            intensity="card"
            seed={seed ?? `card:${theme}`}
          />
          {/* 轻 scrim（/10），hover 是「透出」而非压暗 */}
          <div className="absolute inset-0 bg-ink/10" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
