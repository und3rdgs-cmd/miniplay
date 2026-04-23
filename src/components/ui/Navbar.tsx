"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/games", label: "Games" },
  { href: "/pro",   label: "Pro" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b"
            style={{ background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform"
               style={{ background: "linear-gradient(135deg, var(--orange), var(--coral))", boxShadow: "0 3px 10px rgba(255,107,43,0.4)" }}>
            S
          </div>
          <span className="font-display font-bold text-xl tracking-tight"
                style={{ color: "var(--text-1)" }}>
            SNA<span style={{ color: "var(--orange)" }}>ACK</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                pathname === href
                  ? "text-white"
                  : "hover:bg-orange-50"
              )}
              style={{
                color: pathname === href ? "white" : "var(--text-2)",
                background: pathname === href ? "var(--orange)" : undefined,
              }}>
              {label}
            </Link>
          ))}

          <Link href="/pro"
            className="btn-primary ml-2 px-4 py-1.5 text-sm font-bold">
            ⭐ Go Pro
          </Link>
        </div>

      </nav>
    </header>
  );
}
