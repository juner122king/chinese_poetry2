"use client";

import Link from "next/link";
import {
  buildPoemsHref,
  type PoemListFilters,
} from "@/lib/poems-filter";
import { useScript } from "./ScriptProvider";

type Props = {
  filters: PoemListFilters;
  totalPages: number;
};

export default function PoemsPagination({ filters, totalPages }: Props) {
  const { t } = useScript();
  if (totalPages <= 1) return null;

  const { page } = filters;
  const base = {
    dynasty: filters.dynasty,
    tag: filters.tag,
    theme: filters.theme,
    q: filters.q,
  };

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-16 flex items-center justify-center gap-10"
      aria-label={t("分页")}
    >
      {prev ? (
        <Link
          href={buildPoemsHref({ ...base, page: prev })}
          className="text-link-elegant"
          scroll
        >
          {t("上一页")}
        </Link>
      ) : (
        <span className="font-sans text-[11px] tracking-[0.3em] text-xuan/20">
          {t("上一页")}
        </span>
      )}

      <span className="font-sans text-[11px] tracking-[0.35em] text-xuan/40">
        {page} / {totalPages}
      </span>

      {next ? (
        <Link
          href={buildPoemsHref({ ...base, page: next })}
          className="text-link-elegant"
          scroll
        >
          {t("下一页")}
        </Link>
      ) : (
        <span className="font-sans text-[11px] tracking-[0.3em] text-xuan/20">
          {t("下一页")}
        </span>
      )}
    </nav>
  );
}
