"use client";

import { useScript } from "./ScriptProvider";
import type { ScriptMode } from "@/lib/script/types";

type Props = {
  className?: string;
};

const OPTIONS: { mode: ScriptMode; label: string }[] = [
  { mode: "sc", label: "简" },
  { mode: "tc", label: "繁" },
];

export default function ScriptToggle({ className = "" }: Props) {
  const { mode, setMode } = useScript();

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-sans text-xs tracking-[0.2em] ${className}`}
      role="group"
      aria-label="切换简繁体"
    >
      {OPTIONS.map((opt, i) => (
        <span key={opt.mode} className="inline-flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-xuan/25 select-none" aria-hidden="true">
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => setMode(opt.mode)}
            aria-pressed={mode === opt.mode}
            className={`transition-opacity hover:opacity-100 ${
              mode === opt.mode
                ? "text-xuan opacity-100"
                : "text-xuan opacity-40"
            }`}
          >
            {opt.label}
          </button>
        </span>
      ))}
    </div>
  );
}
