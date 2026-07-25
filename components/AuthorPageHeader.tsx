"use client";

import type { Author } from "@/lib/types";
import { useScript } from "./ScriptProvider";

export default function AuthorPageHeader({ author }: { author: Author }) {
  const { tAuthor } = useScript();
  const display = tAuthor(author);
  const seal = display.name.slice(0, 1);

  return (
    <header className="mb-20 flex flex-col items-center text-center">
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
        <span
          className="absolute inset-0 border border-cinnabar/60"
          style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
        />
        <span className="font-wenkai text-3xl text-cinnabar">{seal}</span>
      </div>
      <p className="type-dynasty mb-3 text-[11px] tracking-[0.45em]">
        {display.dynasty}
      </p>
      <h1 className="type-display mb-8 text-3xl md:text-4xl">{display.name}</h1>
      <p className="max-w-lg font-serif text-sm leading-[2] tracking-[0.12em] text-[color:var(--type-secondary)]">
        {display.bio}
      </p>
      <span className="mt-10 h-px w-12 bg-[color:var(--type-faint)]" />
    </header>
  );
}
