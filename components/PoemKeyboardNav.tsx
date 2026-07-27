"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  prevId: string | null;
  nextId: string | null;
  /** 回诗卷；默认 /poems */
  exitHref?: string;
};

/**
 * 详情页键盘翻篇：← 前篇 · → 后篇 · Esc 回诗卷。
 * 输入框聚焦时不拦截。
 */
export default function PoemKeyboardNav({
  prevId,
  nextId,
  exitHref = "/poems",
}: Props) {
  const router = useRouter();

  useEffect(() => {
    function isTypingTarget(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return Boolean(el.closest("[contenteditable='true']"));
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === "Escape") {
        e.preventDefault();
        router.push(exitHref);
        return;
      }
      if (e.key === "ArrowLeft" && prevId) {
        e.preventDefault();
        router.push(`/poem/${prevId}`);
        return;
      }
      if (e.key === "ArrowRight" && nextId) {
        e.preventDefault();
        router.push(`/poem/${nextId}`);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, prevId, nextId, exitHref]);

  return null;
}
