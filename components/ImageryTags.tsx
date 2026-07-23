"use client";

import type { PoemTag } from "@/lib/types";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import { useScript } from "./ScriptProvider";

type Props = {
  tags: PoemTag[];
  className?: string;
};

/** 轻量意境标签行：春 · 鸟 · 雨（无商业胶囊感） */
export default function ImageryTags({ tags, className = "" }: Props) {
  const { t } = useScript();

  if (!tags?.length) return null;

  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ${className}`}
      aria-label={t("意境")}
    >
      {tags.map((tag) => (
        <li
          key={tag}
          className="font-sans text-[11px] tracking-[0.35em] text-xuan/35 transition-colors hover:text-cinnabar/70"
        >
          {t(getTagLabel(tag))}
        </li>
      ))}
    </ul>
  );
}
