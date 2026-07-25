"use client";

import { useScript } from "./ScriptProvider";

export default function PoemsHeader({ count }: { count: number }) {
  const { t } = useScript();

  return (
    <header className="mb-20 flex flex-col items-center gap-4 text-center">
      <p className="type-eyebrow">COLLECTION</p>
      <h1 className="type-display text-3xl md:text-4xl">{t("诗 卷")}</h1>
      <p className="mt-2 max-w-md font-serif text-xs leading-relaxed tracking-[0.2em] text-[color:var(--type-meta)]">
        {t(`卷轴展开，墨香与月光同在。共 ${count} 篇。`)}
      </p>
      <span className="mt-4 h-px w-12 bg-cinnabar/40" />
    </header>
  );
}
