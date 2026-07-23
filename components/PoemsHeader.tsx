"use client";

import { useScript } from "./ScriptProvider";

export default function PoemsHeader({ count }: { count: number }) {
  const { t } = useScript();

  return (
    <header className="mb-20 flex flex-col items-center gap-4 text-center">
      <p className="font-sans text-[11px] tracking-[0.5em] text-xuan/35">
        COLLECTION
      </p>
      <h1 className="font-wenkai text-3xl tracking-[0.45em] text-xuan md:text-4xl">
        {t("诗 词")}
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed tracking-[0.2em] text-xuan/40">
        {t(`卷轴展开，墨香与月光同在。共 ${count} 首经典。`)}
      </p>
      <span className="mt-4 h-px w-12 bg-cinnabar/40" />
    </header>
  );
}
