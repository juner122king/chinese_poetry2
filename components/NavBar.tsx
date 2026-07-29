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
          className="inline-flex items-center gap-2.5 font-sans text-sm leading-none tracking-[0.3em] text-[color:var(--type-primary)] transition-opacity duration-300 hover:opacity-70"
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
            className="text-[color:var(--type-secondary)] md:hidden"
            aria-label={t("菜单")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-px w-5 bg-current" />
            <span className="mt-1.5 block h-px w-5 bg-current" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-xuan/10 bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col gap-5 px-6 py-6">
              {links.map((link) => {
                const active = link.match(pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`type-nav ${active ? "type-nav--active" : ""}`}
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
