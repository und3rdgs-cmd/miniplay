"use client";

import { useState, useCallback } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

const ROUNDS = 8;

function randomHSL() {
  return {
    h: Math.floor(Math.random() * 360),
    s: 40 + Math.floor(Math.random() * 50),  // 40–90%
    l: 30 + Math.floor(Math.random() * 35),  // 30–65%
  };
}

function hslStr(h: number, s: number, l: number) {
  return `hsl(${h},${s}%,${l}%)`;
}

function colorDistance(h1: number, s1: number, l1: number, h2: number, s2: number, l2: number): number {
  // Hue is circular — take the shorter arc
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  const ds = Math.abs(s1 - s2);
  const dl = Math.abs(l1 - l2);
  return Math.sqrt((dh / 1.8) ** 2 + ds ** 2 + dl ** 2); // normalize hue to ~0-200
}

function generateOptions(target: { h: number; s: number; l: number }) {
  const opts = [target];
  while (opts.length < 4) {
    const candidate = {
      h: (target.h + (Math.random() > 0.5 ? 1 : -1) * (15 + Math.floor(Math.random() * 60))) % 360,
      s: Math.max(20, Math.min(95, target.s + (Math.random() > 0.5 ? 1 : -1) * (10 + Math.floor(Math.random() * 30)))),
      l: Math.max(20, Math.min(75, target.l + (Math.random() > 0.5 ? 1 : -1) * (10 + Math.floor(Math.random() * 25)))),
    };
    if (candidate.h < 0) candidate.h += 360;
    // Ensure they're visually distinct enough
    if (opts.every((o) => colorDistance(o.h, o.s, o.l, candidate.h, candidate.s, candidate.l) > 20)) {
      opts.push(candidate);
    }
  }
  // Shuffle
  return opts.sort(() => Math.random() - 0.5);
}

type RoundState = "picking" | "correct" | "wrong";

export default function ColorSnapGame({ onGameOver }: Props) {
  const [round, setRound]           = useState(0);
  const [score, setScore]           = useState(0);
  const [target]                    = useState(() => Array.from({ length: ROUNDS }, randomHSL));
  const [options]                   = useState(() => target.map(generateOptions));
  const [roundState, setRoundState] = useState<RoundState>("picking");
  const [selected, setSelected]     = useState<number | null>(null);
  const [correct, setCorrect]       = useState(0);

  const currentTarget  = target[round];
  const currentOptions = options[round];
  const scoreRef       = { current: score };
  scoreRef.current     = score;

  const handlePick = useCallback((optIdx: number) => {
    if (roundState !== "picking") return;
    setSelected(optIdx);

    const chosen    = currentOptions[optIdx];
    const dist      = colorDistance(chosen.h, chosen.s, chosen.l, currentTarget.h, currentTarget.s, currentTarget.l);
    const isCorrect = dist < 1; // exact match (it's the target)
    const pts       = isCorrect ? Math.max(50, 200 - Math.round(dist * 3)) : 0;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setScore((s) => s + pts);
    }
    setRoundState(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      if (round >= ROUNDS - 1) {
        onGameOver(scoreRef.current + (isCorrect ? pts : 0));
      } else {
        setRound((r) => r + 1);
        setSelected(null);
        setRoundState("picking");
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, roundState, currentOptions, currentTarget]);

  const targetColor = hslStr(currentTarget.h, currentTarget.s, currentTarget.l);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">

      {/* HUD */}
      <div className="w-full flex justify-between items-center px-1">
        <div className="font-display text-2xl font-bold" style={{ color: "var(--accent)" }}>
          {score} pts
        </div>
        <div className="text-sm" style={{ color: "var(--text-3)" }}>
          {correct}/{round} correct · Round {round + 1}/{ROUNDS}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full flex gap-1">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full"
               style={{ background: i < round ? "var(--accent)" : i === round ? "var(--border-md)" : "var(--bg-raised)" }} />
        ))}
      </div>

      {/* Target swatch */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
          Match this colour
        </div>
        <div className="rounded-2xl shadow-lg"
             style={{ width: 120, height: 120, background: targetColor, border: "2px solid rgba(255,255,255,0.1)" }} />
        <div className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
          {targetColor}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {currentOptions.map((opt, i) => {
          const optColor = hslStr(opt.h, opt.s, opt.l);
          const isTarget = opt.h === currentTarget.h && opt.s === currentTarget.s && opt.l === currentTarget.l;
          const isSelected = selected === i;

          let borderColor = "rgba(255,255,255,0.1)";
          if (roundState !== "picking") {
            if (isTarget)                        borderColor = "rgba(200,241,53,0.9)";
            else if (isSelected && !isTarget)    borderColor = "rgba(255,60,60,0.8)";
          }

          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={roundState !== "picking"}
              className="rounded-xl transition-all duration-200 relative overflow-hidden"
              style={{
                aspectRatio: "1",
                background: optColor,
                border: `3px solid ${borderColor}`,
                cursor: roundState !== "picking" ? "default" : "pointer",
                transform: isSelected ? "scale(0.95)" : "scale(1)",
              }}>
              {roundState !== "picking" && isTarget && (
                <div className="absolute inset-0 flex items-center justify-center"
                     style={{ background: "rgba(0,0,0,0.35)" }}>
                  <span className="text-2xl">✓</span>
                </div>
              )}
              {roundState !== "picking" && isSelected && !isTarget && (
                <div className="absolute inset-0 flex items-center justify-center"
                     style={{ background: "rgba(0,0,0,0.35)" }}>
                  <span className="text-2xl">✗</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {roundState !== "picking" && (
        <div className="text-sm font-semibold animate-fade-up"
             style={{ color: roundState === "correct" ? "var(--accent)" : "#ff5555" }}>
          {roundState === "correct" ? "🎯 Perfect match! +200 pts" : "✗ Not quite — try to spot the exact shade"}
        </div>
      )}

      <p className="text-xs" style={{ color: "var(--text-3)" }}>
        Pick the colour that exactly matches the target
      </p>
    </div>
  );
}
