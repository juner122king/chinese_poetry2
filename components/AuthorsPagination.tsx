"use client";

import Link from "next/link";
import {
  buildAuthorsHref,
  type AuthorListFilters,
} from "@/lib/authors-filter";
import { toHanNumeral } from "@/lib/han-numeral";
import { useScript } from "./ScriptProvider";

type Props = {
  filters: AuthorListFilters;
  totalPages: number;
};

/** 移动端页尾翻页。≥768px 交给版心（`Banxin`），此处隐藏 */
export default function AuthorsPagination({ filters, totalPages }: Props) {
  const { t } = useScript();
  if (totalPages <= 1) return null;

  const { page } = filters;
  const base = {
    dynasty: filters.dynasty,
    q: filters.q,
  };

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-16 flex items-center justify-center gap-10 md:hidden"
      aria-label={t("分页")}
    >
      {prev ? (
        <Link
          href={buildAuthorsHref({ ...base, page: prev })}
          className="text-link-elegant"
          scroll
        >
          {t("上一页")}
        </Link>
      ) : (
        <span className="type-meta text-[color:var(--type-faint)]">
          {t("上一页")}
        </span>
      )}

      <span className="banxin-num" aria-current="page">
        <span className="sr-only">
          {t(`第 ${page} 页，共 ${totalPages} 页`)}
        </span>
        <span aria-hidden>
          {toHanNumeral(page)}／{toHanNumeral(totalPages)}
        </span>
      </span>

      {next ? (
        <Link
          href={buildAuthorsHref({ ...base, page: next })}
          className="text-link-elegant"
          scroll
        >
          {t("下一页")}
        </Link>
      ) : (
        <span className="type-meta text-[color:var(--type-faint)]">
          {t("下一页")}
        </span>
      )}
    </nav>
  );
}
