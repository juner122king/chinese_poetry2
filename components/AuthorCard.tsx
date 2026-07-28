import Link from "next/link";
import {
  formatCardBio,
  isPlaceholderBio,
} from "@/lib/author-display";
import { authorYears } from "@/lib/author-years";
import type { Author } from "@/lib/types";
import T from "./T";

type Props = {
  author: Author;
  /** @deprecated 入场动画已移除，保留以免调用方改动 */
  index?: number;
  /** 目录已按朝代分组时隐藏卡片上的朝代，避免重复 */
  hideDynasty?: boolean;
  /**
   * default：目录 / 精选名家，含 bio、略大印玺
   * compact：同朝推荐等窄位，无 bio、更紧凑
   */
  variant?: "default" | "compact";
};

/**
 * 名家卡片（Server Component）。
 * 繁简仅通过轻量 client 节点 `T` 转换。
 */
export default function AuthorCard({
  author,
  hideDynasty = false,
  variant = "default",
}: Props) {
  const compact = variant === "compact";
  const rawBio = formatCardBio(author.bio);
  const showBio = !compact && !isPlaceholderBio(rawBio);
  const seal = author.name.slice(0, 1);
  const years = authorYears(author);
  const yearsLabel = years?.replace(/—/g, " — ");

  const ariaBits = [author.name];
  if (!hideDynasty) ariaBits.push(author.dynasty);
  if (yearsLabel) ariaBits.push(yearsLabel);

  return (
    <article className="h-full">
      <Link
        href={`/author/${author.slug}`}
        aria-label={ariaBits.join(" · ")}
        className={`group flex h-full flex-col items-center rounded-sm border border-transparent text-center transition-all duration-500 hover:border-xuan/10 hover:bg-xuan/[0.03] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50 ${
          compact
            ? "gap-3 px-3 py-5 md:gap-3.5 md:px-4 md:py-6"
            : "gap-5 px-5 py-7 md:px-6 md:py-8"
        }`}
      >
        {/* 印玺：默认淡框，hover 提朱砂，避免目录朱砂墙 */}
        <div
          className={`relative flex shrink-0 items-center justify-center ${
            compact ? "h-12 w-12" : "h-14 w-14 md:h-16 md:w-16"
          }`}
          aria-hidden
        >
          <span
            className="absolute inset-0 rounded-full border border-xuan/25 transition-[border-color,transform] duration-700 group-hover:scale-105 group-hover:border-cinnabar/55"
            style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
          />
          <span
            className={`font-wenkai tracking-widest text-cinnabar/80 transition-colors duration-500 group-hover:text-cinnabar ${
              compact ? "text-xl" : "text-2xl"
            }`}
          >
            <T>{seal}</T>
          </span>
        </div>

        <div className="flex min-w-0 flex-col items-center">
          <T
            as="h3"
            className={`type-display max-w-full truncate px-0.5 transition-colors duration-500 group-hover:text-[color:var(--type-active)] ${
              compact
                ? "mb-0.5 text-base tracking-[0.22em] md:text-lg"
                : "mb-1 text-lg tracking-[0.3em]"
            }`}
          >
            {author.name}
          </T>
          {!hideDynasty && (
            <T
              as="p"
              className={`type-dynasty ${compact ? "text-[10px]" : "text-xs"}`}
            >
              {author.dynasty}
            </T>
          )}
          {yearsLabel && (
            <p
              className={`type-meta tracking-[0.2em] ${
                hideDynasty ? "mt-1" : "mt-0.5"
              } ${compact ? "text-[10px]" : "text-[11px]"}`}
            >
              {yearsLabel}
            </p>
          )}
        </div>

        {/* 固定约两行高度，保证网格齐平；无 bio 也占位 */}
        {!compact && (
          <div className="mt-auto min-h-[2.5rem] w-full max-w-[14rem]">
            {showBio ? (
              <T
                as="p"
                className="line-clamp-2 text-center font-serif text-xs leading-relaxed tracking-wider text-[color:var(--type-meta)]"
              >
                {rawBio}
              </T>
            ) : null}
          </div>
        )}
      </Link>
    </article>
  );
}
