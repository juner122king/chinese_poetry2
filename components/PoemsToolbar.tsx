"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { getAuthorBySlug } from "@/data/authors";
import { getTagLabel } from "@/lib/imagery-taxonomy";
import {
  buildPoemsHref,
  hasActivePoemFilters,
  type PoemListFilters,
} from "@/lib/poems-filter";
import type { PoemTag } from "@/lib/types";
import { useScript } from "./ScriptProvider";

type Props = {
  filters: PoemListFilters;
  dynasties: string[];
  tagOptions: PoemTag[];
  resultCount: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

function chipClass(active: boolean) {
  return `poem-filter-chip${active ? " poem-filter-chip--active" : ""}`;
}

function Divider() {
  return (
    <span
      className="select-none text-[10px] text-[color:var(--type-faint)]"
      aria-hidden
    >
      ·
    </span>
  );
}

export default function PoemsToolbar({
  filters,
  dynasties,
  tagOptions,
  resultCount,
}: Props) {
  const { t, tAuthor } = useScript();
  const router = useRouter();
  const reduce = useReducedMotion();
  const searchPanelId = useId();
  const [query, setQuery] = useState(filters.q ?? "");
  const [searchOpen, setSearchOpen] = useState(Boolean(filters.q));
  const active = hasActivePoemFilters(filters);
  const filterAuthor = filters.author
    ? getAuthorBySlug(filters.author)
    : undefined;
  const authorLabel = filterAuthor
    ? tAuthor(filterAuthor).name
    : undefined;

  const base = {
    dynasty: filters.dynasty,
    tag: filters.tag,
    theme: filters.theme,
    author: filters.author,
    q: filters.q,
  };

  useEffect(() => {
    if (filters.q) setSearchOpen(true);
    setQuery(filters.q ?? "");
  }, [filters.q]);

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
    <motion.div
      className="mb-8 flex flex-col items-center"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      {/* 主行：朝代 + 检索 + 计数 + 清除 */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          role="group"
          aria-label={t("朝代")}
        >
          <Link
            href={buildPoemsHref({
              ...base,
              dynasty: undefined,
              page: 1,
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

        <Divider />

        <button
          type="button"
          className="type-meta text-[11px] transition-colors duration-300 hover:text-[color:var(--type-active)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
          aria-expanded={searchOpen}
          aria-controls={searchPanelId}
          onClick={() => setSearchOpen((o) => !o)}
        >
          {searchOpen ? t("收起") : t("检索")}
        </button>

        <Divider />

        {authorLabel && (
          <>
            <Link
              href={`/author/${filters.author}`}
              className="type-meta text-[11px] transition-colors duration-300 hover:text-[color:var(--type-active)]"
              scroll={false}
            >
              {t(`名家 · ${authorLabel}`)}
            </Link>
            <Link
              href={buildPoemsHref({
                ...base,
                author: undefined,
                page: 1,
              })}
              className="type-meta text-[11px] transition-colors duration-300 hover:text-[color:var(--type-active)]"
              scroll={false}
            >
              {t("去掉")}
            </Link>
            <Divider />
          </>
        )}

        <p className="type-meta text-[11px]">{t(`得 ${resultCount} 篇`)}</p>

        {active && (
          <>
            <Divider />
            <Link
              href="/poems"
              className="text-link-elegant text-[11px]"
              scroll={false}
            >
              {t("清除筛选")}
            </Link>
          </>
        )}
      </div>

      {/* 意境：无独立标题行 */}
      <div
        className="mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5"
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

      <AnimatePresence initial={false}>
        {searchOpen ? (
          <motion.form
            id={searchPanelId}
            key="search-panel"
            onSubmit={submitSearch}
            className="mt-3 flex w-full max-w-xs items-end gap-3 overflow-hidden"
            initial={
              reduce ? { opacity: 1 } : { opacity: 0, height: 0, y: -4 }
            }
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={
              reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -2 }
            }
            transition={{ duration: reduce ? 0.12 : 0.35, ease }}
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t("检索题名或作者")}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("题名 · 作者")}
                autoFocus={!filters.q}
                className="w-full border-0 border-b border-xuan/20 bg-transparent px-0 py-1.5 font-sans text-xs tracking-[0.2em] text-[color:var(--type-primary)] placeholder:text-[color:var(--type-quiet)] transition-[border-color] duration-300 focus:border-cinnabar/50 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="type-meta shrink-0 pb-1.5 text-[11px] transition-colors duration-300 hover:text-[color:var(--type-active)]"
            >
              {t("寻")}
            </button>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
