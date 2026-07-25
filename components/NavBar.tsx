"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScriptToggle from "./ScriptToggle";
import { useScript } from "./ScriptProvider";

const links = [
  { href: "/poems", label: "诗卷", match: (path: string) => path.startsWith("/poem") },
  {
    href: "/authors",
    label: "名家",
    match: (path: string) => path.startsWith("/author"),
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
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="font-sans text-sm tracking-[0.35em] text-xuan transition-opacity hover:opacity-70"
        >
          {t("墨韵")}
        </Link>

        <div className="flex items-center gap-8 md:gap-10">
          <ul className="hidden items-center gap-10 md:flex">
            {links.map((link) => {
              const active = link.match(pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative font-sans text-sm tracking-[0.3em] transition-opacity ${
                      active
                        ? "text-xuan opacity-100"
                        : "text-xuan opacity-45 hover:opacity-90"
                    }`}
                  >
                    {t(link.label)}
                    {active && (
                      <span className="absolute -bottom-2 left-1/2 h-px w-3 -translate-x-1/2 bg-cinnabar" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ScriptToggle className="hidden md:inline-flex" />

          <button
            type="button"
            className="text-xuan/80 md:hidden"
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
                      className={`relative inline-block font-sans text-sm tracking-[0.3em] transition-opacity ${
                        active
                          ? "text-xuan opacity-100"
                          : "text-xuan opacity-50 hover:opacity-90"
                      }`}
                    >
                      {t(link.label)}
                      {active && (
                        <span className="absolute -bottom-1.5 left-0 h-px w-3 bg-cinnabar" />
                      )}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <ScriptToggle />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
