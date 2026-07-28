import Link from "next/link";
import { isPlaceholderBio } from "@/lib/author-display";
import type { Author } from "@/lib/types";
import T from "./T";

type Props = {
  author: Author;
  /** @deprecated 入场动画已移除，保留以免调用方改动 */
  index?: number;
  /** 目录已按朝代分组时隐藏卡片上的朝代，避免重复 */
  hideDynasty?: boolean;
};

/**
 * 名家卡片（Server Component）。
 * 繁简仅通过轻量 client 节点 `T` 转换；无 framer-motion，避免目录页百余卡各自水合与 IntersectionObserver。
 */
export default function AuthorCard({
  author,
  hideDynasty = false,
}: Props) {
  const workCount = author.poemIds.length;
  const showBio = !isPlaceholderBio(author.bio);
  const seal = author.name.slice(0, 1);

  return (
    <article>
      <Link
        href={`/author/${author.slug}`}
        className="group flex flex-col items-center gap-5 rounded-sm border border-transparent px-6 py-8 transition-all duration-500 hover:border-xuan/10 hover:bg-xuan/[0.03] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border border-cinnabar/50 transition-transform duration-700 group-hover:scale-105"
            style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
          />
          <span className="font-wenkai text-2xl tracking-widest text-cinnabar">
            <T>{seal}</T>
          </span>
        </div>
        <div className="text-center">
          <T
            as="h3"
            className="type-display mb-1 text-lg tracking-[0.3em]"
          >
            {author.name}
          </T>
          {!hideDynasty && (
            <T as="p" className="type-dynasty text-xs">
              {author.dynasty}
            </T>
          )}
          <T
            as="p"
            className={`type-meta text-[11px] tracking-[0.28em] ${hideDynasty ? "" : "mt-1.5"}`}
          >
            {`本站 ${workCount} 篇`}
          </T>
        </div>
        {showBio && (
          <T
            as="p"
            className="line-clamp-2 max-w-[14rem] text-center font-serif text-xs leading-relaxed tracking-wider text-[color:var(--type-meta)]"
          >
            {author.bio}
          </T>
        )}
      </Link>
    </article>
  );
}
