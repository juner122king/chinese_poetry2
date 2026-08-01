"use client";

import { useEffect } from "react";

/**
 * 段级错误页 —— 墨色语汇，与 404 同源（「此卷暂阙」）。
 * 界面语气：说明发生了什么、如何解决；不道歉、不含糊。
 * 定制 Next 以 unstable_retry 重取重渲，替代旧版 reset。
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // 上报到错误监控（当前仅控制台）
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="type-meta mb-4 tracking-[0.4em]" aria-hidden>
        卷 有 阙
      </p>
      <h1 className="type-display mb-6 text-2xl tracking-[0.35em]">
        此卷暂阙
      </h1>
      <p className="mb-10 font-serif text-sm tracking-[0.2em] text-[color:var(--type-meta)]">
        加载时出了岔子。可重试一次，或稍后再来。
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="text-link-elegant"
      >
        再试
      </button>
    </div>
  );
}
