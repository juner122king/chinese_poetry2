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

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <PoemsHeader count={poems.length} />
        </ScrollReveal>

        <PoemsToolbar
          filters={listFilters}
          dynasties={dynasties}
          tagOptions={tagOptions}
          resultCount={total}
        />

        {total === 0 ? (
          <p className="type-meta py-20 text-center text-sm">
            <T>未得篇章，可改筛选或清除后再寻。</T>
          </p>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2">
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
