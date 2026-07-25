import Link from "next/link";
import { notFound } from "next/navigation";
import InkBackground from "@/components/InkBackground";
import PoemCard from "@/components/PoemCard";
import ScrollReveal from "@/components/ScrollReveal";
import AuthorPageHeader from "@/components/AuthorPageHeader";
import T from "@/components/T";
import { authors, getAuthorBySlug } from "@/data/authors";
import { getPoemById } from "@/data/poems";

type Props = {
  params: Promise<{ name: string }>;
};

export function generateStaticParams() {
  return authors.map((a) => ({ name: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { name } = await params;
  const author = getAuthorBySlug(name);
  if (!author) return { title: "诗人 · 墨韵" };
  return {
    title: `${author.name} · 墨韵`,
    description: author.bio,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { name } = await params;
  const author = getAuthorBySlug(name);
  if (!author) notFound();

  const works = author.poemIds
    .map((id) => getPoemById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <AuthorPageHeader author={author} />
        </ScrollReveal>

        <ScrollReveal>
          <T
            as="h2"
            className="type-group-label mb-10 text-center"
          >
            代 表 作 品
          </T>
        </ScrollReveal>

        <div className="columns-1 gap-6 sm:columns-2">
          {works.map((poem, i) => (
            <PoemCard key={poem.id} poem={poem} index={i} />
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-10">
          <Link
            href="/authors"
            className="type-meta text-xs transition-colors duration-300 hover:text-[color:var(--type-active)]"
          >
            <T>返回名家目录</T>
          </Link>
          <Link
            href="/poems"
            className="type-meta text-xs transition-colors duration-300 hover:text-[color:var(--type-active)]"
          >
            <T>返回诗卷目录</T>
          </Link>
        </div>
      </div>
    </div>
  );
}
