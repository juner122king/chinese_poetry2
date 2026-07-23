import OpenCC from "opencc-js/cn2t";
import type { Author, Poem } from "@/lib/types";
import type { ScriptMode } from "./types";

type Converter = (text: string) => string;

let s2t: Converter | null = null;

function getS2T(): Converter {
  if (!s2t) {
    s2t = OpenCC.Converter({ from: "cn", to: "tw" });
  }
  return s2t;
}

/** Source data is always Simplified Chinese. */
export function convertText(text: string, mode: ScriptMode): string {
  if (mode === "sc" || !text) return text;
  return getS2T()(text);
}

export function convertLines(lines: string[], mode: ScriptMode): string[] {
  if (mode === "sc") return lines;
  return lines.map((line) => convertText(line, mode));
}

export function convertPoem(poem: Poem, mode: ScriptMode): Poem {
  if (mode === "sc") return poem;
  return {
    ...poem,
    title: convertText(poem.title, mode),
    author: convertText(poem.author, mode),
    dynasty: convertText(poem.dynasty, mode),
    content: convertLines(poem.content, mode),
    motifs: convertLines(poem.motifs, mode),
  };
}

export function convertAuthor(author: Author, mode: ScriptMode): Author {
  if (mode === "sc") return author;
  return {
    ...author,
    name: convertText(author.name, mode),
    dynasty: convertText(author.dynasty, mode),
    bio: convertText(author.bio, mode),
  };
}
