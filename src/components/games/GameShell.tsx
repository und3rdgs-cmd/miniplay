"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import type { Game } from "@/types";
import { useGameScore } from "@/hooks/useGameScore";
import { formatScore } from "@/lib/utils";
import AdBanner from "@/components/ads/AdBanner";

// Lazy-load every game — only loads when played
const TapBlitzGame   = lazy(() => import("./TapBlitzGame"));
const MemoryFlipGame = lazy(() => import("./MemoryFlipGame"));
const WordRushGame   = lazy(() => import("./WordRushGame"));
const QuizDropGame   = lazy(() => import("./QuizDropGame"));
const SlideGridGame  = lazy(() => import("./SlideGridGame"));
const ColorSnapGame  = lazy(() => import("./ColorSnapGame"));
const NumChainGame   = lazy(() => import("./NumChainGame"));
const DodgeDashGame  = lazy(() => import("./DodgeDashGame"));

interface Props { game: Game; }
type Phase = "intro" | "playing" | "gameover";

function GameComponent({ game, onGameOver }: { game: Game; onGameOver: (score: number) => void }) {
  switch (game.id) {
    case "tapblitz":   return <TapBlitzGame   onGameOver={onGameOver} />;
    case "memoryflip": return <MemoryFlipGame  onGameOver={onGameOver} />;
    case "wordrush":   return <WordRushGame    onGameOver={onGameOver} />;
    case "quizdrop":   return <QuizDropGame    onGameOver={onGameOver} />;
    case "slidegrid":  return <SlideGridGame   onGameOver={onGameOver} />;
    case "colorsnap":  return <ColorSnapGame   onGameOver={onGameOver} />;
    case "numchain":   return <NumChainGame    onGameOver={onGameOver} />;
    case "dodgedash":  return <DodgeDashGame   onGameOver={onGameOver} />;
    default:           return <ComingSoonGame game={game} onGameOver={onGameOver} />;
  }
}

export default function GameShell({ game }: Props) {
  const [phase, setPhase]         = useState<Phase>("intro");
  const [score, setScore]         = useState(0);
  const [duration, setDuration]   = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const { submitScore }           = useGameScore(game.id);

  const handleStart = useCallback(() => {
    setStartTime(Date.now());
    setScore(0);
    setPhase("playing");
  }, []);

  const handleGameOver = useCallback(async (finalScore: number) => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setScore(finalScore);
    setDuration(elapsed);
    setPhase("gameover");
    await submitScore(finalScore, elapsed);
  }, [startTime, submitScore]);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top bar */}
      <header className="border-b px-4 h-14 flex items-center gap-3"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <Link href="/games" className="text-sm hover:text-white transition-colors"
              style={{ color: "var(--text-2)" }}>
          ← Games
        </Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <span className="font-display font-semibold">{game.emoji} {game.title}</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* INTRO */}
        {phase === "intro" && (
          <div className="text-center max-w-sm animate-fade-up">
            <div className="text-7xl mb-5">{game.emoji}</div>
            <h1 className="font-display text-3xl font-bold mb-3">{game.title}</h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-2)" }}>
              {game.description}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {game.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full capitalize"
                      style={{ background: "var(--bg-raised)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                  {tag}
                </span>
              ))}
            </div>
            <button onClick={handleStart} className="btn-primary px-10 py-3.5 text-base">
              Play →
            </button>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && (
          <div className="w-full max-w-sm animate-fade-up">
            <Suspense fallback={
              <div className="h-80 flex items-center justify-center" style={{ color: "var(--text-3)" }}>
                Loading…
              </div>
            }>
              <GameComponent game={game} onGameOver={handleGameOver} />
            </Suspense>
          </div>
        )}

        {/* GAME OVER */}
        {phase === "gameover" && (
          <div className="text-center max-w-sm animate-fade-up w-full">
            <div className="text-5xl mb-4">🏁</div>
            <h2 className="font-display text-2xl font-bold mb-1">Game over!</h2>
            <div className="font-display text-6xl font-bold mb-1" style={{ color: "var(--accent)" }}>
              {formatScore(score)}
            </div>
            <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
              {duration}s · {game.title}
            </p>

            <AdBanner slot="interstitial" className="mb-6" />

            <div className="flex gap-3 justify-center">
              <button onClick={handleStart} className="btn-primary px-6 py-2.5 text-sm">
                Play again
              </button>
              <Link href="/games" className="btn-ghost px-6 py-2.5 text-sm">
                All games
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function ComingSoonGame({ game, onGameOver }: { game: Game; onGameOver: (score: number) => void }) {
  const [count, setCount] = useState(0);
  return (
    <div className="card p-8 text-center" style={{ maxWidth: 360 }}>
      <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>🚧 {game.title} is coming soon!</p>
      <div className="font-display text-5xl font-bold mb-6" style={{ color: "var(--accent)" }}>{count}</div>
      <button className="btn-primary w-full py-3 text-lg mb-3" onClick={() => setCount((c) => c + 1)}>Tap! +1</button>
      <button className="btn-ghost w-full py-2 text-sm" onClick={() => onGameOver(count)}>End game</button>
    </div>
  );
}
