"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useScript } from "./ScriptProvider";

type Props = {
  className?: string;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * 左下角贴边单字简繁切换（显示当前体）。
 * 点击切换；字面淡入淡出，贴合站点克制动效。
 * 不用 mix-blend-difference（与 ShelfButton 同因）：改用墨色字影保证亮氛围下可读。
 */
export default function ScriptToggle({ className = "" }: Props) {
  const { mode, setMode } = useScript();
  const reduce = useReducedMotion();
  const label = mode === "sc" ? "简" : "繁";
  const next = mode === "sc" ? "tc" : "sc";

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={mode === "sc" ? "切换为繁体" : "切换为简体"}
      className={`fixed bottom-3 left-3 z-50 flex h-10 w-10 items-center justify-center font-sans text-sm tracking-[0.35em] text-xuan opacity-35 transition-opacity duration-500 [text-shadow:0_0_9px_rgba(31,31,31,0.9)] hover:opacity-90 focus-visible:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50 md:bottom-4 md:left-4 ${className}`}
    >
      <span className="relative inline-grid place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode}
            initial={
              reduce ? false : { opacity: 0, y: 5, filter: "blur(3px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? undefined
                : { opacity: 0, y: -5, filter: "blur(3px)" }
            }
            transition={{ duration: reduce ? 0 : 0.45, ease }}
            className="col-start-1 row-start-1"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
