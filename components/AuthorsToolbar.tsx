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
import {
  buildAuthorsHref,
  hasActiveAuthorFilters,
  type AuthorListFilters,
} from "@/lib/authors-filter";
import { useScript } from "./ScriptProvider";

type Props = {
  filters: AuthorListFilters;
  dynasties: string[];
  resultCount: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

function chipClass(active: boolean) {
  return `poem-filter-chip${active ? " poem-filter-chip--active" : ""}`;
}

export default function AuthorsToolbar({
  filters,
  dynasties,
  resultCount,
}: Props) {
  const { t } = useScript();
  const router = useRouter();
  const reduce = useReducedMotion();
  const searchPanelId = useId();
  const [query, setQuery] = useState(filters.q ?? "");
  const [searchOpen, setSearchOpen] = useState(Boolean(filters.q));
  const active = hasActiveAuthorFilters(filters);

  useEffect(() => {
    if (filters.q) setSearchOpen(true);
    setQuery(filters.q ?? "");
  }, [filters.q]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(
      buildAuthorsHref({
        dynasty: filters.dynasty,
        q: q || undefined,
      }),
    );
  }

  return (
    <div className="mb-12 flex flex-col items-center gap-6">
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        role="group"
        aria-label={t("朝代")}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: reduce ? 0 : 0, ease }}
      >
        <Link
          href={buildAuthorsHref({ q: filters.q })}
          className={chipClass(!filters.dynasty)}
          scroll={false}
        >
          {t("全部")}
        </Link>
        {dynasties.map((d) => (
          <Link
            key={d}
            href={buildAuthorsHref({
              dynasty: filters.dynasty === d ? undefined : d,
              q: filters.q,
            })}
            className={chipClass(filters.dynasty === d)}
            scroll={false}
          >
            {t(d)}
          </Link>
        ))}
      </motion.div>

      <motion.div
        className="flex w-full max-w-xs flex-col items-center gap-3"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: reduce ? 0 : 0.08, ease }}
      >
        <button
          type="button"
          className="type-meta transition-colors duration-300 hover:text-[color:var(--type-active)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-cinnabar/50"
          aria-expanded={searchOpen}
          aria-controls={searchPanelId}
          onClick={() => setSearchOpen((o) => !o)}
        >
          {searchOpen ? t("收起") : t("检索")}
        </button>

        <AnimatePresence initial={false}>
          {searchOpen ? (
            <motion.form
              id={searchPanelId}
              key="search-panel"
              onSubmit={submitSearch}
              className="flex w-full items-end gap-3 overflow-hidden"
              initial={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 0, height: 0, y: -6 }
              }
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0, y: -4 }
              }
              transition={{ duration: reduce ? 0.15 : 0.48, ease }}
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">{t("检索姓名")}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("姓名")}
                  autoFocus={!filters.q}
                  className="w-full border-0 border-b border-xuan/20 bg-transparent px-0 py-2 font-sans text-xs tracking-[0.2em] text-[color:var(--type-primary)] placeholder:text-[color:var(--type-quiet)] transition-[border-color] duration-300 focus:border-cinnabar/50 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="type-meta shrink-0 pb-2 transition-colors duration-300 hover:text-[color:var(--type-active)]"
              >
                {t("寻")}
              </button>
            </motion.form>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-1.5 text-center"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: reduce ? 0 : 0.14, ease }}
      >
        <p className="type-meta">{t(`得 ${resultCount} 家`)}</p>
        {active && (
          <Link
            href="/authors"
            className="text-link-elegant text-[11px]"
            scroll={false}
          >
            {t("清除筛选")}
          </Link>
        )}
      </motion.div>
    </div>
  );
}
