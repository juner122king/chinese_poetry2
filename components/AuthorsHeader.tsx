"use client";

import { useScript } from "./ScriptProvider";

export default function AuthorsHeader({ count }: { count: number }) {
  const { t } = useScript();

  return (
    <header className="mb-10 flex flex-col items-center gap-3 text-center md:mb-12">
      <p className="type-eyebrow">POETS</p>
      <h1 className="type-display text-3xl md:text-4xl">{t("名 家")}</h1>
      <p className="max-w-md font-serif text-xs leading-relaxed tracking-[0.2em] text-[color:var(--type-meta)]">
        {t(`卷轴展开，名家与墨迹同在。共 ${count} 家。`)}
      </p>
      <span className="mt-2 h-px w-12 bg-[color:var(--type-faint)]" />
    </header>
  );
}
