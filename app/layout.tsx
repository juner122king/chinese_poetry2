import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "墨韵 · 东方诗词视觉体验",
  description:
    "高品质、沉浸式、具有东方美学的诗词展示网站。静观诗意，如入画境。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerifSC.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink font-serif-sc text-xuan">
        <NavBar />
        <main className="relative flex-1">{children}</main>
      </body>
    </html>
  );
}
