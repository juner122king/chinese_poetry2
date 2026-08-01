"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** 入场纵向位移；主页滚动路径建议 0，仅 opacity */
  y?: number;
  /** 入场时长（秒） */
  duration?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "article" | "p" | "h2" | "h3" | "span";
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 12,
  duration = 0.45,
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
      transition={{ duration, delay, ease }}
    >
      {children}
    </MotionTag>
  );
}
