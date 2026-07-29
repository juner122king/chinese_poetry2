"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "article" | "p" | "h2" | "h3" | "span";
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  as = "div",
}: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  // 减少动态时仍须保留 as：硬编码 div 会在 as="li"/"p" 处产生非法嵌套
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </MotionTag>
  );
}
