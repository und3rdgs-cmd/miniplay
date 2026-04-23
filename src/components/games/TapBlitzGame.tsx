"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatScore } from "@/lib/utils";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

interface Props {
  onGameOver: (score: number) => void;
}

const GAME_DURATION = 30; // seconds
const TARGET_LIFETIME = 1800; // ms before target disappears
const SPAWN_INTERVAL_MS = 600;

let nextId = 0;

function spawnTarget(): Target {
  const size = 44 + Math.random() * 32; // 44–76px
  return {
    id: nextId++,
    x: 5 + Math.random() * 85,   // % from left (keep in bounds)
    y: 5 + Math.random() * 80,   // % from top
    size,
    createdAt: Date.now(),
  };
}

export default function TapBlitzGame({ onGameOver }: Props) {
  const [targets, setTargets]     = useState<Target[]>([spawnTarget()]);
  const [score, setScore]         = useState(0);
  const [misses, setMisses]       = useState(0);
  const [timeLeft, setTimeLeft]   = useState(GAME_DURATION);
  const [combo, setCombo]         = useState(0);
  const [flash, setFlash]         = useState<{ x: number; y: number; pts: number } | null>(null);

  const scoreRef  = useRef(score);
  const comboRef  = useRef(combo);
  scoreRef.current = score;
  comboRef.current = combo;

  // Game timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onGameOver(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onGameOver]);

  // Spawn targets
  useEffect(() => {
    const interval = setInterval(() => {
      setTargets((prev) => {
        const now = Date.now();
        // Remove expired targets (missed)
        const alive = prev.filter((t) => now - t.createdAt < TARGET_LIFETIME);
        const removed = prev.length - alive.length;
        if (removed > 0) setMisses((m) => Math.min(m + removed, 10));
        return [...alive, spawnTarget()];
      });
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleTap = useCallback((target: Target, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newCombo = comboRef.current + 1;
    const pts = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;

    setCombo(newCombo);
    setScore((s) => s + pts);
    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    // Flash +pts at tap location
    const rect = (e.currentTarget as HTMLElement).closest(".game-area")?.getBoundingClientRect();
    if (rect) {
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      setFlash({ x: clientX - rect.left, y: clientY - rect.top, pts });
      setTimeout(() => setFlash(null), 500);
    }
  }, []);

  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft <= 5 ? "#ff4444" : timeLeft <= 10 ? "#f5c842" : "var(--accent)";

  return (
    <div className="w-full max-w-sm mx-auto select-none" style={{ touchAction: "none" }}>

      {/* HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="font-display text-3xl font-bold" style={{ color: "var(--accent)" }}>
            {formatScore(score)}
          </div>
          {combo >= 3 && (
            <div className="text-xs font-semibold animate-pulse"
                 style={{ color: combo >= 5 ? "#f5c842" : "var(--accent)" }}>
              {combo >= 5 ? "🔥 COMBO x3!" : "✨ Combo x2"}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="font-display text-2xl font-bold" style={{ color: timerColor }}>
            {timeLeft}s
          </div>
          <div className="text-xs" style={{ color: "var(--text-3)" }}>
            {misses > 0 && `${misses} missed`}
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "var(--bg-raised)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
             style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      {/* Game area */}
      <div className="game-area relative rounded-2xl overflow-hidden"
           style={{
             height: 360,
             background: "var(--bg-card)",
             border: "1px solid var(--border)",
             cursor: "crosshair",
           }}>

        {targets.map((target) => {
          const age = Date.now() - target.createdAt;
          const fadePct = Math.max(0, 1 - age / TARGET_LIFETIME);
          return (
            <button
              key={target.id}
              onClick={(e) => handleTap(target, e)}
              onTouchStart={(e) => handleTap(target, e)}
              style={{
                position: "absolute",
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: target.size,
                height: target.size,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `rgba(200, 241, 53, ${0.15 + fadePct * 0.25})`,
                border: `2px solid rgba(200, 241, 53, ${fadePct * 0.9})`,
                cursor: "pointer",
                transition: "transform 0.08s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: target.size * 0.45,
              }}
              className="active:scale-90"
              aria-label="tap target"
            >
              ⚡
            </button>
          );
        })}

        {/* +pts flash */}
        {flash && (
          <div
            className="pointer-events-none absolute font-display font-bold animate-fade-up"
            style={{
              left: flash.x,
              top: flash.y,
              color: flash.pts >= 3 ? "#f5c842" : "var(--accent)",
              fontSize: flash.pts >= 3 ? 28 : 20,
              transform: "translate(-50%, -100%)",
            }}>
            +{flash.pts}
          </div>
        )}

        {timeLeft === 0 && (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="font-display text-2xl font-bold">Time&apos;s up!</div>
          </div>
        )}
      </div>

      <p className="text-center text-xs mt-3" style={{ color: "var(--text-3)" }}>
        Tap the targets · 3-combo = x2 · 5-combo = x3
      </p>
    </div>
  );
}
