import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RM Archive — Kim Namjoon Digital Museum",
  description: "以自然生长的七枝档案树，连接艺术、文化、音乐、采访与展览的非官方数字档案馆。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "RM Archive", description: "Kim Namjoon Digital Museum · 7 Branches / One Root", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "RM Archive — 七条枝干，一组数字档案" }] },
  twitter: { card: "summary_large_image", title: "RM Archive", description: "Kim Namjoon Digital Museum", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
