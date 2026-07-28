"use client";

import Link from "next/link";
import type { PoemTag } from "@/lib/types";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

/** 首页意境入门：克制入口，不做成仪表盘 */
const GATES: { tag: PoemTag; eyebrow: string }[] = [
  { tag: "spring", eyebrow: "SEASON" },
  { tag: "moon", eyebrow: "NIGHT" },
  { tag: "parting", eyebrow: "FAREWELL" },
  { tag: "frontier", eyebrow: "FRONTIER" },
  { tag: "rain", eyebrow: "RAIN" },
  { tag: "wine", eyebrow: "WINE" },
];

type Props = {
  counts: Partial<Record<PoemTag, number>>;
};

export default function HomeImageryGates({ counts }: Props) {
  const { t } = useScript();

  return (
    <section className="relative border-t border-xuan/5 px-6 py-28 md:px-10 md:py-36">
      <div className="relative z-10 mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
            <p className="type-eyebrow">IMAGERY</p>
            <h2 className="type-display text-2xl md:text-3xl">
              {t("按 意 境 入 门")}
            </h2>
            <span className="ink-rule ink-rule--md mt-2" aria-hidden />
          </div>
        </ScrollReveal>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {GATES.map(({ tag, eyebrow }, i) => {
            const n = counts[tag] ?? 0;
            return (
              <li key={tag}>
                <ScrollReveal delay={Math.min(i, 5) * 0.05}>
                  <Link
                    href={buildPoemsHref({ tag })}
                    className="group flex flex-col items-center gap-3 rounded-sm border border-xuan/10 bg-xuan/[0.02] px-4 py-8 text-center transition-[border-color,background-color] duration-500 hover:border-cinnabar/30 hover:bg-xuan/[0.04] md:py-10"
                  >
                    <span className="type-quiet text-[10px] tracking-[0.4em]">
                      {eyebrow}
                    </span>
                    <span className="font-wenkai text-xl tracking-[0.4em] text-[color:var(--type-primary)] transition-colors duration-300 group-hover:text-cinnabar md:text-2xl">
                      {t(getTagLabel(tag))}
                    </span>
                    {n > 0 && (
                      <span className="type-meta text-[11px]">
                        {t(`${n} 篇`)}
                      </span>
                    )}
                  </Link>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>

        <ScrollReveal className="mt-14 text-center" delay={0.1}>
          <Link href="/imagery" className="text-link-elegant">
            {t("遍览意境")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
