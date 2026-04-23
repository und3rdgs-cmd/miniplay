"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

const SIZE = 4; // 4×4 grid
const TOTAL = SIZE * SIZE;
const SOLVED = Array.from({ length: TOTAL - 1 }, (_, i) => i + 1).concat(0); // 0 = empty tile

function isSolved(grid: number[]): boolean {
  return grid.every((v, i) => v === SOLVED[i]);
}

function getPos(grid: number[], val: number) {
  const i = grid.indexOf(val);
  return { row: Math.floor(i / SIZE), col: i % SIZE };
}

function shuffle(grid: number[]): number[] {
  // Make random valid moves from solved state to ensure solvability
  let g = [...grid];
  for (let i = 0; i < 200; i++) {
    const emptyIdx = g.indexOf(0);
    const row = Math.floor(emptyIdx / SIZE);
    const col = emptyIdx % SIZE;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(emptyIdx - SIZE);
    if (row < SIZE - 1) neighbors.push(emptyIdx + SIZE);
    if (col > 0) neighbors.push(emptyIdx - 1);
    if (col < SIZE - 1) neighbors.push(emptyIdx + 1);
    const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
    [g[emptyIdx], g[swapIdx]] = [g[swapIdx], g[emptyIdx]];
  }
  return g;
}

function canMove(grid: number[], tileIdx: number): boolean {
  const emptyIdx = grid.indexOf(0);
  const tRow = Math.floor(tileIdx / SIZE), tCol = tileIdx % SIZE;
  const eRow = Math.floor(emptyIdx / SIZE), eCol = emptyIdx % SIZE;
  return (
    (tRow === eRow && Math.abs(tCol - eCol) === 1) ||
    (tCol === eCol && Math.abs(tRow - eRow) === 1)
  );
}

const TOTAL_TIME = 120;

export default function SlideGridGame({ onGameOver }: Props) {
  const [grid, setGrid]         = useState(() => shuffle([...SOLVED]));
  const [moves, setMoves]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [won, setWon]           = useState(false);
  const [hint, setHint]         = useState(false);

  // Timer
  useEffect(() => {
    if (won) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onGameOver(Math.max(0, moves > 0 ? 100 : 0));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [won, onGameOver, moves]);

  const handleTile = useCallback((idx: number) => {
    if (won || !canMove(grid, idx)) return;
    const newGrid = [...grid];
    const emptyIdx = newGrid.indexOf(0);
    [newGrid[emptyIdx], newGrid[idx]] = [newGrid[idx], newGrid[emptyIdx]];
    setGrid(newGrid);
    setMoves((m) => m + 1);

    if (isSolved(newGrid)) {
      setWon(true);
      const score = Math.max(500, 1000 + timeLeft * 8 - moves * 3);
      setTimeout(() => onGameOver(score), 800);
    }
  }, [grid, won, timeLeft, moves, onGameOver]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const emptyIdx = grid.indexOf(0);
      const row = Math.floor(emptyIdx / SIZE), col = emptyIdx % SIZE;
      let target = -1;
      if (e.key === "ArrowUp"    && row < SIZE - 1) target = emptyIdx + SIZE;
      if (e.key === "ArrowDown"  && row > 0)         target = emptyIdx - SIZE;
      if (e.key === "ArrowLeft"  && col < SIZE - 1)  target = emptyIdx + 1;
      if (e.key === "ArrowRight" && col > 0)         target = emptyIdx - 1;
      if (target !== -1) handleTile(target);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [grid, handleTile]);

  const timerColor = timeLeft <= 15 ? "#ff4444" : timeLeft <= 30 ? "#f5c842" : "var(--accent)";

  // Hint: highlight tiles that should move toward solution
  const hintTiles = hint
    ? grid.map((val, i) => val !== 0 && val !== SOLVED[i])
    : grid.map(() => false);

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">

      {/* HUD */}
      <div className="w-full flex justify-between items-center px-1">
        <div>
          <div className="font-display text-xl font-bold" style={{ color: "var(--accent)" }}>
            {moves} moves
          </div>
        </div>
        <div className="font-display text-xl font-bold" style={{ color: timerColor }}>
          {timeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-raised)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
             style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%`, background: timerColor }} />
      </div>

      {/* Grid */}
      <div className="grid gap-1.5"
           style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: "100%", aspectRatio: "1" }}>
        {grid.map((val, idx) => {
          const isEmpty   = val === 0;
          const isCorrect = !isEmpty && val === SOLVED[idx];
          const isHinted  = hintTiles[idx];
          const moveable  = canMove(grid, idx);

          return (
            <button
              key={idx}
              onClick={() => handleTile(idx)}
              disabled={isEmpty || won}
              className="rounded-lg font-display font-bold text-base transition-all duration-150"
              style={{
                aspectRatio: "1",
                background: isEmpty
                  ? "transparent"
                  : isCorrect && !won
                  ? "rgba(200,241,53,0.1)"
                  : "var(--bg-raised)",
                border: isEmpty
                  ? "1.5px dashed var(--border)"
                  : isHinted
                  ? "1.5px solid rgba(245,200,66,0.6)"
                  : isCorrect
                  ? "1.5px solid rgba(200,241,53,0.4)"
                  : "1px solid var(--border)",
                color: isEmpty
                  ? "transparent"
                  : isCorrect
                  ? "var(--accent)"
                  : "var(--text-1)",
                cursor: isEmpty || !moveable ? "default" : "pointer",
                transform: moveable && !isEmpty ? "scale(1)" : undefined,
                opacity: won && !isCorrect ? 0.6 : 1,
              }}>
              {isEmpty ? "" : val}
            </button>
          );
        })}
      </div>

      {won && (
        <div className="font-display text-lg font-bold animate-fade-up" style={{ color: "var(--accent)" }}>
          🎉 Solved in {moves} moves!
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setHint((h) => !h)}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: hint ? "var(--accent-dim)" : "var(--bg-raised)",
            color: hint ? "var(--accent)" : "var(--text-3)",
            border: `1px solid ${hint ? "rgba(200,241,53,0.3)" : "var(--border)"}`,
          }}>
          {hint ? "Hide hints" : "Show hints"}
        </button>
        <button
          onClick={() => { setGrid(shuffle([...SOLVED])); setMoves(0); setWon(false); }}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "var(--bg-raised)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
          New puzzle
        </button>
      </div>

      <p className="text-xs" style={{ color: "var(--text-3)" }}>
        Tap tiles to slide · arrow keys work too
      </p>
    </div>
  );
}
