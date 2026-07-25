"use client";

import Link from "next/link";
import type { PoemTag } from "@/lib/types";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import { useScript } from "./ScriptProvider";

type Props = {
  tags: PoemTag[];
  className?: string;
};

/** 轻量意境标签行：春 · 鸟 · 雨（可点进诗卷筛选） */
export default function ImageryTags({ tags, className = "" }: Props) {
  const { t } = useScript();

  if (!tags?.length) return null;

  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-2 ${className}`}
      aria-label={t("意境")}
    >
      {tags.map((tag, i) => (
        <li key={tag} className="inline-flex items-center gap-x-2">
          {i > 0 && (
            <span
              className="select-none font-sans text-[11px] text-xuan/20"
              aria-hidden
            >
              ·
            </span>
          )}
          <Link
            href={buildPoemsHref({ tag })}
            className="font-sans text-[11px] tracking-[0.35em] text-xuan/35 transition-colors hover:text-cinnabar/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
          >
            {t(getTagLabel(tag))}
          </Link>
        </li>
      ))}
    </ul>
  );
}
