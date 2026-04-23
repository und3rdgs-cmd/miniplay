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
        <section className="pt-20 pb-16 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
               style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-dim)" }}>
            🎮 8 games · Free to play · No download
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
            Quick games.<br />
            <span style={{ color: "var(--accent)" }}>Big fun.</span>
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "var(--text-2)" }}>
            Play browser games in under 5 minutes. Word, puzzle, reflex, trivia and more —
            on desktop or mobile, no login required.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/games" className="btn-primary px-7 py-3 text-base">
              Play now →
            </Link>
            <Link href="/pro" className="btn-ghost px-7 py-3 text-base">
              Go Pro · $3.99/mo
            </Link>
          </div>
        </section>

        {/* ── Daily Challenges ──────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold">Today&apos;s challenges</h2>
            <span className="text-xs px-2 py-1 rounded-md" style={{ background: "var(--bg-raised)", color: "var(--text-2)" }}>
              Resets midnight UTC
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dailyGames.map((game, i) => (
              <GameCard key={game.id} game={game} featured style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </section>

        {/* ── Ad slot ───────────────────────────────────────── */}
        <AdBanner slot="banner_bottom" className="mb-14 h-16" />

        {/* ── All Games ─────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-5">All games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allGames.map((game, i) => (
              <GameCard key={game.id} game={game} style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
