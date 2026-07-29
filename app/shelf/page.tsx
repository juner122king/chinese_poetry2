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
      {/* 版心与内容栏由 ShelfView 里的 Banxin 负责（卷内总量取本机收藏数） */}
      <div className="relative z-10">
        <ShelfView />
      </div>
    </div>
  );
}
