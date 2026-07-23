"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Poem } from "@/lib/types";

type Props = {
  poem: Poem;
  index?: number;
  className?: string;
};

export default function PoemCard({ poem, index = 0, className = "" }: Props) {
  return (
    <motion.article
      className={`group break-inside-avoid mb-6 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        duration: 0.85,
        delay: (index % 6) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/poem/${poem.id}`} className="block">
        <div
          className="float-slow relative overflow-hidden rounded-sm border border-xuan/10 bg-xuan/[0.03] px-7 py-9 backdrop-blur-[2px] transition-all duration-700 hover:border-cinnabar/30 hover:bg-xuan/[0.06]"
          style={{ animationDelay: `${(index % 5) * 0.4}s` }}
        >
          <p className="mb-4 text-[11px] tracking-[0.35em] text-xuan/40">
            {poem.dynasty}
          </p>
          <h3 className="mb-3 text-xl font-normal tracking-[0.15em] text-xuan md:text-2xl">
            {poem.title}
          </h3>
          <p className="text-sm tracking-[0.2em] text-xuan/55">{poem.author}</p>
          <div className="mt-6 space-y-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {poem.content.slice(0, 2).map((line) => (
              <p key={line} className="text-xs tracking-widest text-xuan/35">
                {line}
              </p>
            ))}
          </div>
          <span className="absolute bottom-6 right-6 h-1.5 w-1.5 rounded-full bg-cinnabar/0 transition-all duration-500 group-hover:bg-cinnabar/80" />
        </div>
      </Link>
    </motion.article>
  );
}
