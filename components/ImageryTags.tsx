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
              className="select-none text-[11px] text-[color:var(--type-faint)]"
              aria-hidden
            >
              ·
            </span>
          )}
          <Link
            href={buildPoemsHref({ tag })}
            className="type-tag-link focus-ring"
          >
            {t(getTagLabel(tag))}
          </Link>
        </li>
      ))}
    </ul>
  );
}
