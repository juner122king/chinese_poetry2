"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { getPoemById } from "@/data/poems";
import type { Poem } from "@/lib/types";
import {
  clearShelf,
  getShelfServerSnapshot,
  getShelfSnapshot,
  removeFromShelf,
  subscribeShelf,
} from "@/lib/shelf";
import PoemCard from "./PoemCard";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

export default function ShelfView() {
  const { t } = useScript();
  const state = useSyncExternalStore(
    subscribeShelf,
    getShelfSnapshot,
    getShelfServerSnapshot,
  );

  const items: Poem[] = useMemo(() => {
    const list: Poem[] = [];
    for (const id of state.ids) {
      const p = getPoemById(id);
      if (p) list.push(p);
    }
    return list;
  }, [state.ids]);

  return (
    <>
      <ScrollReveal>
        <header className="mb-16 flex flex-col items-center gap-4 text-center">
          <p className="type-eyebrow">SHELF</p>
          <h1 className="type-display text-3xl md:text-4xl">{t("诗 笺")}</h1>
          <p className="mt-2 max-w-md font-serif text-xs leading-relaxed tracking-[0.2em] text-[color:var(--type-meta)]">
            {t("收入本机，不云不散。刷新仍在。")}
          </p>
          <span className="mt-4 h-px w-12 bg-[color:var(--type-faint)]" />
        </header>
      </ScrollReveal>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-8 py-16 text-center">
          <p className="type-meta text-sm">
            {t("笺尚空，可在篇末点「笺」收入。")}
          </p>
          <Link href="/poems" className="text-link-elegant">
            {t("去诗卷")}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-6">
            <p className="type-meta">{t(`收 ${items.length} 篇`)}</p>
            <button
              type="button"
              onClick={() => clearShelf()}
              className="type-meta text-xs transition-colors duration-300 hover:text-[color:var(--type-active)]"
            >
              {t("清空诗笺")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((poem, i) => (
              <div key={poem.id} className="flex flex-col">
                <PoemCard poem={poem} index={i} className="!mb-0 h-full" />
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => removeFromShelf(poem.id)}
                    className="type-quiet text-[11px] tracking-[0.25em] transition-colors duration-300 hover:text-[color:var(--type-active)]"
                  >
                    {t("移出")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
