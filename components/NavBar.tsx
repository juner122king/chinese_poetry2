"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoMark from "./LogoMark";
import { useScript } from "./ScriptProvider";

const links = [
  {
    href: "/poems",
    label: "诗卷",
    match: (path: string) => path.startsWith("/poem"),
  },
  {
    href: "/imagery",
    label: "意境",
    match: (path: string) => path.startsWith("/imagery"),
  },
  {
    href: "/authors",
    label: "名家",
    match: (path: string) => path.startsWith("/author"),
  },
  {
    href: "/shelf",
    label: "诗笺",
    match: (path: string) => path.startsWith("/shelf"),
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useScript();

  /** 已在首页时点 Logo ≈ F5：硬刷新以重随机 Hero 诗并完整重播入场 */
  function handleLogoClick(e: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    e.preventDefault();
    window.location.assign("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        {/* Logo 不走 difference，保证朱砂内框本色 */}
        <Link
          href="/"
          onClick={handleLogoClick}
          aria-label={t("墨韵")}
          className="focus-ring inline-flex items-center gap-2.5 font-sans text-sm leading-none tracking-[var(--track-ui)] text-[color:var(--type-primary)] transition-opacity duration-300 hover:opacity-70"
        >
          {/* +0.5px：光学对齐中文 em 盒，几何居中时 mark 易略偏上 */}
          <LogoMark size={18} className="block shrink-0 translate-y-[0.5px]" />
          <span className="leading-none">{t("墨韵")}</span>
        </Link>

        {/*
          不用 mix-blend-difference：它会把当前态朱砂 #b23a48 反色
          （墨底→暗红，亮暖氛围区→暗绿）。可读性由 .page-top-veil 负责。
        */}
        <div className="flex items-center gap-8 md:gap-10">
          <ul className="hidden items-center gap-10 md:flex">
            {links.map((link) => {
              const active = link.match(pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`type-nav ${active ? "type-nav--active" : ""}`}
                  >
                    {t(link.label)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="focus-ring flex h-11 w-11 items-center justify-center text-[color:var(--type-secondary)] md:hidden"
            aria-label={t("菜单")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex w-5 flex-col gap-1.5" aria-hidden>
              <span className="block h-px w-full bg-current transition-transform duration-300" />
              <span className="block h-px w-full bg-current transition-transform duration-300" />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-[color:var(--rule-faint)] bg-[color:var(--surface-2)] backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-5">
              {links.map((link) => {
                const active = link.match(pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`type-nav flex min-h-11 items-center ${active ? "type-nav--active" : ""}`}
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
