"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useScript } from "./ScriptProvider";

type Props = {
  label: string;
  delay?: number;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "-8% 0px -8% 0px" } as const;

/**
 * 意境分组的组题，与其后那道「这一组到此为止」的横线。
 *
 * 横线自左而右画出来 —— 与版心的版框竖线、意境条的朱砂基线同一手势：
 * 刻本先打界行，后落字。此手势只给这三根线，用满全站就不再是签名。
 *
 * 与站内 `.ink-rule`（梭形短墨线）不是一回事，勿混。
 */
export default function GroupRule({ label, delay = 0 }: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="mb-6 flex items-center gap-6">
        <span className="type-group-label">{t(label)}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-rule-faint to-transparent" />
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-6">
      <motion.span
        className="type-group-label"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, delay, ease }}
      >
        {t(label)}
      </motion.span>
      <motion.span
        className="h-px flex-1 origin-left bg-gradient-to-r from-rule-faint to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, delay: delay + 0.08, ease }}
      />
    </div>
  );
}
