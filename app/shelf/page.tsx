import type { Metadata } from "next";
import InkBackground from "@/components/InkBackground";
import ShelfView from "@/components/ShelfView";

export const metadata: Metadata = {
  title: "诗笺 · 墨韵",
  description: "本地收藏的诗词，仅存于本机。",
};

export default function ShelfPage() {
  return (
    <div className="relative min-h-screen">
      <InkBackground theme="landscape" intensity="soft" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-28 md:px-10 md:pt-32">
        <ShelfView />
      </div>
    </div>
  );
}
