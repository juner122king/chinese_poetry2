import type { Metadata } from "next";
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
import {
  DEFAULT_SCRIPT,
  parseScriptMode,
  SCRIPT_COOKIE,
  scriptClass,
  scriptLang,
} from "@/lib/script/types";
import "./globals.css";

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
  title: "墨韵 · 东方诗词视觉体验",
  description:
    "高品质、沉浸式、具有东方美学的诗词展示网站。静观诗意，如入画境。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const mode = parseScriptMode(jar.get(SCRIPT_COOKIE)?.value, DEFAULT_SCRIPT);

  return (
    <html
      lang={scriptLang(mode)}
      className={`${notoSerifSC.variable} ${notoSerifTC.variable} ${lxgwWenKaiTC.variable} ${notoSansSC.variable} ${notoSansTC.variable} ${scriptClass(mode)} h-full antialiased`}
    >
      <body className="min-h-full bg-ink font-serif text-xuan">
        <ScriptProvider initialMode={mode}>
          <NavBar />
          <TopVeil />
          <main className="relative flex-1">{children}</main>
          <ScriptToggle />
        </ScriptProvider>
      </body>
    </html>
  );
}
