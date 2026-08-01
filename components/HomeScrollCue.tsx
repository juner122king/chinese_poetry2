"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  getHomeAnchorAfter,
  getNextHomeAnchorId,
  scrollToHomeAnchor,
  type HomeAnchorId,
} from "@/lib/scroll-section";
import { useScript } from "./ScriptProvider";

/** 与 Hero 编舞大致同拍：CTA 后收束再出 ↓ */
const ENTER_DELAY_MS = 3200;
const CLICK_LOCK_MS = 550;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 主页固定下拉键：按内容区锚点依次跳转
 * hero → featured → imagery-gates → authors-featured
 * 到底后隐藏。不使用固定像素高度步进。
 */
export default function HomeScrollCue() {
  const reduce = useReducedMotion();
  const { t } = useScript();
  const [entered, setEntered] = useState(false);
  const [nextId, setNextId] = useState<HomeAnchorId | null>("featured");
  const lockUntilRef = useRef(0);
  const rafRef = useRef(0);

  const syncStep = useCallback(() => {
    setNextId(getNextHomeAnchorId());
  }, []);

  useEffect(() => {
    const wait = reduce ? 0 : ENTER_DELAY_MS;
    const id = window.setTimeout(() => setEntered(true), wait);
    return () => window.clearTimeout(id);
  }, [reduce]);

  useEffect(() => {
    const boot = window.setTimeout(syncStep, 0);

    const onScrollOrResize = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        syncStep();
      });
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.clearTimeout(boot);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [syncStep]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const now = performance.now();
    if (now < lockUntilRef.current) return;

    const id = getNextHomeAnchorId();
    if (!id) {
      setNextId(null);
      return;
    }

    lockUntilRef.current = now + CLICK_LOCK_MS;
    scrollToHomeAnchor(id, { reduce: !!reduce, updateHash: true });

    // 乐观推进：居中落地后顶边可能仍 > 顶栏阈值，不能等 sync 才换下一目标
    setNextId(getHomeAnchorAfter(id));

    const wait = reduce ? 0 : CLICK_LOCK_MS + 200;
    window.setTimeout(syncStep, wait);
  }

  const visible = entered && nextId != null;
  const href = nextId ? `#${nextId}` : "#authors-featured";

  return (
    <motion.a
      className={`scroll-cue scroll-cue--fixed${visible ? "" : " scroll-cue--hidden"}`}
      href={href}
      aria-label={t("继续浏览")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={handleClick}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <motion.span
        aria-hidden
        style={{ display: "grid", placeItems: "center" }}
        animate={reduce || !visible ? undefined : { y: [0, 7, 0] }}
        transition={
          reduce || !visible
            ? undefined
            : {
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }
        }
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </motion.span>
    </motion.a>
  );
}
