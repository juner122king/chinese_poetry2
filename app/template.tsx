"use client";

import { Suspense, type ReactNode } from "react";
import PageTransition from "@/components/PageTransition";

/**
 * useSearchParams（焦点/入场 key）须在 Suspense 内，否则 SSG 会在 /_global-error 等路径报错。
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}
