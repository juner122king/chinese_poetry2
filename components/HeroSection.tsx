"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import InkBackground from "./InkBackground";
import type { Poem } from "@/lib/types";
import { getThemeVisual } from "@/lib/theme-map";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

type Props = {
  poem: Poem;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection({ poem }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const visual = getThemeVisual(poem.theme);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const lines = poem.content.slice(0, 4);
  let charIndex = 0;

  return (
    <section
      ref={ref}
      className="noise-overlay relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: yBg }}
      >
        <InkBackground theme={poem.theme} />
        {visual.particles !== "none" && (
          <ParticleBackground
            mode={visual.particles}
            safeCenter={visual.particleSafeCenter}
          />
        )}
      </motion.div>

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={reduce ? undefined : { opacity: opacityContent }}
      >
        <motion.p
          className="mb-10 text-[11px] tracking-[0.5em] text-xuan/40 md:text-xs"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease }}
        >
          {poem.dynasty} · {poem.author}
        </motion.p>

        <motion.h1
          className="mb-12 text-4xl font-normal tracking-[0.45em] text-xuan md:text-6xl md:tracking-[0.5em]"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease }}
        >
          {poem.title}
        </motion.h1>

        {/* Character-by-character fade, line by line */}
        <div className="mb-4 space-y-3 md:space-y-4">
          {lines.map((line) => {
            const start = charIndex;
            charIndex += line.length;
            return (
              <p
                key={line}
                className="flex justify-center gap-[0.15em] text-lg tracking-[0.3em] text-xuan/85 md:text-2xl md:tracking-[0.35em]"
              >
                {line.split("").map((ch, i) => (
                  <motion.span
                    key={`${line}-${i}`}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.8 + (start + i) * 0.06,
                      ease,
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </p>
            );
          })}
        </div>

        <motion.div
          className="mt-16 flex flex-col items-center gap-8"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.4, ease }}
        >
          <Link
            href={`/poem/${poem.id}`}
            className="group text-xs tracking-[0.4em] text-xuan/50 transition-colors hover:text-cinnabar"
          >
            展 开 阅 读
            <span className="mt-2 block h-px w-full origin-left scale-x-50 bg-xuan/30 transition-transform duration-500 group-hover:scale-x-100 group-hover:bg-cinnabar/60" />
          </Link>

          <div className="flex flex-col items-center gap-2 text-xuan/25">
            <span className="text-[10px] tracking-[0.3em]">下滑探索</span>
            <span className="block h-8 w-px bg-gradient-to-b from-xuan/30 to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
