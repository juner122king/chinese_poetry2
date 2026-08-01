"use client";

import { useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * 路由焦点复位 + 轻量入场。
 * 不用 motion/transform 包一层：transform 祖先会让子树 position:fixed
 * 相对该层定位，从而 Hero 意境「钉视口」失效。
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  // 路由（含 query）变更后焦点归 #main，避免掉回 body；与动效无关
  useEffect(() => {
    const main = document.getElementById("main");
    if (main instanceof HTMLElement) {
      main.focus({ preventScroll: true });
    }
  }, [pathname, qs]);

  if (reduce) return <>{children}</>;

  return (
    <div key={`${pathname}?${qs}`} className="page-enter">
      {children}
    </div>
  );
}
