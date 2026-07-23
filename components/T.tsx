"use client";

import { useScript } from "./ScriptProvider";

/** Client-side Simplified → target script text node. */
export default function T({
  children,
  as: Tag = "span",
  className,
}: {
  children: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "li" | "div";
  className?: string;
}) {
  const { t } = useScript();
  return <Tag className={className}>{t(children)}</Tag>;
}
