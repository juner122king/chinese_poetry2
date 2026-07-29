"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { getTagLabel, taxonomyById } from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import { getThemeVisual } from "@/lib/theme-map";
import type { PoemTag } from "@/lib/types";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

/** 首页意境入门：六道，克制入口，不做成仪表盘 */
const GATES: PoemTag[] = [
  "spring",
  "moon",
  "parting",
  "frontier",
  "rain",
  "wine",
];

type Props = {
  counts: Partial<Record<PoemTag, number>>;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "-8% 0px -8% 0px" } as const;

/**
 * 动效落在栏上而非 `<li>` 上：`<li>` 携着栏间墨线，
 * 淡入它就把带框一起淡了 —— 带框与栏间竖线一律静止。
 */
const MotionGate = motion.create(Link);

/**
 * 意境带 —— 一条横幅切成六道竖栏，各携自己的主题辉光。
 * 与 `/imagery` 的意境条不同构：那里是全表长列，这里是一条带。
 * 标签竖排，窄栏越窄竖排越合用，故移动端也保持六道不折行。
 *
 * 六道依次升起（`i × 0.07`，六格铺开 0.42s）：辉光本就锚在栏底（`at 50% 100%`），
 * 让它自下滑入被裁掉的那一截，升起是它自己的方向；字随后到。
 * 读作一次横扫，而非六个方块各自蹦出。
 */
export default function HomeImageryGates({ counts }: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();

  return (
    <section className="relative px-6 pb-24 pt-20 md:px-10 md:pb-28 md:pt-24">
      <div className="relative z-10 mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-14 flex flex-col items-center md:mb-16">
            <span className="ink-rule mb-8" aria-hidden />
            <h2 className="type-group-label tracking-[0.55em]">
              {t("按 意 境 入 门")}
            </h2>
          </div>
        </ScrollReveal>

        <ul className="imagery-band">
          {GATES.map((tag, i) => {
            const n = counts[tag] ?? 0;
            const { glow } = getThemeVisual(taxonomyById[tag].defaultTheme);
            const delay = i * 0.07;

            return (
              <li key={tag} className="imagery-band__cell">
                <MotionGate
                  href={buildPoemsHref({ tag })}
                  className="imagery-band__gate"
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: reduce ? 0 : 0.8, delay, ease }}
                >
                  <motion.span
                    className="imagery-band__wash"
                    style={{
                      background: `radial-gradient(ellipse 180% 70% at 50% 100%, ${glow} 0%, transparent 70%)`,
                    }}
                    initial={reduce ? false : { y: "14%" }}
                    whileInView={{ y: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: reduce ? 0 : 1, delay, ease }}
                    aria-hidden
                  />
                  <motion.span
                    className="imagery-band__label"
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={VIEWPORT}
                    transition={{
                      duration: reduce ? 0 : 0.6,
                      delay: reduce ? 0 : delay + 0.12,
                      ease,
                    }}
                  >
                    {t(getTagLabel(tag))}
                  </motion.span>
                  {n > 0 ? (
                    <span className="imagery-band__count">
                      {t(`得 ${n} 篇`)}
                    </span>
                  ) : null}
                </MotionGate>
              </li>
            );
          })}
        </ul>

        <ScrollReveal className="mt-12 text-center" delay={0.1}>
          <Link href="/imagery" className="text-link-elegant">
            {t("遍览意境")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
