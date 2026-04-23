"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

const EMOJI_SETS = ["🐶🐱🐭🐹🐰🦊🐻🐼", "🍎🍊🍋🍇🍓🍑🥝🍒", "🚀🌙⭐🌍🪐☄️🛸🌌"];

function buildDeck(set: string): string[] {
  const emojis = [...set].slice(0, 8);
  const doubled = [...emojis, ...emojis];
  // Fisher-Yates shuffle
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

const TOTAL_TIME = 90; // seconds

export default function MemoryFlipGame({ onGameOver }: Props) {
  const [emojiSet]     = useState(() => EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)]);
  const [deck]         = useState(() => buildDeck(emojiSet));
  const [flipped, setFlipped]   = useState<number[]>([]);   // indices currently face-up
  const [matched, setMatched]   = useState<number[]>([]);   // indices permanently matched
  const [score, setScore]       = useState(0);
  const [moves, setMoves]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [locked, setLocked]     = useState(false);

  const matchedRef = useRef(matched);
  matchedRef.current = matched;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onGameOver(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onGameOver, score]);

  // Check win condition
  useEffect(() => {
    if (matched.length === deck.length && deck.length > 0) {
      const bonus = Math.max(0, timeLeft * 10);
      const finalScore = score + bonus;
      setTimeout(() => onGameOver(finalScore), 600);
    }
  }, [matched, deck.length, score, timeLeft, onGameOver]);

  const handleFlip = useCallback((idx: number) => {
    if (locked) return;
    if (flipped.includes(idx) || matched.includes(idx)) return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);

      const [a, b] = newFlipped;
      if (deck[a] === deck[b]) {
        // Match!
        setTimeout(() => {
          setMatched((prev) => [...prev, a, b]);
          setScore((s) => s + 100);
          setFlipped([]);
          setLocked(false);
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }, [locked, flipped, matched, deck]);

  const isFaceUp = (idx: number) => flipped.includes(idx) || matched.includes(idx);
  const isMatched = (idx: number) => matched.includes(idx);
  const timerColor = timeLeft <= 10 ? "#ff4444" : timeLeft <= 20 ? "#f5c842" : "var(--accent)";

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* HUD */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div>
          <div className="font-display text-3xl font-bold" style={{ color: "var(--accent)" }}>
            {score}
          </div>
          <div className="text-xs" style={{ color: "var(--text-3)" }}>{moves} moves</div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold" style={{ color: timerColor }}>
            {timeLeft}s
          </div>
          <div className="text-xs" style={{ color: "var(--text-3)" }}>
            {matched.length / 2}/{deck.length / 2} pairs
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "var(--bg-raised)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
             style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%`, background: timerColor }} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2">
        {deck.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => handleFlip(idx)}
            disabled={locked || matched.includes(idx)}
            className="aspect-square rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300"
            style={{
              background: isFaceUp(idx)
                ? isMatched(idx)
                  ? "rgba(200,241,53,0.15)"
                  : "var(--bg-raised)"
                : "var(--bg-raised)",
              border: `1px solid ${isMatched(idx) ? "rgba(200,241,53,0.4)" : isFaceUp(idx) ? "var(--border-md)" : "var(--border)"}`,
              transform: isFaceUp(idx) ? "rotateY(0deg)" : "rotateY(180deg)",
              cursor: locked || matched.includes(idx) ? "default" : "pointer",
            }}>
            {isFaceUp(idx) ? emoji : ""}
          </button>
        ))}
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "var(--text-3)" }}>
        Find all matching pairs · time bonus for finishing early
      </p>
    </div>
  );
}
