"use client";

import { useState } from "react";
import type { Poem } from "@/lib/types";
import PoemCard from "./PoemCard";
import { useScript } from "./ScriptProvider";

/** 首屏展示篇数；超出后需展开 */
export const AUTHOR_WORKS_PREVIEW = 12;

type Props = {
  works: Poem[];
};

export default function AuthorWorksList({ works }: Props) {
  const { t } = useScript();
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = works.length > AUTHOR_WORKS_PREVIEW;
  const visible =
    expanded || !needsCollapse
      ? works
      : works.slice(0, AUTHOR_WORKS_PREVIEW);
  const hiddenCount = works.length - AUTHOR_WORKS_PREVIEW;

  return (
    <div>
      <div className="columns-1 gap-6 sm:columns-2">
        {visible.map((poem, i) => (
          <PoemCard key={poem.id} poem={poem} index={i} />
        ))}
      </div>

      {needsCollapse && (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          {!expanded ? (
            <>
              <p className="type-meta text-[11px]">
                {t(`尚有 ${hiddenCount} 篇`)}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-link-elegant text-[11px]"
              >
                {t("展开全部")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="type-meta text-[11px] transition-colors duration-300 hover:text-[color:var(--type-active)]"
            >
              {t("收起")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
