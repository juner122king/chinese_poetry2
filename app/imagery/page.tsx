import type { Metadata } from "next";
import Banxin from "@/components/Banxin";
import GroupRule from "@/components/GroupRule";
import ImageryBar from "@/components/ImageryBar";
import InkBackground from "@/components/InkBackground";
import { countPoemsByTag } from "@/data/poems";
import {
  imageryTaxonomy,
  type TagGroup,
} from "@/lib/imagery-taxonomy";
import { buildPoemsHref } from "@/lib/poems-filter";
import { getThemeVisual } from "@/lib/theme-map";

export const metadata: Metadata = {
  title: "意境 · 墨韵",
  description: "按意境归集浏览诗词：四季、山水、花木、人事…",
};

const GROUP_ORDER: TagGroup[] = [
  "四季物候",
  "天象时辰",
  "山水地理",
  "花木禽鱼",
  "人事情感",
  "行旅器物",
];

export default function ImageryPage() {
  const counts = countPoemsByTag();

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    tags: imageryTaxonomy.filter((t) => t.group === group),
  })).filter((g) => g.tags.length > 0);

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10">
        <Banxin
          volume="意境"
          extent={{ count: imageryTaxonomy.length, unit: "目" }}
        >
          {byGroup.map(({ group, tags }, gi) => {
            const groupDelay = Math.min(gi, 4) * 0.04;

            return (
              <section key={group} className="mb-14">
                <GroupRule label={group} delay={groupDelay} />

                <ul className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 lg:grid-cols-3 lg:gap-x-8">
                  {tags.map((tag, i) => {
                    const n = counts.get(tag.id) ?? 0;
                    const visual = getThemeVisual(tag.defaultTheme);

                    return (
                      <ImageryBar
                        key={tag.id}
                        label={tag.label}
                        count={n}
                        href={n > 0 ? buildPoemsHref({ tag: tag.id }) : null}
                        motifs={tag.motifPool.slice(0, 3)}
                        theme={tag.defaultTheme}
                        glow={visual.glow}
                        // 组内逐条错峰；封顶避免末尾几条等太久
                        delay={groupDelay + Math.min(i, 11) * 0.035}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </Banxin>
      </div>
    </div>
  );
}
