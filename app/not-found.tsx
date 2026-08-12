import type { Metadata } from "next";
import Link from "next/link";
import InkBackground from "@/components/InkBackground";
import T from "@/components/T";

export const metadata: Metadata = {
  title: "页不存在",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 flex flex-col items-center">
        <span className="ink-rule mb-8" aria-hidden />
        <p className="type-meta mb-4">404</p>
        <T as="h1" className="type-display mb-6 text-2xl">
          页不存在
        </T>
        <T
          as="p"
          className="mb-10 max-w-sm font-serif text-sm leading-relaxed text-[color:var(--type-meta)]"
        >
          此卷已佚，或尚待编纂。
        </T>
        <Link href="/" className="text-link-elegant">
          <T>归卷首</T>
        </Link>
      </div>
    </div>
  );
}
