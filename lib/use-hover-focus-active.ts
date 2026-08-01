"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HoverFocusOptions = {
  /** 离开后延迟关闭（ms）；默认 0 立即关 */
  leaveDelayMs?: number;
  /**
   * 进入后延迟打开（ms）。滚动掠过卡片时避免立刻 mount 重场景。
   * 焦点进入不延迟，保证键盘可达。
   */
  enterDelayMs?: number;
};

/**
 * hover + focus 合成 active；离开立刻关闭（淡出时长由 CSS / Atmosphere 控制）。
 */
export function useHoverFocusActive(
  leaveDelayMsOrOptions: number | HoverFocusOptions = 0,
) {
  const options: HoverFocusOptions =
    typeof leaveDelayMsOrOptions === "number"
      ? { leaveDelayMs: leaveDelayMsOrOptions }
      : leaveDelayMsOrOptions;
  const leaveDelayMs = options.leaveDelayMs ?? 0;
  const enterDelayMs = options.enterDelayMs ?? 0;

  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(false);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current != null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current != null) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  }, []);

  const applyActive = useCallback(
    (delayLeave: boolean, delayEnter: boolean) => {
      const on = hoveredRef.current || focusedRef.current;
      if (on) {
        clearLeaveTimer();
        if (delayEnter && enterDelayMs > 0 && hoveredRef.current && !focusedRef.current) {
          clearEnterTimer();
          enterTimerRef.current = setTimeout(() => {
            enterTimerRef.current = null;
            if (hoveredRef.current || focusedRef.current) {
              setActive(true);
            }
          }, enterDelayMs);
          return;
        }
        clearEnterTimer();
        setActive(true);
        return;
      }
      clearEnterTimer();
      if (delayLeave && leaveDelayMs > 0) {
        clearLeaveTimer();
        leaveTimerRef.current = setTimeout(() => {
          leaveTimerRef.current = null;
          if (!hoveredRef.current && !focusedRef.current) {
            setActive(false);
          }
        }, leaveDelayMs);
        return;
      }
      clearLeaveTimer();
      setActive(false);
    },
    [clearEnterTimer, clearLeaveTimer, enterDelayMs, leaveDelayMs],
  );

  const onPointerEnter = useCallback(() => {
    hoveredRef.current = true;
    applyActive(false, true);
  }, [applyActive]);

  const onPointerLeave = useCallback(() => {
    hoveredRef.current = false;
    applyActive(true, false);
  }, [applyActive]);

  const onFocus = useCallback(() => {
    focusedRef.current = true;
    applyActive(false, false);
  }, [applyActive]);

  const onBlur = useCallback(() => {
    focusedRef.current = false;
    applyActive(true, false);
  }, [applyActive]);

  useEffect(
    () => () => {
      clearLeaveTimer();
      clearEnterTimer();
    },
    [clearEnterTimer, clearLeaveTimer],
  );

  return { active, onPointerEnter, onPointerLeave, onFocus, onBlur };
}
