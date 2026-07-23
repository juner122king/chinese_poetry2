import Link from "next/link";
import { notFound } from "next/navigation";
import InkBackground from "@/components/InkBackground";
import PoemCard from "@/components/PoemCard";
import ScrollReveal from "@/components/ScrollReveal";
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

  const seal = author.name.slice(0, 1);

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <header className="mb-20 flex flex-col items-center text-center">
            <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
              <span
                className="absolute inset-0 border border-cinnabar/60"
                style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
              />
              <span className="text-3xl text-cinnabar">{seal}</span>
            </div>
            <p className="mb-3 text-[11px] tracking-[0.45em] text-xuan/40">
              {author.dynasty}
            </p>
            <h1 className="mb-8 text-3xl tracking-[0.45em] text-xuan md:text-4xl">
              {author.name}
            </h1>
            <p className="max-w-lg text-sm leading-[2] tracking-[0.12em] text-xuan/50">
              {author.bio}
            </p>
            <span className="mt-10 h-px w-12 bg-cinnabar/40" />
          </header>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="mb-10 text-center text-sm tracking-[0.4em] text-xuan/40">
            代 表 作 品
          </h2>
        </ScrollReveal>

        <div className="columns-1 gap-6 sm:columns-2">
          {works.map((poem, i) => (
            <PoemCard key={poem.id} poem={poem} index={i} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/poems"
            className="text-xs tracking-[0.35em] text-xuan/35 transition-colors hover:text-cinnabar"
          >
            返回诗词目录
          </Link>
        </div>
      </div>
    </div>
  );
}
