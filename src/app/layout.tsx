import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "MiniPlay — Quick Games, Big Fun", template: "%s | MiniPlay" },
  description: "8 free browser games you can play in under 5 minutes. No downloads, no logins required. Word, puzzle, reflex, trivia and more.",
  keywords: ["free online games", "browser games", "casual games", "quick games", "word games", "puzzle games"],
  openGraph: {
    title: "MiniPlay — Quick Games, Big Fun",
    description: "8 free browser games. Play instantly on desktop or mobile.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MiniPlay" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-[#0e0e0e] text-white font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
