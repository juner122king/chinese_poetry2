"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { getPoemById } from "@/data/poems";
import { toHanNumeral } from "@/lib/han-numeral";
import type { Poem } from "@/lib/types";
import {
  clearShelf,
  getShelfServerSnapshot,
  getShelfSnapshot,
  removeFromShelf,
  subscribeShelf,
} from "@/lib/shelf";
import Banxin from "./Banxin";
import PoemCard from "./PoemCard";
import { useScript } from "./ScriptProvider";

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * 诗笺 —— 读者自攒的一叠册页。
 *
 * 移出是两拍：先取出那一张（淡出微缩 0.3s），余下再合拢空位（`layout` 0.45s）。
 * 顺序即实物顺序 —— 抽走一页，叠子才闭合；序号跟着重编是诚实的。
 * 不用 `mode="popLayout"` 让两拍并作一拍：它会把退场那张绝对定位，
 * 在 CSS grid 里需要额外的定位祖先，风险换来的只是省下 0.45s。
 *
 * 空笺与网格的切换是**单向**动效。诗笺存在 localStorage，
 * `getShelfServerSnapshot()` 恒为空，所以每次进入本页都要走一趟「空 → 有」：
 * 若给空笺配退场、给网格配入场，那一趟就会假报一次「笺是空的」。
 * 故空笺只有入场，网格只有退场 —— 只有真正移出最后一篇时才看得见。
 */
export default function ShelfView() {
  const { t } = useScript();
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [live, setLive] = useState("");
  const state = useSyncExternalStore(
    subscribeShelf,
    getShelfSnapshot,
    getShelfServerSnapshot,
  );

  const items: Poem[] = useMemo(() => {
    const list: Poem[] = [];
    for (const id of state.ids) {
      const p = getPoemById(id);
      if (p) list.push(p);
    }
    return list;
  }, [state.ids]);

  // 武装态超时自动解除，避免误触后长期停留在确认态
  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(id);
  }, [armed]);

  function removeOne(id: string) {
    const remaining = state.ids.filter((x) => x !== id).length;
    removeFromShelf(id);
    setLive(t(`已移出 · 余 ${remaining} 篇`));
  }

  function onClearClick() {
    if (!armed) {
      setArmed(true);
      return;
    }
    clearShelf();
    setArmed(false);
    setLive(t("已全部移出"));
  }

  return (
    <Banxin
      volume="诗笺"
      extent={{ count: items.length, unit: "篇" }}
    >
      <span className="sr-only" role="status" aria-live="polite">
        {live}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {items.length === 0 ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center gap-10 py-10"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease }}
          >
            {/* 空笺：这一屏确实是空的，就让它是一张空纸条 */}
            <div className="empty-jian">
              <div className="flex flex-row-reverse items-start gap-6">
                <span className="empty-jian__line">{t("笺尚空")}</span>
                <span className="empty-jian__note">
                  {t("点篇末「笺」字收入")}
                </span>
              </div>
            </div>
            <Link href="/poems" className="text-link-elegant">
              {t("去诗卷")}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="filled"
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease }}
          >
            <div className="mb-10 flex justify-end">
              <button
                type="button"
                onClick={onClearClick}
                onBlur={() => setArmed(false)}
                className={`type-meta text-xs transition-colors duration-300 focus-ring ${
                  armed
                    ? "text-cinnabar"
                    : "hover:text-[color:var(--type-active)]"
                }`}
              >
                {armed ? t("确 定？") : t("全部移出")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false}>
                {items.map((poem, i) => (
                  <motion.div
                    key={poem.id}
                    layout={!reduce}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: reduce ? 0 : 0.3,
                      ease,
                      layout: { duration: reduce ? 0 : 0.45, ease },
                    }}
                    className="relative flex flex-col"
                  >
                    <PoemCard poem={poem} index={i} className="!mb-0 h-full" />

                    {/*
                      「笺」印盖在卡片右上角，与详情页 ShelfButton 同一套字面与朱砂；
                      常显（触屏无 hover），点击即移出。压在角上而非卡内，避开长题。
                    */}
                    <button
                      type="button"
                      onClick={() => removeOne(poem.id)}
                      aria-label={t("移出")}
                      title={t("移出")}
                      className="jian-seal"
                    >
                      {t("笺")}
                    </button>

                    {/* 收入次序：新收在前。此处是读者自攒的有序册页，编号才成立 */}
                    <span className="jian-ordinal" aria-hidden>
                      {toHanNumeral(i + 1)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Banxin>
  );
}
