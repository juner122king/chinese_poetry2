type Props = {
  className?: string;
  /** CSS width in px；高度按鱼尾比例。默认 20 供竖版心用 */
  size?: number;
};

/** 鱼尾比例：宽扁，两尾尖略短于半高 */
const ASPECT = 14 / 24; // h / w

/**
 * 刻本版心「单黑鱼尾」。
 * 平顶承卷名，下缘开 V 形缺口分出两道尾尖，缺口尖即卷名与页码的真实分界。
 * 用 currentColor 上色，随版心的青黛结构色走。
 */
export default function FishtailMark({ className, size = 20 }: Props) {
  const width = size;
  const height = Math.round(size * ASPECT * 10) / 10;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
      style={{ display: "block" }}
    >
      <path
        d="M0 0H24L17.4 13.4 12 6.4 6.6 13.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
