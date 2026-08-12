import type { Metadata } from "next";
import InkBackground from "@/components/InkBackground";
import Banxin from "@/components/Banxin";
import PoemCard from "@/components/PoemCard";
import PoemsPagination from "@/components/PoemsPagination";
import PoemsToolbar from "@/components/PoemsToolbar";
import T from "@/components/T";
import { poems } from "@/data/poems";
import {
  buildPoemsHref,
  dynastiesFromPoems,
  filterPoems,
  paginatePoems,
  parsePoemListFilters,
  topTagsFromPoems,
} from "@/lib/poems-filter";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

const poemsDescription = "浏览经典唐诗宋词，按朝代与意境筛选，沉浸东方美学。";

export const metadata: Metadata = {
  title: "诗词",
  description: poemsDescription,
  alternates: {
    canonical: "/poems",
  },
  openGraph: {
    title: `诗词 · ${SITE_NAME}`,
    description: poemsDescription,
    url: absoluteUrl("/poems"),
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `诗词 · ${SITE_NAME}`,
    description: poemsDescription,
  },
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

  // 版心翻页：复用 buildPoemsHref，翻页不丢筛选
  const turnBase = { ...filters, page: undefined };

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10">
        <Banxin
          volume="诗卷"
          folio={{ page, total: totalPages }}
          prevHref={
            page > 1 ? buildPoemsHref({ ...turnBase, page: page - 1 }) : null
          }
          nextHref={
            page < totalPages
              ? buildPoemsHref({ ...turnBase, page: page + 1 })
              : null
          }
        >
          <PoemsToolbar
            filters={listFilters}
            dynasties={dynasties}
            tagOptions={tagOptions}
            resultCount={total}
          />

          {total === 0 ? (
            <div
              className="flex flex-col items-center gap-10 py-16"
              role="status"
            >
              <div className="empty-jian">
                <div className="flex flex-row-reverse items-start gap-6">
                  <span className="empty-jian__line">
                    <T>未得篇章</T>
                  </span>
                  <span className="empty-jian__note">
                    <T>可改筛选或清除后再寻</T>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2">
              {pageItems.map((poem, i) => (
                <PoemCard key={poem.id} poem={poem} index={i} />
              ))}
            </div>
          )}

          <PoemsPagination filters={listFilters} totalPages={totalPages} />
        </Banxin>
      </div>
    </div>
  );
}
