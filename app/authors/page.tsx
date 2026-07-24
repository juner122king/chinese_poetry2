import InkBackground from "@/components/InkBackground";
import AuthorCard from "@/components/AuthorCard";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import AuthorsHeader from "@/components/AuthorsHeader";
import { authors } from "@/data/authors";

export const metadata = {
  title: "诗人 · 墨韵",
  description: "浏览历代诗人，沉浸东方美学。",
};

export default function AuthorsPage() {
  const dynasties = Array.from(new Set(authors.map((a) => a.dynasty)));

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <AuthorsHeader count={authors.length} />
        </ScrollReveal>

        {dynasties.map((dynasty) => {
          const group = authors.filter((a) => a.dynasty === dynasty);
          return (
            <section key={dynasty} className="mb-20">
              <ScrollReveal>
                <div className="mb-10 flex items-center gap-6">
                  <T
                    as="span"
                    className="font-sans text-sm tracking-[0.4em] text-cinnabar/80"
                  >
                    {dynasty}
                  </T>
                  <span className="h-px flex-1 bg-gradient-to-r from-xuan/15 to-transparent" />
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {group.map((author, i) => (
                  <AuthorCard key={author.slug} author={author} index={i} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
