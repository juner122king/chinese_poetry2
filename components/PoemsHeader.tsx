"use client";

import { useScript } from "./ScriptProvider";

export default function PoemsHeader({ count }: { count: number }) {
  const { t } = useScript();

  return (
    <header className="mb-10 flex flex-col items-center gap-3 text-center md:mb-12">
      <p className="type-eyebrow">COLLECTION</p>
      <h1 className="type-display text-3xl md:text-4xl">{t("诗 卷")}</h1>
      <p className="max-w-md font-serif text-xs leading-relaxed tracking-[0.2em] text-[color:var(--type-meta)]">
        {t(`卷轴展开，墨香与月光同在。共 ${count} 篇。`)}
      </p>
      <span className="ink-rule ink-rule--lg mt-2" aria-hidden />
    </header>
  );
}
