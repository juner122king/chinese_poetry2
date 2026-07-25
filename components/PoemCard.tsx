"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem } from "@/lib/types";
import { toDisplayLines } from "@/lib/poem-lines";
import { useScript } from "./ScriptProvider";

type Props = {
  poem: Poem;
  index?: number;
  className?: string;
};

export default function PoemCard({ poem, index = 0, className = "" }: Props) {
  const { tPoem } = useScript();
  const display = tPoem(poem);
  const reduce = useReducedMotion();
  const enterDelay = Math.min(index, 8) * 0.05;
  const excerpts = toDisplayLines(display.content.slice(0, 2));

  return (
    <motion.article
      className={`group break-inside-avoid mb-6 ${className}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        duration: 0.85,
        delay: reduce ? 0 : enterDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/poem/${poem.id}`}
        className="block rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
      >
        <div className="relative overflow-hidden rounded-sm border border-xuan/10 bg-xuan/[0.03] px-6 py-7 backdrop-blur-[2px] transition-all duration-700 hover:border-cinnabar/30 hover:bg-xuan/[0.06] md:px-7 md:py-8">
          {/* 题：最多两行，槽高稳定，避免长题撑破瀑布流 */}
          <h3
            title={display.title}
            className="mb-2.5 line-clamp-2 min-h-[2.75em] break-words font-wenkai text-xl font-normal leading-snug tracking-[0.06em] text-xuan md:min-h-[2.7em] md:text-[1.35rem]"
          >
            {display.title}
          </h3>

          {/* 作者 · 朝代 同行 */}
          <p className="flex min-w-0 items-baseline gap-x-2.5 font-wenkai text-sm tracking-[0.16em] text-xuan/50">
            <span className="min-w-0 truncate">{display.author}</span>
            <span className="shrink-0 font-sans text-[10px] tracking-[0.35em] text-xuan/35">
              {display.dynasty}
            </span>
          </p>

          {/* 摘句常显；每句单行省略，高度封顶 */}
          <div className="mt-4 min-h-[2.6rem] space-y-1.5 pr-5 opacity-75 transition-opacity duration-500 group-hover:opacity-100">
            {excerpts.map((line) => (
              <p
                key={line.raw}
                className="truncate font-wenkai text-xs tracking-[0.12em] text-xuan/40"
              >
                {line.text}
              </p>
            ))}
          </div>

          {/* 朱砂点：仅 hover / 键盘聚焦时显示 */}
          <span
            className="pointer-events-none absolute bottom-6 right-5 h-1.5 w-1.5 rounded-full bg-cinnabar/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
            aria-hidden
          />
        </div>
      </Link>
    </motion.article>
  );
}
