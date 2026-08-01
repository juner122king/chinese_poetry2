"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease }}
    >
      {children}
    </motion.div>
  );
}
