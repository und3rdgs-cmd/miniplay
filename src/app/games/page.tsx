import { GAMES } from "@/lib/games";
import GameCard from "@/components/games/GameCard";
import Navbar from "@/components/ui/Navbar";
import AdBanner from "@/components/ads/AdBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Games",
  description: "Browse all 8 free casual games on MiniPlay. Word, puzzle, reflex, trivia and more.",
};

const CATEGORIES = ["all", "word", "puzzle", "reflex", "trivia", "visual", "math", "arcade", "memory"] as const;

export default function GamesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pb-24 pt-10">

        <h1 className="font-display text-4xl font-bold mb-2">All Games</h1>
        <p className="mb-8" style={{ color: "var(--text-2)" }}>
          {GAMES.length} games · free to play · works on mobile
        </p>

        {/* Category filter — client component handles interactivity */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <span key={cat}
              className="px-3 py-1.5 rounded-full text-sm capitalize cursor-pointer transition-colors"
              style={{ background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
              {cat}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
          {GAMES.map((game, i) => (
            <GameCard key={game.id} game={game} style={{ animationDelay: `${i * 35}ms` }} />
          ))}
        </div>

        <AdBanner slot="banner_bottom" className="h-16" />
      </main>
    </>
  );
}
