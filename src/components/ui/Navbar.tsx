"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/games",    label: "Games" },
  { href: "/pro",      label: "Pro" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b"
            style={{ background: "rgba(14,14,14,0.85)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <span>Mini<span style={{ color: "var(--accent)" }}>Play</span></span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{ color: pathname === href ? "var(--text-1)" : "var(--text-2)" }}>
              {label}
            </Link>
          ))}

          <Link href="/pro"
            className="btn-primary ml-2 px-4 py-1.5 text-sm">
            ⭐ Upgrade
          </Link>
        </div>

      </nav>
    </header>
  );
}
