import { notFound } from "next/navigation";
import PoemAdjacentNav from "@/components/PoemAdjacentNav";
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
    description: poem.content.join(""),
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
      {/* Soft fade under nav: content under this band softens, full block stays opaque */}
      <div className="poem-top-veil" aria-hidden="true" />
      <PoemDisplay poem={poem} />
      <PoemAdjacentNav prev={prev} next={next} />
    </div>
  );
}
