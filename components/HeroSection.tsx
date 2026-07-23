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
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const lines = poem.content.slice(0, 2);

  return (
    <section ref={ref} className="hero-section noise-overlay">
      <motion.div
        className="hero-scene"
        style={reduce ? undefined : { y: sceneY }}
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
        className="hero-content"
        style={reduce ? undefined : { y: textY }}
      >
        <motion.div
          className="hero-kicker"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 1, ease }}
        >
          {poem.dynasty} · {poem.author}
        </motion.div>

        <div className="hero-poem">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1.1, ease }}
          >
            {poem.title}
          </motion.h1>
          <div className="hero-lines">
            {lines.map((line, lineIndex) => (
              <p key={`${poem.id}-${lineIndex}`}>
                {Array.from(line).map((character, characterIndex) => (
                  <motion.span
                    key={`${line}-${characterIndex}`}
                    initial={
                      reduce ? false : { opacity: 0, filter: "blur(6px)" }
                    }
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      delay: 0.75 + lineIndex * 0.45 + characterIndex * 0.11,
                      duration: 0.9,
                      ease,
                    }}
                  >
                    {character}
                  </motion.span>
                ))}
              </p>
            ))}
          </div>
        </div>

        <motion.div
          className="hero-actions"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.9, ease }}
        >
          <Link href={`/poem/${poem.id}`}>展开阅读</Link>
          <span aria-hidden="true" />
          <Link href="/poems">阅览诗卷</Link>
        </motion.div>
      </motion.div>

      <motion.a
        className="scroll-cue"
        href="#featured"
        aria-label="向下浏览"
        animate={reduce ? undefined : { y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </motion.a>
    </section>
  );
}
