import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "SNAACK — Quick Games, Big Fun!", template: "%s | SNAACK" },
  description: "8 free casual games you can play in under 5 minutes. Word, puzzle, reflex, trivia and more — no download needed!",
  keywords: ["free online games", "casual games", "quick games", "browser games", "snaack"],
  openGraph: {
    title: "SNAACK — Quick Games, Big Fun!",
    description: "8 free browser games. Play instantly on desktop or mobile.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SNAACK" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff6b2b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
