import InkBackground from "@/components/InkBackground";
import PoemCard from "@/components/PoemCard";
import PoemsHeader from "@/components/PoemsHeader";
import PoemsPagination from "@/components/PoemsPagination";
import PoemsToolbar from "@/components/PoemsToolbar";
import ScrollReveal from "@/components/ScrollReveal";
import T from "@/components/T";
import { poems } from "@/data/poems";
import {
  dynastiesFromPoems,
  filterPoems,
  paginatePoems,
  parsePoemListFilters,
  topTagsFromPoems,
  topThemesFromPoems,
} from "@/lib/poems-filter";

export const metadata = {
  title: "诗词 · 墨韵",
  description: "浏览经典诗词，沉浸东方美学。",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PoemsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parsePoemListFilters(sp);
  const filtered = filterPoems(poems, filters);
  const { pageItems, totalPages, page, total } = paginatePoems(
    filtered,
    filters.page,
  );
  const listFilters = { ...filters, page };

  const dynasties = dynastiesFromPoems(poems);
  const tagOptions = topTagsFromPoems(poems, 12);
  const themeOptions = topThemesFromPoems(poems, 10);

  /** 有筛选时扁平展示；无筛选时按朝代分组（仅当前页切片） */
  const showGrouped = !filters.dynasty && !filters.tag && !filters.theme && !filters.q;
  const dynastiesOnPage = showGrouped
    ? Array.from(new Set(pageItems.map((p) => p.dynasty)))
    : [];

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <PoemsHeader count={poems.length} />
        </ScrollReveal>

        <PoemsToolbar
          filters={listFilters}
          dynasties={dynasties}
          tagOptions={tagOptions}
          themeOptions={themeOptions}
          resultCount={total}
        />

        {total === 0 ? (
          <p className="py-20 text-center font-sans text-sm tracking-[0.3em] text-xuan/40">
            <T>未得篇章，可改筛选或清除后再寻。</T>
          </p>
        ) : showGrouped ? (
          dynastiesOnPage.map((dynasty) => {
            const group = pageItems.filter((p) => p.dynasty === dynasty);
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
                <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
                  {group.map((poem, i) => (
                    <PoemCard key={poem.id} poem={poem} index={i} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {pageItems.map((poem, i) => (
              <PoemCard key={poem.id} poem={poem} index={i} />
            ))}
          </div>
        )}

        <PoemsPagination filters={listFilters} totalPages={totalPages} />
      </div>
    </div>
  );
}
