import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  LXGW_WenKai_TC,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Serif_SC,
  Noto_Serif_TC,
} from "next/font/google";
import NavBar from "@/components/NavBar";
import ScrollReveal from "@/components/ScrollReveal";
import ScriptToggle from "@/components/ScriptToggle";
import TopVeil from "@/components/TopVeil";
import T from "@/components/T";
import { ScriptProvider } from "@/components/ScriptProvider";
import { authors } from "@/data/authors";
import { poems } from "@/data/poems";
import meta from "@/data/generated/meta.json";
import {
  DEFAULT_SCRIPT,
  parseScriptMode,
  SCRIPT_COOKIE,
  scriptClass,
  scriptLang,
} from "@/lib/script/types";
import "./globals.css";

/** next/font 须在 module scope 声明；实际挂载按 cookie 只选 sc 或 tc 一套 */
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  // 默认用户为简体；繁体按需用，避免 sc 首屏 preload 两套
  preload: false,
});

const lxgwWenKaiTC = LXGW_WenKai_TC({
  variable: "--font-lxgw-wenkai-tc",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://inkpoetry.xyz"),
  title: "墨韵 · 东方诗词视觉体验",
  description:
    "高品质、沉浸式、具有东方美学的诗词展示网站。静观诗意，如入画境。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "墨韵 · 东方诗词视觉体验",
    description: "静观诗意，如入画境。",
    url: "https://inkpoetry.xyz",
    siteName: "墨韵",
    locale: "zh_CN",
    type: "website",
  },
};

/** 站点为墨色单主题，浏览器 chrome 与原生控件随墨底走暗色 */
export const viewport: Viewport = {
  themeColor: "#1f1f1f",
  colorScheme: "dark",
};

const poemCount = meta.poemCount ?? poems.length;
const authorCount = meta.authorCount ?? authors.length;
const tang = meta.tang ?? 0;
const ci = meta.ci ?? 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const mode = parseScriptMode(jar.get(SCRIPT_COOKIE)?.value, DEFAULT_SCRIPT);

  // 宋/黑只挂当前简繁；文楷（诗面）始终加载
  const scriptFontVars =
    mode === "tc"
      ? `${notoSerifTC.variable} ${notoSansTC.variable}`
      : `${notoSerifSC.variable} ${notoSansSC.variable}`;

  return (
    <html
      lang={scriptLang(mode)}
      className={`${scriptFontVars} ${lxgwWenKaiTC.variable} ${scriptClass(mode)} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-serif text-xuan">
        {/* 跳至正文：全站键盘走查的起点；焦点态朱砂描边与其余交互一致 */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-xs focus:tracking-[0.3em] focus:text-xuan focus:outline focus:outline-1 focus:outline-offset-2 focus:outline-cinnabar/60"
        >
          跳至正文
        </a>
        <ScriptProvider initialMode={mode}>
          <NavBar />
          <TopVeil />
          <main id="main" tabIndex={-1} className="relative flex-1">
            {children}
          </main>
          <footer className="border-t border-rule-faint px-6 py-12 text-center md:py-14">
            <ScrollReveal>
              <p className="mx-auto max-w-2xl font-serif text-xs leading-relaxed tracking-[0.22em] text-[color:var(--type-meta)] md:text-[13px]">
                <T>
                  {`收唐诗 ${tang} · 宋词 ${ci} · 凡 ${poemCount} 篇 · ${authorCount} 家`}
                </T>
              </p>
            </ScrollReveal>
            <T as="p" className="type-quiet mt-6 tracking-[0.35em]">
              墨韵 · 东方诗词视觉体验
            </T>
          </footer>
          <ScriptToggle />
        </ScriptProvider>
      </body>
    </html>
  );
}
