"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "首页" },
  { href: "/poems", label: "诗词" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="text-sm tracking-[0.35em] text-xuan transition-opacity hover:opacity-70"
        >
          墨韵
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm tracking-[0.25em] transition-opacity ${
                    active ? "text-xuan opacity-100" : "text-xuan opacity-50 hover:opacity-90"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-2 left-1/2 h-px w-3 -translate-x-1/2 bg-cinnabar" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="text-xuan/80 md:hidden"
          aria-label="菜单"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-px w-5 bg-current" />
          <span className="mt-1.5 block h-px w-5 bg-current" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-xuan/10 bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col gap-4 px-6 py-6">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm tracking-[0.25em] text-xuan/80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
