"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { toHanNumeral } from "@/lib/han-numeral";
import FishtailMark from "./FishtailMark";
import { useScript } from "./ScriptProvider";

/** 分页卷：鱼尾下作页码 */
type Folio = { page: number; total: number };
/** 不分页卷：鱼尾下作卷内总量 */
type Extent = { count: number; unit: string };

type Props = {
  /** 卷名：诗卷 / 意境 / 名家 / 诗笺 */
  volume: string;
  folio?: Folio;
  extent?: Extent;
  prevHref?: string | null;
  nextHref?: string | null;
  /** 内容栏宽，与原页面 max-w 对齐 */
  width?: "5xl" | "6xl";
  children: ReactNode;
};

/** 与全站 --ease-elegant 一致 */
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * 落版次第 —— 刻本先打界行，后落字：
 * 界线 → 底纹 → 卷名 → 鱼尾（短促，落定如按压）→ 页码 → 翻页。
 * 总长约 1s，与 Hero 入场同一时间尺度；只动 opacity / transform，不触发布局。
 */
const LAY = {
  rule: { delay: 0, duration: 0.8 },
  wash: { delay: 0.06, duration: 0.7 },
  volume: { delay: 0.14, duration: 0.6 },
  fishtail: { delay: 0.3, duration: 0.45 },
  folio: { delay: 0.42, duration: 0.5 },
  turn: { delay: 0.5, duration: 0.5 },
} as const;

/**
 * 页码有向滚动：往后翻则新数自下升入、旧数向上退出，往前翻反向。
 * 方向由 `custom` 传入（退场中的元素读 AnimatePresence 上那一份）。
 */
const roll = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 8 : -8 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -8 : 8 }),
};

/**
 * 1..total 里字数最多的那个汉数字，用来撑住滚动格。
 * 「九」一字而「十」二字，不预留则翻过位数分界时界线与全卷数要跳一格。
 */
function longestFolio(total: number): string {
  let out = "";
  for (let n = 1; n <= total; n++) {
    const s = toHanNumeral(n);
    if (s.length > out.length) out = s;
  }
  return out;
}

/**
 * 版心 —— 刻本书页中缝。目录四页（诗卷 / 意境 / 名家 / 诗笺）共用一条右缘竖条，
 * 自上而下：卷名 → 鱼尾 → 页码或总量 → 翻页。
 *
 * 鱼尾的位置即真实分界，与刻本一致：**之上恒为卷名，之下恒为「位置或范围」**——
 * 有分页的卷放页码，无分页的卷放卷内总量。不设特例。
 *
 * 竖条在流内（`sticky`），不用 `fixed`：边线因此自然成为内容栏的版框，
 * 且宽屏下版心贴着内容右缘而非漂在视口边上。
 * 移动端降级为内容顶部的横向书眉，翻页留给页尾（拇指可达优于顶部）。
 *
 * 动效分两层，互不打搅：进入路由时整条**落版**（见 `LAY`）；此后翻页只让
 * 「本页」那个数**有向滚动**，界线、卷名、鱼尾一概不动 —— 翻的是页，不是版。
 * `app/template.tsx` 按 segment 重挂，search param 不重挂，所以 `?page=` 变化时
 * 落版不会重放，而 `AnimatePresence` 拿得到真正的 enter / exit。
 */
