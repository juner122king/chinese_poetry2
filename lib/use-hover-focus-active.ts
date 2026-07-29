"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * hover + focus 合成 active；离开立刻关闭（淡出时长由 CSS / Atmosphere 控制）。
 * leaveDelayMs 仅在需要「先停住再关」时使用，默认 0。
 */
export function useHoverFocusActive(leaveDelayMs = 0) {
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(false);

  const clearLeaveTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyActive = useCallback(
    (delayLeave: boolean) => {
      const on = hoveredRef.current || focusedRef.current;
      if (on) {
        clearLeaveTimer();
        setActive(true);
        return;
      }
      if (delayLeave && leaveDelayMs > 0) {
        clearLeaveTimer();
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          if (!hoveredRef.current && !focusedRef.current) {
            setActive(false);
          }
        }, leaveDelayMs);
        return;
      }
      clearLeaveTimer();
      setActive(false);
    },
    [clearLeaveTimer, leaveDelayMs],
  );

  const onPointerEnter = useCallback(() => {
    hoveredRef.current = true;
    applyActive(false);
  }, [applyActive]);

  const onPointerLeave = useCallback(() => {
    hoveredRef.current = false;
    applyActive(true);
  }, [applyActive]);

  const onFocus = useCallback(() => {
    focusedRef.current = true;
    applyActive(false);
  }, [applyActive]);

  const onBlur = useCallback(() => {
    focusedRef.current = false;
    applyActive(true);
  }, [applyActive]);

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer]);

  return { active, onPointerEnter, onPointerLeave, onFocus, onBlur };
}
