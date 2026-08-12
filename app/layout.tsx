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
import ScriptToggle from "@/components/ScriptToggle";
import TopVeil from "@/components/TopVeil";
import { ScriptProvider } from "@/components/ScriptProvider";
import { authors } from "@/data/authors";
import { poems } from "@/data/poems";
import meta from "@/data/generated/meta.json";
import { convertText } from "@/lib/script/convert";
import {
  DEFAULT_SCRIPT,
  parseScriptMode,
  SCRIPT_COOKIE,
  scriptClass,
  scriptLang,
} from "@/lib/script/types";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_URL,
} from "@/lib/seo";
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

/** 搜索站长平台验证码（方案 C）；未配置时不输出对应 meta */
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
/** 百度 HTML 标签验证；可用 env 覆盖 */
const baiduSiteVerification =
  process.env.BAIDU_SITE_VERIFICATION?.trim() || "codeva-rUplpuN8CO";
const bingSiteVerification = process.env.BING_SITE_VERIFICATION?.trim();

const siteVerification: Metadata["verification"] = {
  ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
  other: {
    ...(baiduSiteVerification
      ? { "baidu-site-verification": baiduSiteVerification }
      : {}),
    ...(bingSiteVerification ? { "msvalidate.01": bingSiteVerification } : {}),
  },
};
if (
  siteVerification &&
  siteVerification.other &&
  Object.keys(siteVerification.other).length === 0
) {
  delete siteVerification.other;
}
const hasSiteVerification = Boolean(
  googleSiteVerification || baiduSiteVerification || bingSiteVerification,
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // 不在 root 写死 canonical：否则子路由会错误指向首页
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(hasSiteVerification && siteVerification
    ? { verification: siteVerification }
    : {}),
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

  // 页脚在服务端按 cookie 简繁输出，避免客户端 T / 入场动画再隐去
  const footerStats = convertText(
    `收唐诗 ${tang} · 宋词 ${ci} · 凡 ${poemCount} 篇 · ${authorCount} 家`,
    mode,
  );
  const footerBrand = convertText("墨韵 · 东方诗词视觉体验", mode);

  return (
    <html
      lang={scriptLang(mode)}
      className={`${scriptFontVars} ${lxgwWenKaiTC.variable} ${scriptClass(mode)} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-serif text-xuan">
        {/* 跳至正文：全站键盘走查的起点；焦点态朱砂描边与其余交互一致 */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-xs focus:tracking-[0.3em] focus:text-xuan focus:outline focus:outline-1 focus:outline-offset-2 focus:outline-[color:var(--focus-ring-strong)]"
        >
          跳至正文
        </a>
        <ScriptProvider initialMode={mode}>
          <NavBar />
          <TopVeil />
          <main id="main" tabIndex={-1} className="relative z-0 flex-1">
            {children}
          </main>
          {/*
            背景完全透明，透出主页 fixed 意境；z-20 保证字在层上。
            文案服务端直出，不用 ScrollReveal / client T。
          */}
          <footer className="relative z-20 mt-auto border-t border-rule-faint bg-transparent px-6 py-12 text-center md:py-14">
            <p className="mx-auto max-w-2xl font-serif text-xs leading-relaxed tracking-[0.22em] text-[color:var(--type-secondary)] md:text-[13px]">
              {footerStats}
            </p>
            <p className="type-meta mt-6 tracking-[0.35em]">{footerBrand}</p>
          </footer>
          <ScriptToggle />
        </ScriptProvider>
      </body>
    </html>
  );
}
