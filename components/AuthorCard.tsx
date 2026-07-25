"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Author } from "@/lib/types";
import { useScript } from "./ScriptProvider";

type Props = {
  author: Author;
  index?: number;
};

export default function AuthorCard({ author, index = 0 }: Props) {
  const { tAuthor } = useScript();
  const display = tAuthor(author);
  const seal = display.name.slice(0, 1);
  const reduce = useReducedMotion();
  const enterDelay = Math.min(index, 8) * 0.05;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: reduce ? 0 : enterDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/author/${author.slug}`}
        className="group flex flex-col items-center gap-5 rounded-sm border border-transparent px-6 py-8 transition-all duration-500 hover:border-xuan/10 hover:bg-xuan/[0.03] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border border-cinnabar/50 transition-transform duration-700 group-hover:scale-105"
            style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
          />
          <span className="font-wenkai text-2xl tracking-widest text-cinnabar">
            {seal}
          </span>
        </div>
        <div className="text-center">
          <h3 className="type-display mb-1 text-lg tracking-[0.3em]">
            {display.name}
          </h3>
          <p className="type-dynasty text-xs">{display.dynasty}</p>
        </div>
        <p className="line-clamp-2 max-w-[14rem] text-center font-serif text-xs leading-relaxed tracking-wider text-[color:var(--type-meta)]">
          {display.bio}
        </p>
      </Link>
    </motion.article>
  );
}
