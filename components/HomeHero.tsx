"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import type { Poem } from "@/lib/types";

type Props = {
  /** featured 池；服务端已保证非空 */
  pool: Poem[];
};

/**
 * 首页 Hero：SSG 先出池首篇（可抓取），挂载后客户端随机换诗。
 * 点 Logo 硬刷新会重新 mount，从而再次随机。
 */
export default function HomeHero({ pool }: Props) {
  const fallback = pool[0]!;
  const [poem, setPoem] = useState(fallback);

  useEffect(() => {
    if (pool.length <= 1) return;
    const next = pool[Math.floor(Math.random() * pool.length)]!;
    setPoem(next);
  }, [pool]);

  return <HeroSection key={poem.id} poem={poem} />;
}
