import Link from "next/link";
import { notFound } from "next/navigation";
import PoemDisplay from "@/components/PoemDisplay";
import ThemeScene from "@/components/ThemeScene";
import {
  getAdjacentPoems,
  getPoemById,
  poems,
} from "@/data/poems";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return poems.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const poem = getPoemById(id);
  if (!poem) return { title: "诗词 · 墨韵" };
  return {
    title: `${poem.title} · ${poem.author} · 墨韵`,
    description: poem.content.join("，"),
  };
}

export default async function PoemDetailPage({ params }: Props) {
  const { id } = await params;
  const poem = getPoemById(id);
  if (!poem) notFound();

  const { prev, next } = getAdjacentPoems(id);

  return (
    <div className="relative min-h-screen">
      <ThemeScene theme={poem.theme} />
      <PoemDisplay poem={poem} />

      <nav className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 pb-20 pt-4">
        {prev ? (
          <Link
            href={`/poem/${prev.id}`}
            className="group max-w-[40%] text-left"
          >
            <span className="block text-[10px] tracking-[0.3em] text-xuan/30 transition-colors group-hover:text-xuan/50">
              上一首
            </span>
            <span className="mt-1 block truncate text-sm tracking-[0.2em] text-xuan/50 transition-colors group-hover:text-cinnabar">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        <Link
          href="/poems"
          className="text-[10px] tracking-[0.35em] text-xuan/30 transition-colors hover:text-xuan/60"
        >
          返回目录
        </Link>

        {next ? (
          <Link
            href={`/poem/${next.id}`}
            className="group max-w-[40%] text-right"
          >
            <span className="block text-[10px] tracking-[0.3em] text-xuan/30 transition-colors group-hover:text-xuan/50">
              下一首
            </span>
            <span className="mt-1 block truncate text-sm tracking-[0.2em] text-xuan/50 transition-colors group-hover:text-cinnabar">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
