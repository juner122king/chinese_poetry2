"use client";

import Link from "next/link";
import type { Poem } from "@/lib/types";
import { useScript } from "./ScriptProvider";

type Props = {
  prev: Poem | null;
  next: Poem | null;
};

export default function PoemAdjacentNav({ prev, next }: Props) {
  const { t, tPoem } = useScript();
  const prevDisplay = prev ? tPoem(prev) : null;
  const nextDisplay = next ? tPoem(next) : null;

  return (
    <nav className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 pb-20 pt-4">
      {prev && prevDisplay ? (
        <Link
          href={`/poem/${prev.id}`}
          className="group max-w-[40%] text-left"
        >
          <span className="block font-sans text-[10px] tracking-[0.32em] text-xuan/30 transition-colors group-hover:text-xuan/50">
            {t("前篇")}
          </span>
          <span className="mt-1 block truncate font-wenkai text-sm tracking-[0.2em] text-xuan/50 transition-colors group-hover:text-cinnabar">
            {prevDisplay.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      <Link href="/poems" className="text-link-elegant">
        {t("回诗卷")}
      </Link>

      {next && nextDisplay ? (
        <Link
          href={`/poem/${next.id}`}
          className="group max-w-[40%] text-right"
        >
          <span className="block font-sans text-[10px] tracking-[0.32em] text-xuan/30 transition-colors group-hover:text-xuan/50">
            {t("后篇")}
          </span>
          <span className="mt-1 block truncate font-wenkai text-sm tracking-[0.2em] text-xuan/50 transition-colors group-hover:text-cinnabar">
            {nextDisplay.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
