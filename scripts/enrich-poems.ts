/**
 * 离线批量为 generated 诗词补全关联词（motifs）与 theme，并写回 JSON。
 *
 * 用法：
 *   npm run enrich:motifs
 *   npx tsx scripts/enrich-poems.ts --force
 *   npx tsx scripts/enrich-poems.ts --force --include-locked
 *   npx tsx scripts/enrich-poems.ts --dry-run
 *
 * 推荐主路径：npm run data:build（已含规则 enrich）。
 * 本脚本用于对已有 generated 产物再跑一轮。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateMotifsRule,
  generateTagsRule,
  inferThemeFromText,
} from "../lib/generate-motifs";
import { getTagLabel } from "../lib/imagery-taxonomy";
import { formatMotifs } from "../lib/types";
import type { Poem } from "../lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const poemsPath = join(__dirname, "..", "data", "generated", "poems.json");

const force = process.argv.includes("--force");
const includeLocked = process.argv.includes("--include-locked");
const dryRun = process.argv.includes("--dry-run");

function enrichOne(poem: Poem): { poem: Poem; skipped: boolean; reason?: string } {
  // 与 build-data overrides 一致：人工锁定的名篇不重算
  if (poem.motifsLocked && !includeLocked) {
    return { poem, skipped: true, reason: "locked" };
  }
  if (poem.motifs?.length >= 3 && poem.tags?.length && !force) {
    return { poem, skipped: true, reason: "already-has-motifs" };
  }

  const tags =
    poem.tags?.length && !force
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
  const poems = JSON.parse(readFileSync(poemsPath, "utf-8")) as Poem[];
  let generated = 0;
  let skipped = 0;
  const next: Poem[] = [];

  console.log(`共 ${poems.length} 首\n`);

  for (const raw of poems) {
    const { poem, skipped: wasSkipped, reason } = enrichOne(raw);
    next.push(poem);
    const tagStr = (poem.tags ?? []).map(getTagLabel).join(" ");
    if (wasSkipped) {
      skipped += 1;
      if (poems.length <= 50) {
        console.log(
          `⏭  [${reason}] ${poem.title}  →  ${formatMotifs(poem.motifs)}  [${tagStr}]`,
        );
      }
    } else {
      generated += 1;
      if (generated <= 30 || poems.length <= 50) {
        console.log(
          `✨ [rule] ${poem.title}  →  ${formatMotifs(poem.motifs)}  (${poem.theme})  [${tagStr}]`,
        );
      }
    }
  }

  console.log(`\n生成 ${generated} · 跳过 ${skipped}`);

  if (dryRun) {
    console.log("（dry-run）未写回文件。");
    return;
  }

  writeFileSync(poemsPath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
  console.log(`已写回 ${poemsPath}`);
}

main();
