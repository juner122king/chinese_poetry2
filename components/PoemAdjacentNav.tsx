"use client";

import Link from "next/link";
import type { Poem } from "@/lib/types";
import { useScript } from "./ScriptProvider";

type Props = {
  prev: Poem | null;
  next: Poem | null;
};

/** 前后篇导航标题最大显示字数（超出加省略号） */
const ADJACENT_TITLE_MAX = 8;

function clipTitle(title: string, max = ADJACENT_TITLE_MAX): string {
  const chars = Array.from(title);
  if (chars.length <= max) return title;
  return `${chars.slice(0, max).join("")}…`;
}

export default function PoemAdjacentNav({ prev, next }: Props) {
  const { t, tPoem } = useScript();
  const prevDisplay = prev ? tPoem(prev) : null;
  const nextDisplay = next ? tPoem(next) : null;

  return (
    <nav className="relative z-10 mx-auto grid max-w-3xl grid-cols-3 items-center gap-3 px-6 pb-20 pt-4">
      <div className="min-w-0 justify-self-start">
        {prev && prevDisplay ? (
          <Link
            href={`/poem/${prev.id}`}
            className="group block text-left"
            title={prevDisplay.title}
          >
            <span className="type-quiet block transition-colors duration-300 group-hover:text-[color:var(--type-secondary)]">
              {t("前篇")}
            </span>
            <span className="type-author mt-1 block truncate text-sm transition-colors duration-300 group-hover:text-[color:var(--type-active)]">
              {clipTitle(prevDisplay.title)}
            </span>
          </Link>
        ) : null}
      </div>

      <div className="justify-self-center">
        <Link href="/poems" className="text-link-elegant whitespace-nowrap">
          {t("回诗卷")}
        </Link>
      </div>

      <div className="min-w-0 justify-self-end text-right">
        {next && nextDisplay ? (
          <Link
            href={`/poem/${next.id}`}
            className="group block text-right"
            title={nextDisplay.title}
          >
            <span className="type-quiet block transition-colors duration-300 group-hover:text-[color:var(--type-secondary)]">
              {t("后篇")}
            </span>
            <span className="type-author mt-1 block truncate text-sm transition-colors duration-300 group-hover:text-[color:var(--type-active)]">
              {clipTitle(nextDisplay.title)}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
