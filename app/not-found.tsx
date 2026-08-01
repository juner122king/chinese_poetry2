import type { Metadata } from "next";
import Link from "next/link";
import T from "@/components/T";

export const metadata: Metadata = {
  title: "页不存在 · 墨韵",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="type-meta mb-4 tracking-[0.4em]">404</p>
      <T as="h1" className="type-display mb-6 text-2xl tracking-[0.35em]">
        页不存在
      </T>
      <T
        as="p"
        className="mb-10 font-serif text-sm tracking-[0.2em] text-[color:var(--type-meta)]"
      >
        此卷已佚，或尚待编纂。
      </T>
      <Link href="/" className="text-link-elegant">
        <T>归卷首</T>
      </Link>
    </div>
  );
}
