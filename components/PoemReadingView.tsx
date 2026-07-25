"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { Poem } from "@/lib/types";
import PoemDisplay from "./PoemDisplay";
import { useScript } from "./ScriptProvider";

const STORAGE_KEY = "moyun-read-mode";

export type ReadMode = "vertical" | "horizontal";

/** 无跨标签订阅；仅读客户端偏好 / 视口默认 */
const subscribeNoop = () => () => {};

function getClientMode(): ReadMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "vertical" || v === "horizontal") return v;
  } catch {
    /* private mode */
  }
  return window.matchMedia("(min-width: 768px)").matches
    ? "vertical"
    : "horizontal";
}

type Props = {
  poem: Poem;
};

/**
 * 详情阅读壳：桌面默认竖排、移动默认横排；
 * 用户切换后写入 localStorage。
 */
export default function PoemReadingView({ poem }: Props) {
  const { t } = useScript();
  const resolved = useSyncExternalStore(
    subscribeNoop,
    getClientMode,
    () => "horizontal" as const,
  );
  const [override, setOverride] = useState<ReadMode | null>(null);
  const mode = override ?? resolved;

  const choose = useCallback((next: ReadMode) => {
    setOverride(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="relative">
      <div
        className="relative z-20 flex justify-center px-6 pt-24 md:absolute md:right-8 md:top-28 md:justify-end md:px-0 md:pt-0 lg:right-12"
        role="group"
        aria-label={t("阅读方向")}
      >
        <div className="inline-flex items-center gap-1.5 font-sans text-sm tracking-[0.28em]">
          {(
            [
              { id: "vertical" as const, label: "竖" },
              { id: "horizontal" as const, label: "横" },
            ] as const
          ).map((opt, i) => (
            <span key={opt.id} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-xuan/25 select-none" aria-hidden>
                  /
                </span>
              )}
              <button
                type="button"
                onClick={() => choose(opt.id)}
                aria-pressed={mode === opt.id}
                className={`transition-opacity hover:opacity-100 ${
                  mode === opt.id
                    ? "text-xuan opacity-100"
                    : "text-xuan opacity-40"
                }`}
              >
                {t(opt.label)}
              </button>
            </span>
          ))}
        </div>
      </div>

      <PoemDisplay
        key={`${poem.id}-${mode}`}
        poem={poem}
        vertical={mode === "vertical"}
      />
    </div>
  );
}
