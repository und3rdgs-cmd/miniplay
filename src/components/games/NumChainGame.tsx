"use client";

import { useState, useCallback } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

const GRID_SIZE  = 5;
const ROUNDS     = 6;

function makeGrid() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => 1 + Math.floor(Math.random() * 9));
}

function makeTarget(grid: number[]) {
  // Pick 3–5 adjacent cells and sum them — ensures a valid chain exists
  const chainLen = 3 + Math.floor(Math.random() * 3);
  let idx = Math.floor(Math.random() * grid.length);
  const visited = [idx];
  for (let i = 1; i < chainLen; i++) {
    const row = Math.floor(idx / GRID_SIZE), col = idx % GRID_SIZE;
    const neighbors = [];
    if (row > 0 && !visited.includes(idx - GRID_SIZE)) neighbors.push(idx - GRID_SIZE);
    if (row < GRID_SIZE - 1 && !visited.includes(idx + GRID_SIZE)) neighbors.push(idx + GRID_SIZE);
    if (col > 0 && !visited.includes(idx - 1)) neighbors.push(idx - 1);
    if (col < GRID_SIZE - 1 && !visited.includes(idx + 1)) neighbors.push(idx + 1);
    if (!neighbors.length) break;
    idx = neighbors[Math.floor(Math.random() * neighbors.length)];
    visited.push(idx);
  }
  return visited.reduce((s, i) => s + grid[i], 0);
}

function isAdjacent(a: number, b: number) {
  const ar = Math.floor(a / GRID_SIZE), ac = a % GRID_SIZE;
  const br = Math.floor(b / GRID_SIZE), bc = b % GRID_SIZE;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

const ROUND_TIME = 30;

export default function NumChainGame({ onGameOver }: Props) {
  const [grid]           = useState(makeGrid);
  const [target, setTarget] = useState(() => 0);
  const [targets]        = useState(() => {
    const g = makeGrid();
    return Array.from({ length: ROUNDS }, () => makeTarget(g));
  });
  const [grids]          = useState(() => Array.from({ length: ROUNDS }, makeGrid));

  const [round, setRound]       = useState(0);
  const [score, setScore]       = useState(0);
  const [chain, setChain]       = useState<number[]>([]);
  const [solved, setSolved]     = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [flash, setFlash]       = useState<"correct" | "wrong" | null>(null);

  const currentGrid   = grids[round];
  const currentTarget = targets[round];
  const chainSum      = chain.reduce((s, i) => s + currentGrid[i], 0);
  const scoreRef      = { current: score };
  scoreRef.current    = score;

  // Timer per round (reset each round)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [timerKey, setTimerKey] = useState(0);
  useState(() => {
    setTimeLeft(ROUND_TIME);
  });

  const nextRound = useCallback((pts: number) => {
    const newScore = scoreRef.current + pts;
    setScore(newScore);
    if (round >= ROUNDS - 1) {
      setTimeout(() => onGameOver(newScore), 600);
    } else {
      setRound((r) => r + 1);
      setChain([]);
      setTimeLeft(ROUND_TIME);
      setTimerKey((k) => k + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, onGameOver]);

  const handleCell = useCallback((idx: number) => {
    if (flash) return;

    setChain((prev) => {
      // Already in chain — truncate back to before this cell
      const pos = prev.indexOf(idx);
      if (pos !== -1) return prev.slice(0, pos);

      // Must be adjacent to last cell in chain
      if (prev.length > 0 && !isAdjacent(prev[prev.length - 1], idx)) return prev;

      const newChain = [...prev, idx];
      const sum = newChain.reduce((s, i) => s + currentGrid[i], 0);

      if (sum === currentTarget) {
        const pts = 100 + timeLeft * 3;
        setFlash("correct");
        setSolved((s) => s + 1);
        setTimeout(() => {
          setFlash(null);
          nextRound(pts);
        }, 700);
      } else if (sum > currentTarget) {
        setFlash("wrong");
        setTimeout(() => {
          setFlash(null);
          setChain([]);
        }, 500);
        return newChain; // show wrong state briefly then clear
      }

      return newChain;
    });
  }, [flash, currentGrid, currentTarget, timeLeft, nextRound]);

  const timerColor = timeLeft <= 8 ? "#ff4444" : timeLeft <= 15 ? "#f5c842" : "var(--accent)";

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">

      {/* HUD */}
      <div className="w-full flex justify-between items-center px-1">
        <div>
          <div className="font-display text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {score} pts
          </div>
          <div className="text-xs" style={{ color: "var(--text-3)" }}>{solved} solved</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>Target</div>
          <div className="font-display text-4xl font-bold"
               style={{ color: flash === "correct" ? "var(--accent)" : flash === "wrong" ? "#ff5555" : "var(--text-1)" }}>
            {currentTarget}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold" style={{ color: timerColor }}>
            {timeLeft}s
          </div>
          <div className="text-xs" style={{ color: "var(--text-3)" }}>
            {round + 1}/{ROUNDS}
          </div>
        </div>
      </div>

      {/* Chain sum indicator */}
      <div className="w-full flex items-center justify-center gap-2">
        <div className="text-sm" style={{ color: "var(--text-3)" }}>Chain:</div>
        <div className="font-display text-xl font-bold"
             style={{ color: chainSum > currentTarget ? "#ff5555" : chainSum === currentTarget ? "var(--accent)" : "var(--text-1)" }}>
          {chainSum || "—"}
        </div>
        {chain.length > 0 && (
          <div className="text-xs" style={{ color: "var(--text-3)" }}>
            ({chain.map((i) => currentGrid[i]).join(" + ")})
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-1.5 w-full"
           style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {currentGrid.map((val, idx) => {
          const inChain   = chain.includes(idx);
          const isLast    = chain[chain.length - 1] === idx;
          const chainPos  = chain.indexOf(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCell(idx)}
              className="rounded-xl font-display font-bold text-lg transition-all duration-150"
              style={{
                aspectRatio: "1",
                background: inChain
                  ? flash === "correct"
                    ? "rgba(200,241,53,0.3)"
                    : flash === "wrong"
                    ? "rgba(255,60,60,0.2)"
                    : "rgba(200,241,53,0.15)"
                  : "var(--bg-raised)",
                border: `1.5px solid ${
                  inChain
                    ? flash === "correct"
                      ? "rgba(200,241,53,0.8)"
                      : flash === "wrong"
                      ? "rgba(255,60,60,0.6)"
                      : "rgba(200,241,53,0.5)"
                    : "var(--border)"
                }`,
                color: inChain ? (flash === "wrong" ? "#ff5555" : "var(--accent)") : "var(--text-1)",
                transform: isLast ? "scale(1.08)" : "scale(1)",
                cursor: "pointer",
              }}>
              {val}
              {inChain && (
                <span className="block text-xs font-normal" style={{ color: "var(--text-3)", fontSize: 9 }}>
                  {chainPos + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setChain([])}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bg-raised)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
          Clear chain
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
        Tap adjacent numbers that add up to the target
      </p>
    </div>
  );
}
