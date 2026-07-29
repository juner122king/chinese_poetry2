"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useScript } from "./ScriptProvider";

type Props = {
  label: string;
  /** 本意境的篇数；0 则不作链接 */
  count: number;
  href: string | null;
  /** 主题辉光色，由 `getThemeVisual` 给定 */
  glow: string;
  /** 基线宽度，页面按 √(n/max) 压缩后给定 */
  baseWidth: string;
  delay: number;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "-8% 0px -8% 0px" } as const;

/**
 * 意境条 —— 一目一条，左侧墨线与上下条相接成版框。
 *
 * 入场只淡入，**不加位移**：三十余条同屏，一动位移那道相接的版框就散了。
 * 纸出现之后，底部朱砂基线才自左而右长到既定长度 —— 篇数多寡由此在眼前画出来，
 * 动效在这里不是装饰，是量具。
 *
 * 「减少动态效果」下基线直接渲染成全长：停在 `scaleX(0)` 会把量差这条真实信息抹掉。
 */
export default function ImageryBar({
  label,
  count,
  href,
  glow,
  baseWidth,
  delay,
}: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();

  const face = (
    <>
      <span
        className="imagery-bar__wash"
        style={{
          background: `radial-gradient(ellipse 130% 170% at 100% 50%, ${glow} 0%, transparent 72%)`,
        }}
        aria-hidden
      />
      <span className="imagery-bar__label">{t(label)}</span>
      <span className="imagery-bar__count">
        {count > 0 ? t(`得 ${count} 篇`) : t("暂无")}
      </span>
      {reduce ? (
        <span
          className="imagery-bar__base"
          style={{ width: baseWidth }}
          aria-hidden
        />
      ) : (
        <motion.span
          className="imagery-bar__base"
          style={{ width: baseWidth }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.85, delay: delay + 0.18, ease }}
          aria-hidden
        />
      )}
    </>
  );

  const body = href ? (
    <Link href={href} className="imagery-bar">
      {face}
    </Link>
  ) : (
    // 无篇章不作链接：点进去只会是空结果
    <div className="imagery-bar imagery-bar--empty">{face}</div>
  );

  if (reduce) return <li>{body}</li>;

  return (
    <motion.li
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, delay, ease }}
    >
      {body}
    </motion.li>
  );
}
