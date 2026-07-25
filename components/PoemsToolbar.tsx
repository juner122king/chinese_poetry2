"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import {
  buildPoemsHref,
  hasActivePoemFilters,
  type PoemListFilters,
} from "@/lib/poems-filter";
import { getThemeVisual } from "@/lib/theme-map";
import type { PoemTag, PoemTheme } from "@/lib/types";
import { useScript } from "./ScriptProvider";

type Props = {
  filters: PoemListFilters;
  dynasties: string[];
  tagOptions: PoemTag[];
  themeOptions: PoemTheme[];
  resultCount: number;
};

function chipClass(active: boolean) {
  return `font-sans text-[11px] tracking-[0.28em] transition-opacity ${
    active
      ? "text-xuan opacity-100"
      : "text-xuan opacity-40 hover:opacity-80"
  }`;
}

export default function PoemsToolbar({
  filters,
  dynasties,
  tagOptions,
  themeOptions,
  resultCount,
}: Props) {
  const { t } = useScript();
  const router = useRouter();
  const [query, setQuery] = useState(filters.q ?? "");
  const active = hasActivePoemFilters(filters);

  const base = {
    dynasty: filters.dynasty,
    tag: filters.tag,
    theme: filters.theme,
    q: filters.q,
  };

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(
      buildPoemsHref({
        ...base,
        q: q || undefined,
        page: 1,
      }),
    );
  }

  return (
    <div className="mb-14 flex flex-col items-center gap-8">
      {/* 朝代 */}
      <div
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        role="group"
        aria-label={t("朝代")}
      >
        <Link
          href={buildPoemsHref({
            tag: filters.tag,
            theme: filters.theme,
            q: filters.q,
          })}
          className={chipClass(!filters.dynasty)}
          scroll={false}
        >
          {t("全部")}
        </Link>
        {dynasties.map((d) => (
          <Link
            key={d}
            href={buildPoemsHref({
              ...base,
              dynasty: filters.dynasty === d ? undefined : d,
              page: 1,
            })}
            className={chipClass(filters.dynasty === d)}
            scroll={false}
          >
            {t(d)}
          </Link>
        ))}
      </div>

      {/* 意境 */}
      <div className="flex max-w-3xl flex-col items-center gap-3">
        <p className="font-sans text-[10px] tracking-[0.4em] text-xuan/30">
          {t("意境")}
        </p>
        <div
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          role="group"
          aria-label={t("意境")}
        >
          {tagOptions.map((tag) => {
            const selected = filters.tag === tag;
            return (
              <Link
                key={tag}
                href={buildPoemsHref({
                  ...base,
                  tag: selected ? undefined : tag,
                  page: 1,
                })}
                className={chipClass(selected)}
                scroll={false}
              >
                {t(getTagLabel(tag))}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 主题（视觉） */}
      <div className="flex max-w-3xl flex-col items-center gap-3">
        <p className="font-sans text-[10px] tracking-[0.4em] text-xuan/30">
          {t("主题")}
        </p>
        <div
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          role="group"
          aria-label={t("主题")}
        >
          {themeOptions.map((theme) => {
            const selected = filters.theme === theme;
            return (
              <Link
                key={theme}
                href={buildPoemsHref({
                  ...base,
                  theme: selected ? undefined : theme,
                  page: 1,
                })}
                className={chipClass(selected)}
                scroll={false}
              >
                {t(getThemeVisual(theme).label)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 轻搜索 */}
      <form
        onSubmit={submitSearch}
        className="flex w-full max-w-xs items-end gap-3"
      >
        <label className="flex-1">
          <span className="sr-only">{t("检索题名或作者")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("题名 · 作者")}
            className="w-full border-0 border-b border-xuan/20 bg-transparent px-0 py-2 font-sans text-xs tracking-[0.2em] text-xuan placeholder:text-xuan/25 focus:border-cinnabar/50 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="pb-2 font-sans text-[11px] tracking-[0.28em] text-xuan/45 transition-colors hover:text-cinnabar"
        >
          {t("寻")}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-sans text-[11px] tracking-[0.3em] text-xuan/35">
          {t(`得 ${resultCount} 篇`)}
        </p>
        {active && (
          <Link
            href="/poems"
            className="text-link-elegant text-[11px]"
            scroll={false}
          >
            {t("清除筛选")}
          </Link>
        )}
      </div>
    </div>
  );
}
