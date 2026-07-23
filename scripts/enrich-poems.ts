/**
 * 离线批量为诗词补全关联词（motifs）与 theme。
 *
 * 用法：
 *   npm run enrich:motifs
 *   npx tsx scripts/enrich-poems.ts --force   # 强制重算（仍跳过 locked）
 *   npx tsx scripts/enrich-poems.ts --force --include-locked
 *
 * 数据量大时推荐：
 * 1. 原始数据 ingest → JSON/DB
 * 2. 本脚本规则兜底，或在 generateWithLlm 接入 API 批跑
 * 3. 结果写回存储；网站运行时只读
 * 4. 人工精修后设 motifsLocked: true
 */

import { poems } from "../data/poems";
import {
  generateMotifsRule,
  generateTagsRule,
  inferThemeFromText,
} from "../lib/generate-motifs";
import { getTagLabel } from "../lib/imagery-taxonomy";
import { formatMotifs } from "../lib/types";
import type { Poem } from "../lib/types";

const force = process.argv.includes("--force");
const includeLocked = process.argv.includes("--include-locked");

function enrichOne(poem: Poem): { poem: Poem; skipped: boolean; reason?: string } {
  if (poem.motifsLocked && !includeLocked) {
    return { poem, skipped: true, reason: "locked" };
  }
  if (poem.motifs?.length >= 3 && poem.tags?.length && !force) {
    return { poem, skipped: true, reason: "already-has-motifs" };
  }

  const tags = poem.tags?.length && !force
    ? poem.tags
    : generateTagsRule(poem.title, poem.content);
  const theme =
    poem.theme && !force
      ? poem.theme
      : inferThemeFromText(poem.title, poem.content);
  const motifs = generateMotifsRule({ ...poem, tags, theme });

  return {
    skipped: false,
    poem: {
      ...poem,
      tags,
      theme,
      motifs,
      motifsSource: "rule",
      motifsLocked: poem.motifsLocked ?? false,
    },
  };
}

/**
 * 量产时替换为真实 LLM 调用。务必离线批跑，勿在页面请求路径调用。
 */
export async function generateWithLlm(_poem: Poem): Promise<{
  motifs: string[];
  theme: Poem["theme"];
}> {
  throw new Error(
    "LLM enrich 未接入：请在 generateWithLlm 中配置 API，或使用默认规则模式。",
  );
}

function main() {
  let generated = 0;
  let skipped = 0;

  console.log(`共 ${poems.length} 首\n`);

  for (const raw of poems) {
    const { poem, skipped: wasSkipped, reason } = enrichOne(raw);
    const tagStr = (poem.tags ?? []).map(getTagLabel).join(" ");
    if (wasSkipped) {
      skipped += 1;
      console.log(
        `⏭  [${reason}] ${poem.title}  →  ${formatMotifs(poem.motifs)}  [${tagStr}]`,
      );
    } else {
      generated += 1;
      console.log(
        `✨ [rule] ${poem.title}  →  ${formatMotifs(poem.motifs)}  (${poem.theme})  [${tagStr}]`,
      );
    }
  }

  console.log(`\n生成 ${generated} · 跳过 ${skipped}`);
  console.log(
    "（dry-run）未写回文件。接入 JSON/DB 后，在此脚本中打开写入逻辑即可。",
  );
}

main();
