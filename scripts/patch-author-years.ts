/**
 * 为 data/generated/authors.json 写入 years 字段（不重建 poems）。
 * 用法：npx tsx scripts/patch-author-years.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenCC from "opencc-js";
import { resolveAuthorYears } from "../lib/author-years";
import type { Author } from "../lib/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const authorsPath = join(ROOT, "data/generated/authors.json");
const songPath = join(ROOT, "data/raw/authors.song.json");
const tangPath = join(ROOT, "data/raw/authors.tang.json");

const t2s = OpenCC.Converter({ from: "t", to: "cn" });

type RawSong = {
  name: string;
  short_description?: string;
  description?: string;
};
type RawTang = { name: string; desc?: string };

const authors = JSON.parse(readFileSync(authorsPath, "utf-8")) as Author[];
const song = JSON.parse(readFileSync(songPath, "utf-8")) as RawSong[];
const tang = JSON.parse(readFileSync(tangPath, "utf-8")) as RawTang[];

const yearsSource = new Map<string, string>();
for (const a of song) {
  const name = t2s(a.name);
  const raw = [a.short_description, a.description].filter(Boolean).join("\n");
  if (raw) yearsSource.set(name, raw);
}
for (const a of tang) {
  const name = t2s(a.name);
  if (a.desc && !yearsSource.has(name)) yearsSource.set(name, a.desc);
}

let withYears = 0;
for (const a of authors) {
  const years = resolveAuthorYears(a.name, a.bio, yearsSource.get(a.name));
  if (years) {
    a.years = years;
    withYears += 1;
  } else {
    delete a.years;
  }
}

writeFileSync(authorsPath, `${JSON.stringify(authors, null, 2)}\n`, "utf-8");
console.log(`Patched ${withYears}/${authors.length} authors with years`);
console.log(
  "sample",
  authors
    .filter((a) => a.years)
    .slice(0, 5)
    .map((a) => `${a.name}:${a.years}`)
    .join(", "),
);
