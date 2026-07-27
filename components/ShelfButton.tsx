"use client";

import { useCallback, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  getShelfServerSnapshot,
  getShelfSnapshot,
  isOnShelf,
  subscribeShelf,
  toggleShelf,
} from "@/lib/shelf";
import { useScript } from "./ScriptProvider";

type Props = {
  poemId: string;
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** 右下角「笺」：加入 / 移出本地诗笺 */
export default function ShelfButton({ poemId, className = "" }: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();
  const shelf = useSyncExternalStore(
    subscribeShelf,
    getShelfSnapshot,
    getShelfServerSnapshot,
  );
  const saved = isOnShelf(poemId, shelf);

  const onToggle = useCallback(() => {
    toggleShelf(poemId);
  }, [poemId]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? t("移出诗笺") : t("收入诗笺")}
      title={saved ? t("移出诗笺") : t("收入诗笺")}
      className={`fixed bottom-3 right-3 z-50 flex h-10 w-10 items-center justify-center font-sans text-sm tracking-[0.35em] mix-blend-difference transition-opacity duration-500 md:bottom-4 md:right-4 ${
        saved
          ? "text-cinnabar opacity-90"
          : "text-xuan opacity-35 hover:opacity-90"
      } ${className}`}
    >
      <span className="relative inline-grid place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={saved ? "on" : "off"}
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
            {t("笺")}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
