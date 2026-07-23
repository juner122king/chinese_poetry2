import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-xs tracking-[0.4em] text-xuan/35">404</p>
      <h1 className="mb-6 text-2xl tracking-[0.35em] text-xuan">页不存在</h1>
      <p className="mb-10 text-sm tracking-[0.2em] text-xuan/40">
        此卷已佚，或尚待编纂。
      </p>
      <Link
        href="/"
        className="text-xs tracking-[0.35em] text-cinnabar/80 transition-opacity hover:opacity-70"
      >
        返回首页
      </Link>
    </div>
  );
}
