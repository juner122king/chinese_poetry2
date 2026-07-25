type Props = {
  className?: string;
  /** CSS height in px; width follows 竖章比例. Default 18 for nav. */
  size?: number;
};

/** 竖章比例：略高、不瘦条（约 5∶6） */
const ASPECT = 16 / 19; // w / h

/**
 * 墨韵 mark — vertical seal (竖章).
 * Hard outer (墨) + thin cinnabar inner (韵).
 */
export default function LogoMark({ className, size = 18 }: Props) {
  const height = size;
  const width = Math.round(size * ASPECT * 10) / 10;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
      style={{ display: "block", verticalAlign: "middle" }}
    >
      {/* Outer — thick, 直角 */}
      <rect
        x="3"
        y="3"
        width="26"
        height="32"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* Inner — thin 朱砂; slight ease so outer stays the hard edge */}
      <rect
        x="9"
        y="9.5"
        width="14"
        height="19"
        rx="1.2"
        ry="1.2"
        stroke="var(--cinnabar, #b23a48)"
        strokeWidth="0.85"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
