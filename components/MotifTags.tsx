"use client";

import { useScript } from "./ScriptProvider";

type Props = {
  motifs: string[];
  className?: string;
};

/**
 * 诗意题跋：本篇三词印象（不可点）。
 * 归集导航只走 tags（列表筛选 / 意境图鉴），不在此抢入口。
 */
export default function MotifTags({ motifs, className = "" }: Props) {
  const { t } = useScript();
  const list = motifs.filter(Boolean);
  if (!list.length) return null;

  return (
    <p
      className={`font-wenkai text-sm tracking-[0.35em] text-[color:var(--type-secondary)] md:text-[15px] md:tracking-[0.4em] ${className}`}
      aria-label={t("意象")}
    >
      {list.map((motif, i) => (
        <span key={`${motif}-${i}`} className="inline">
          {i > 0 && (
            <span
              className="mx-1.5 select-none text-[11px] text-[color:var(--type-faint)]"
              aria-hidden
            >
              ·
            </span>
          )}
          <span>{motif}</span>
        </span>
      ))}
    </p>
  );
}
