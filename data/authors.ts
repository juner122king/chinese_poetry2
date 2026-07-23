import type { Author } from "@/lib/types";
import { poems } from "./poems";

const authorBios: Record<
  string,
  { slug: string; dynasty: string; bio: string }
> = {
  李白: {
    slug: "li-bai",
    dynasty: "唐",
    bio: "字太白，号青莲居士。盛唐浪漫主义诗人，被誉为「诗仙」。其诗雄奇飘逸，想象瑰丽，语言自然流畅，对后世影响深远。",
  },
  杜甫: {
    slug: "du-fu",
    dynasty: "唐",
    bio: "字子美，自号少陵野老。其诗沉郁顿挫，真实反映安史之乱前后的社会面貌，被尊为「诗圣」，诗作称为「诗史」。",
  },
  苏轼: {
    slug: "su-shi",
    dynasty: "宋",
    bio: "字子瞻，号东坡居士。北宋文学家、书画家，豪放词派代表。诗词文赋皆擅，胸襟开阔，风格旷达。",
  },
  辛弃疾: {
    slug: "xin-qi-ji",
    dynasty: "宋",
    bio: "字幼安，号稼轩。南宋豪放派词人，一生力主抗金。词风雄浑悲壮，兼有婉约细腻，为两宋词坛大家。",
  },
  王维: {
    slug: "wang-wei",
    dynasty: "唐",
    bio: "字摩诘，官至尚书右丞。诗画双绝，尤善山水田园，意境空灵，苏轼评其「诗中有画，画中有诗」。",
  },
  白居易: {
    slug: "bai-ju-yi",
    dynasty: "唐",
    bio: "字乐天，号香山居士。中唐新乐府运动倡导者，诗风平易近人，主张「文章合为时而著，歌诗合为事而作」。",
  },
  李清照: {
    slug: "li-qing-zhao",
    dynasty: "宋",
    bio: "号易安居士。宋代婉约词派代表，「千古第一才女」。前期词清丽婉转，后期多凄苦悲凉，语言精妙。",
  },
  柳宗元: {
    slug: "liu-zong-yuan",
    dynasty: "唐",
    bio: "字子厚，河东人。唐代文学家，与韩愈并称「韩柳」。参与永贞革新后被贬，山水游记与寓言诗影响深远。",
  },
  孟浩然: {
    slug: "meng-hao-ran",
    dynasty: "唐",
    bio: "襄阳人，唐代山水田园诗派代表。诗风清淡自然，多写隐逸生活与山水风光，与王维并称「王孟」。",
  },
  王之涣: {
    slug: "wang-zhi-huan",
    dynasty: "唐",
    bio: "字季凌。盛唐边塞诗人，存诗虽少而名篇迭出。《登鹳雀楼》《凉州词》等传诵千古。",
  },
  张继: {
    slug: "zhang-ji",
    dynasty: "唐",
    bio: "字懿孙，襄州人。唐代诗人，以《枫桥夜泊》闻名天下，一句「夜半钟声到客船」使寒山寺名扬四海。",
  },
};

function buildAuthors(): Author[] {
  const names = Array.from(new Set(poems.map((p) => p.author)));
  return names.map((name) => {
    const meta = authorBios[name] ?? {
      slug: encodeURIComponent(name),
      dynasty: poems.find((p) => p.author === name)?.dynasty ?? "",
      bio: `${name}，中国古代著名诗人。`,
    };
    return {
      name,
      slug: meta.slug,
      dynasty: meta.dynasty,
      bio: meta.bio,
      poemIds: poems.filter((p) => p.author === name).map((p) => p.id),
    };
  });
}

export const authors: Author[] = buildAuthors();

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function getAuthorByName(name: string): Author | undefined {
  return authors.find((a) => a.name === name);
}

export function getFeaturedAuthors(limit = 6): Author[] {
  // Prefer well-known poets with more works first
  return [...authors]
    .sort((a, b) => b.poemIds.length - a.poemIds.length)
    .slice(0, limit);
}
