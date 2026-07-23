"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Poem } from "@/lib/types";
import { getBackgroundLabel } from "@/lib/motifs";
import ImageryTags from "./ImageryTags";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";
import { getAuthorByName } from "@/data/authors";

type Props = {
  poem: Poem;
  vertical?: boolean;
  showAuthorLink?: boolean;
  animateEntry?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function PoemDisplay({
  poem,
  vertical = false,
  showAuthorLink = true,
  animateEntry = true,
}: Props) {
  const reduce = useReducedMotion();
  const { tPoem } = useScript();
  const display = tPoem(poem);
  // Lookup by simplified source name (data is always SC)
  const author = getAuthorByName(poem.author);

  const authorNode =
    showAuthorLink && author ? (
      <Link
        href={`/author/${author.slug}`}
        className="tracking-[0.3em] text-xuan/50 transition-colors hover:text-cinnabar"
      >
        {display.dynasty} · {display.author}
      </Link>
    ) : (
      <span className="tracking-[0.3em] text-xuan/50">
        {display.dynasty} · {display.author}
      </span>
    );

  if (vertical) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="vertical-text flex max-h-[80vh] items-start gap-10 md:gap-14">
          <div className="font-wenkai text-sm text-xuan/45">{authorNode}</div>
          <div className="flex flex-col gap-8">
            <h1 className="font-wenkai text-3xl tracking-[0.4em] text-xuan md:text-4xl">
              {display.title}
            </h1>
            <div className="flex gap-5 font-wenkai text-lg leading-[2.2] tracking-[0.25em] text-xuan/85 md:text-xl md:gap-7">
              {display.content.map((line, i) => (
                <motion.p
                  key={`${line}-${i}`}
                  initial={animateEntry && !reduce ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-28 text-center">
      <ScrollReveal delay={0.1}>
        <p className="mb-12 font-wenkai text-xs tracking-[0.45em] text-xuan/45 md:text-sm">
          {authorNode}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <h1 className="mb-16 font-wenkai text-3xl font-normal tracking-[0.35em] text-xuan md:text-5xl md:tracking-[0.4em]">
          {display.title}
        </h1>
      </ScrollReveal>

      <div className="space-y-5 md:space-y-7">
        {display.content.map((line, i) => (
          <ScrollReveal key={`${line}-${i}`} delay={0.08 * i} y={20}>
            <p className="font-wenkai text-lg tracking-[0.35em] text-xuan/90 md:text-2xl md:tracking-[0.4em] md:leading-relaxed">
              {line}
            </p>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.2} className="mt-16">
        <p className="font-sans text-[11px] tracking-[0.4em] text-xuan/30">
          {getBackgroundLabel(display)}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.28} className="mt-8">
        <ImageryTags tags={poem.tags} />
      </ScrollReveal>
    </div>
  );
}
