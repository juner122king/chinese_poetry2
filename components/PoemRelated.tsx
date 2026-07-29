"use client";

import type { RelatedPoem } from "@/data/poems";
import PoemCard from "./PoemCard";
import ScrollReveal from "./ScrollReveal";
import { useScript } from "./ScriptProvider";

type Props = {
  items: RelatedPoem[];
};

/** 区块标题已表意；卡片不再叠同人/同境眉标，避免「同境」重复。 */
export default function PoemRelated({ items }: Props) {
  const { t } = useScript();

  if (!items.length) return null;

  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 pb-8 pt-8 md:px-10"
      aria-labelledby="related-heading"
    >
      <ScrollReveal>
        <div className="mb-10 flex flex-col items-center">
          <span className="ink-rule mb-8" aria-hidden />
          <h2
            id="related-heading"
            className="type-group-label tracking-[0.55em]"
          >
            {t("同 境 相 逢")}
          </h2>
        </div>
      </ScrollReveal>

      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {items.map(({ poem }, i) => (
          <div key={poem.id} className="break-inside-avoid mb-6">
            <PoemCard poem={poem} index={i} className="!mb-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