export default function Banxin({
  volume,
  folio,
  extent,
  prevHref,
  nextHref,
  width = "5xl",
  children,
}: Props) {
  const { t } = useScript();
  const reduce = useReducedMotion();

  const page = folio?.page ?? null;
  const total = folio?.total ?? 0;
  const sizer = useMemo(() => longestFolio(total), [total]);

  // 翻页方向要比对上一次的页码。用 React 官方的「渲染中调整 state」写法记住它：
  // ref 在渲染中读不得，而放进 effect 就晚了一帧 —— 那一帧正是滚动要用方向的时候。
  const [seen, setSeen] = useState(page);
  const [dir, setDir] = useState(1);
  if (page !== seen) {
    setDir(page !== null && seen !== null && page < seen ? -1 : 1);
    setSeen(page);
  }

  // 汉数字只在版心出现；读屏另给阿拉伯数字，不让语调牺牲可读性
  const spoken = folio
    ? `第 ${folio.page} 页，共 ${folio.total} 页`
    : extent
      ? extent.count === 0
        ? "尚未收入"
        : `收 ${extent.count} ${extent.unit}`
      : "";
  // 空卷说「未收」而非「收〇篇」——〇 是数字里的占位符，不是「零个」的说法
  const extentText = extent
    ? extent.count === 0
      ? "未收"
      : `收${toHanNumeral(extent.count)}${extent.unit}`
    : "";

  /**
   * 页码滚动格。竖版心与横书眉共用；字向不同，故字面类名由调用处给：
   * 版心传 `banxin-folio`（竖排），书眉传空串以继承书眉的横排字号。
   */
  const rollBox = (digitClass: string) =>
    folio ? (
      <span className="banxin-roll">
        <span className={`invisible ${digitClass}`.trim()} aria-hidden>
          {sizer}
        </span>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.span
            key={folio.page}
            className={digitClass || undefined}
            custom={dir}
            variants={reduce ? undefined : roll}
            initial={reduce ? false : "enter"}
            animate={reduce ? { opacity: 1 } : "center"}
            exit={reduce ? undefined : "exit"}
            transition={{ duration: reduce ? 0 : 0.3, ease }}
            aria-hidden
          >
            {toHanNumeral(folio.page)}
          </motion.span>
        </AnimatePresence>
      </span>
    ) : null;

  return (
    <div
      className={`mx-auto flex ${
        width === "6xl" ? "max-w-6xl" : "max-w-5xl"
      } px-6 pt-24 pb-28 md:px-10 md:pt-32`}
    >
      <div className="min-w-0 flex-1 md:pr-10">
        <div className="banxin-eave md:hidden">
          <motion.span
            className="banxin-eave-rule"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...LAY.rule, ease }}
            aria-hidden
          />
          <motion.span
            className="banxin-eave-volume"
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...LAY.volume, ease }}
          >
            {t(volume)}
          </motion.span>
          {/* 书眉鱼尾已旋 90°，再叠纵向缩放会压歪尾尖，故只淡入 */}
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...LAY.fishtail, ease }}
          >
            <FishtailMark
              size={14}
              className="-rotate-90 text-[color:var(--rule-line)]"
            />
          </motion.span>
          <motion.span
            className="banxin-num banxin-eave-folio"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...LAY.folio, ease }}
          >
            <span className="sr-only">{t(spoken)}</span>
            {folio ? (
              <>
                {rollBox("")}
                <span aria-hidden>／{toHanNumeral(folio.total)}</span>
              </>
            ) : (
              <span aria-hidden>{t(extentText)}</span>
            )}
          </motion.span>
        </div>

        {children}
      </div>

      <aside className="banxin hidden md:block">
        <motion.span
          className="banxin-rule"
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ ...LAY.rule, ease }}
          aria-hidden
        />
        <motion.span
          className="banxin-wash"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...LAY.wash, ease }}
          aria-hidden
        />

        <div className="banxin-plate">
          <motion.span
            className="banxin-volume"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...LAY.volume, ease }}
          >
            {t(volume)}
          </motion.span>

          {/* 鱼尾自平顶压下，落定即分出卷名与页码 */}
          <motion.span
            className="banxin-fishtail"
            style={{ transformOrigin: "top" }}
            initial={reduce ? false : { opacity: 0, scaleY: 0.55 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ ...LAY.fishtail, ease }}
          >
            <FishtailMark size={19} />
          </motion.span>

          <motion.span
            className="banxin-below"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...LAY.folio, ease }}
          >
            <span className="sr-only">{t(spoken)}</span>
            {folio ? (
              <>
                {rollBox("banxin-folio")}
                <span className="banxin-hair" aria-hidden />
                <span className="banxin-folio" aria-hidden>
                  {toHanNumeral(folio.total)}
                </span>
              </>
            ) : (
              <span className="banxin-folio" aria-hidden>
                {t(extentText)}
              </span>
            )}
          </motion.span>

          {folio && (prevHref || nextHref) ? (
            <motion.nav
              className="banxin-turn-group"
              aria-label={t("分页")}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...LAY.turn, ease }}
            >
              {prevHref ? (
                <Link
                  href={prevHref}
                  className="banxin-turn"
                  aria-label={t("上一页")}
                  title={t("上一页")}
                  scroll
                >
                  {t("上")}
                </Link>
              ) : (
                <span className="banxin-turn banxin-turn--off" aria-hidden>
                  {t("上")}
                </span>
              )}
              {nextHref ? (
                <Link
                  href={nextHref}
                  className="banxin-turn"
                  aria-label={t("下一页")}
                  title={t("下一页")}
                  scroll
                >
                  {t("下")}
                </Link>
              ) : (
                <span className="banxin-turn banxin-turn--off" aria-hidden>
                  {t("下")}
                </span>
              )}
            </motion.nav>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
