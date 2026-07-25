"use client";

import type { Poem } from "@/lib/types";
import PoemDisplay from "./PoemDisplay";

type Props = {
  poem: Poem;
};

/**
 * 详情阅读壳。
 * 暂时隐藏竖/横切换，固定横排；恢复开关时再接 localStorage + UI。
 */
export default function PoemReadingView({ poem }: Props) {
  return <PoemDisplay poem={poem} vertical={false} />;
}
