import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hey Tablo Agent",
  description: "A context-aware listening agent for Hey Tablo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
