"use client";

import { useEffect } from "react";

/**
 * 根错误页 —— 替换整个根 layout 时仍须自含 <html>/<body>。
 * 此时 globals.css 不可靠，故墨色样式全部内联。
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-Hans">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f1f1f",
          color: "#f5efe2",
          fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <p
            aria-hidden
            style={{
              margin: "0 0 16px",
              fontSize: 12,
              letterSpacing: "0.4em",
              color: "rgba(245,239,226,0.38)",
            }}
          >
            卷 有 阙
          </p>
          <h1
            style={{
              margin: "0 0 24px",
              fontSize: 22,
              letterSpacing: "0.35em",
              fontWeight: 400,
            }}
          >
            此卷暂阙
          </h1>
          <p
            style={{
              margin: "0 0 32px",
              fontSize: 14,
              letterSpacing: "0.2em",
              color: "rgba(245,239,226,0.38)",
            }}
          >
            加载时出了岔子。可重试一次，或稍后再来。
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 13,
              letterSpacing: "0.3em",
              color: "rgba(245,239,226,0.75)",
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationColor: "rgba(178,58,72,0.75)",
            }}
          >
            再试
          </button>
        </div>
      </body>
    </html>
  );
}
