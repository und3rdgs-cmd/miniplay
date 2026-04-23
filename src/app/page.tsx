import Link from "next/link";
import { GAMES } from "@/lib/games";
import GameCard from "@/components/games/GameCard";
import AdBanner from "@/components/ads/AdBanner";
import Navbar from "@/components/ui/Navbar";

export default function HomePage() {
  const dailyGames = GAMES.filter((g) => g.is_daily);
  const allGames   = GAMES.filter((g) => !g.is_daily);

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pb-24">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="pt-16 pb-14 text-center">

          {/* Floating emoji decorations */}
          <div className="relative mb-6 h-20 pointer-events-none select-none hidden sm:block">
            <span className="absolute left-[10%] top-0 text-4xl animate-float" style={{ animationDelay: "0s" }}>🎮</span>
            <span className="absolute left-[22%] top-6 text-3xl animate-float" style={{ animationDelay: "0.5s" }}>⚡</span>
            <span className="absolute right-[22%] top-2 text-3xl animate-float" style={{ animationDelay: "1s" }}>🏆</span>
            <span className="absolute right-[10%] top-6 text-4xl animate-float" style={{ animationDelay: "1.5s" }}>🎯</span>
            <span className="absolute left-[50%] top-0 text-2xl animate-float" style={{ animationDelay: "0.8s" }}>✨</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-fade-up"
               style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1.5px solid rgba(255,107,43,0.2)", animationDelay: "0ms" }}>
            🍿 8 games · Free to play · No download
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight leading-none mb-5 animate-fade-up"
              style={{ animationDelay: "60ms" }}>
            Play.<br />
            <span style={{ color: "var(--orange)" }}>Snack.</span>{" "}
            <span style={{ color: "var(--teal)" }}>Win.</span>
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10 animate-fade-up font-medium"
             style={{ color: "var(--text-2)", animationDelay: "120ms" }}>
            Bite-sized games for when you have 5 minutes. Word puzzles, reflex tests,
            trivia and more — on any device, instant fun.
          </p>

          <div className="flex flex-wrap gap-3 justify-center animate-fade-up" style={{ animationDelay: "180ms" }}>
            <Link href="/games" className="btn-primary px-8 py-3.5 text-base font-bold">
              Start playing →
            </Link>
            <Link href="/pro" className="btn-ghost px-8 py-3.5 text-base font-semibold">
              Go Pro · ₹399/mo
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 justify-center mt-12 animate-fade-up" style={{ animationDelay: "240ms" }}>
            {[["8", "Games"], ["⚡", "Instant play"], ["📱", "Mobile ready"], ["🆓", "Always free"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl font-bold" style={{ color: "var(--orange)" }}>{val}</div>
                <div className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Daily Challenges ──────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-bold">
              🌅 Today&apos;s challenges
            </h2>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: "var(--teal-dim)", color: "#008a74" }}>
              Resets midnight UTC
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {dailyGames.map((game, i) => (
              <GameCard key={game.id} game={game} featured style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </section>

        {/* ── Ad slot ───────────────────────────────────────── */}
        <AdBanner slot="banner_bottom" className="mb-14 h-16" />

        {/* ── All Games ─────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-5">🎮 All games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allGames.map((game, i) => (
              <GameCard key={game.id} game={game} style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
