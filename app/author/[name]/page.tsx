import Link from "next/link";
import { notFound } from "next/navigation";
import AuthorCard from "@/components/AuthorCard";
import AuthorPageHeader from "@/components/AuthorPageHeader";
import AuthorWorksList from "@/components/AuthorWorksList";
import InkBackground from "@/components/InkBackground";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import {
  authors,
  getAuthorBySlug,
  getAuthorTagStats,
  getAuthorWorks,
  getRelatedAuthors,
} from "@/data/authors";

type Props = {
  params: Promise<{ name: string }>;
};

export function generateStaticParams() {
  return authors.map((a) => ({ name: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { name } = await params;
  const author = getAuthorBySlug(name);
  if (!author) return { title: "名家 · 墨韵" };
  return {
    title: `${author.name} · 名家 · 墨韵`,
    description: author.bio,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { name } = await params;
  const author = getAuthorBySlug(name);
  if (!author) notFound();

  const works = getAuthorWorks(author);
  const tagStats = getAuthorTagStats(works, 6);
  const related = getRelatedAuthors(author, 4);

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <AuthorPageHeader author={author} tagStats={tagStats} />
        </ScrollReveal>

        <ScrollReveal>
          <T as="h2" className="type-group-label mb-10 text-center">
            {`本站收录 ${works.length} 篇`}
          </T>
        </ScrollReveal>

        {works.length === 0 ? (
          <p className="type-meta py-12 text-center text-sm">
            <T>本站暂未收录作品。</T>
          </p>
        ) : (
          <AuthorWorksList works={works} />
        )}

        {related.length > 0 && (
          <section className="mt-24">
            <ScrollReveal>
              <T
                as="h2"
                className="type-group-label mb-10 text-center"
              >
                同 朝 名 家
              </T>
            </ScrollReveal>
            <div className="grid auto-rows-fr grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((a, i) => (
                <AuthorCard
                  key={a.slug}
                  author={a}
                  index={i}
                  variant="compact"
                  hideDynasty
                />
              ))}
            </div>
          </section>
        )}

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
