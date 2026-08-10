/** 站点 SEO 常量与工具（metadata / JSON-LD / sitemap） */

export const SITE_URL = "https://inkpoetry.xyz";
export const SITE_NAME = "墨韵";
export const SITE_TITLE_DEFAULT = "墨韵 · 东方诗词视觉体验";
export const SITE_DESCRIPTION =
  "高品质、沉浸式、具有东方美学的诗词展示网站。静观诗意，如入画境。精选唐诗宋词，配以水墨意境画卷。";
export const SITE_DESCRIPTION_SHORT = "静观诗意，如入画境。精选唐诗宋词，配以水墨意境画卷。";

/** 拼绝对 URL；path 可带或不带前导 `/` */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** 中文 SERP 友好截断：按字符数，尽量在句读处收束 */
export function truncateDescription(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;

  const slice = normalized.slice(0, max);
  const breakAt = Math.max(
    slice.lastIndexOf("。"),
    slice.lastIndexOf("！"),
    slice.lastIndexOf("？"),
    slice.lastIndexOf("；"),
    slice.lastIndexOf("，"),
    slice.lastIndexOf("、"),
  );
  if (breakAt >= Math.floor(max * 0.5)) {
    return slice.slice(0, breakAt + 1);
  }
  return `${slice.replace(/[，、；：\s]+$/u, "")}…`;
}

/** 诗词 meta description：前几句 + 作者朝代 */
export function poemDescription(
  content: string[],
  author: string,
  dynasty: string,
  max = 120,
): string {
  const body = content.filter(Boolean).join("");
  const suffix = ` —— ${dynasty}·${author} · 墨韵`;
  const budget = Math.max(40, max - suffix.length);
  return truncateDescription(body, budget) + suffix;
}

/** 安全注入 JSON-LD（防 `</script>` 截断） */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
