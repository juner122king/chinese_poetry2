import InkBackground from "@/components/InkBackground";
import AuthorCard from "@/components/AuthorCard";
import AuthorsHeader from "@/components/AuthorsHeader";
import AuthorsToolbar from "@/components/AuthorsToolbar";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import { authors } from "@/data/authors";
import {
  dynastiesFromAuthors,
  filterAuthors,
  parseAuthorListFilters,
} from "@/lib/authors-filter";

export const metadata = {
  title: "名家 · 墨韵",
  description: "浏览历代名家，沉浸东方美学。",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthorsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const dynasties = dynastiesFromAuthors(authors);
  const filters = parseAuthorListFilters(sp, dynasties);
  const filtered = filterAuthors(authors, filters);

  const dynastiesOnPage = dynasties.filter((d) =>
    filtered.some((a) => a.dynasty === d),
  );

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <AuthorsHeader count={authors.length} />
        </ScrollReveal>

        <AuthorsToolbar
          filters={filters}
          dynasties={dynasties}
          resultCount={filtered.length}
        />

        {filtered.length === 0 ? (
          <p className="type-meta py-20 text-center text-sm">
            <T>未得名家，可改筛选或清除后再寻。</T>
          </p>
        ) : (
          dynastiesOnPage.map((dynasty) => {
            const group = filtered.filter((a) => a.dynasty === dynasty);
            return (
              <section key={dynasty} className="mb-20">
                <ScrollReveal>
                  <div className="mb-10 flex items-center gap-6">
                    <T as="span" className="type-group-label">
                      {dynasty}
                    </T>
                    <span className="h-px flex-1 bg-gradient-to-r from-xuan/15 to-transparent" />
                  </div>
                </ScrollReveal>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {group.map((author, i) => (
                    <AuthorCard
                      key={author.slug}
                      author={author}
                      index={i}
                      hideDynasty
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
