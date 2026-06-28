import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PageBackgroundApplier } from "@/components/page-background-applier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "提示词库 · PromptHub",
  description: "管理、分类、复用你的 AI 提示词，让创意触手可及。",
  keywords: ["提示词", "Prompt", "AI", "提示词库", "Prompt Library"],
  authors: [{ name: "PromptHub" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "提示词库 · PromptHub",
    description: "管理、分类、复用你的 AI 提示词",
    siteName: "PromptHub",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PageBackgroundApplier />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
