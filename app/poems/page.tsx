import InkBackground from "@/components/InkBackground";
import PoemCard from "@/components/PoemCard";
import ScrollReveal from "@/components/ScrollReveal";
import { poems } from "@/data/poems";

export const metadata = {
  title: "诗词 · 墨韵",
  description: "浏览经典诗词，沉浸东方美学。",
};

export default function PoemsPage() {
  const dynasties = Array.from(new Set(poems.map((p) => p.dynasty)));

  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ScrollReveal>
          <header className="mb-20 flex flex-col items-center gap-4 text-center">
            <p className="text-[11px] tracking-[0.5em] text-xuan/35">
              COLLECTION
            </p>
            <h1 className="text-3xl tracking-[0.45em] text-xuan md:text-4xl">
              诗 词
            </h1>
            <p className="mt-2 max-w-md text-xs leading-relaxed tracking-[0.2em] text-xuan/40">
              卷轴展开，墨香与月光同在。共 {poems.length} 首经典。
            </p>
            <span className="mt-4 h-px w-12 bg-cinnabar/40" />
          </header>
        </ScrollReveal>

        {dynasties.map((dynasty) => {
          const group = poems.filter((p) => p.dynasty === dynasty);
          return (
            <section key={dynasty} className="mb-20">
              <ScrollReveal>
                <div className="mb-10 flex items-center gap-6">
                  <span className="text-sm tracking-[0.4em] text-cinnabar/80">
                    {dynasty}
                  </span>
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
        })}
      </div>
    </div>
  );
}
