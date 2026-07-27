import { notFound } from "next/navigation";
import PoemAdjacentNav from "@/components/PoemAdjacentNav";
import PoemKeyboardNav from "@/components/PoemKeyboardNav";
import PoemReadingView from "@/components/PoemReadingView";
import PoemRelated from "@/components/PoemRelated";
import ShelfButton from "@/components/ShelfButton";
import ThemeScene from "@/components/ThemeScene";
import {
  getAdjacentPoems,
  getPoemById,
  getRelatedPoems,
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
  const related = getRelatedPoems(id, 3);

  return (
    <div className="relative min-h-screen">
      <ThemeScene theme={poem.theme} />
      <PoemReadingView poem={poem} />
      <PoemRelated items={related} />
      <PoemAdjacentNav prev={prev} next={next} />
      <PoemKeyboardNav
        prevId={prev?.id ?? null}
        nextId={next?.id ?? null}
      />
      <ShelfButton poemId={poem.id} />
    </div>
  );
}
