"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

const W = 320, H = 480;
const PLAYER_SIZE = 28;
const OBS_W = 50, OBS_H = 18;
const LANES = 3;
const LANE_W = W / LANES;

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  speed: number;
}

let nextObsId = 0;
const SPAWN_INTERVAL = 900;  // ms
const BASE_SPEED = 4;

export default function DodgeDashGame({ onGameOver }: Props) {
  const [playerLane, setPlayerLane] = useState(1); // 0,1,2
  const [obstacles, setObstacles]   = useState<Obstacle[]>([]);
  const [score, setScore]           = useState(0);
  const [alive, setAlive]           = useState(true);
  const [started, setStarted]       = useState(false);

  const playerLaneRef = useRef(playerLane);
  const aliveRef      = useRef(alive);
  const scoreRef      = useRef(score);
  playerLaneRef.current = playerLane;
  aliveRef.current      = alive;
  scoreRef.current      = score;

  const rafRef    = useRef<number>(0);
  const lastTime  = useRef(0);
  const spawnTime = useRef(0);

  const laneX = (lane: number) => lane * LANE_W + LANE_W / 2 - PLAYER_SIZE / 2;
  const playerY = H - 70;

  const gameLoop = useCallback((timestamp: number) => {
    if (!aliveRef.current) return;
    const dt = timestamp - lastTime.current;
    lastTime.current = timestamp;

    // Spawn
    if (timestamp - spawnTime.current > SPAWN_INTERVAL) {
      spawnTime.current = timestamp;
      const lane = Math.floor(Math.random() * LANES);
      const spd  = BASE_SPEED + scoreRef.current / 400;
      setObstacles((prev) => [...prev, { id: nextObsId++, lane, y: -OBS_H, speed: spd }]);
    }

    // Move obstacles + collision check
    setObstacles((prev) => {
      const moved = prev
        .map((o) => ({ ...o, y: o.y + o.speed * (dt / 16) }))
        .filter((o) => o.y < H + OBS_H);

      // Collision
      for (const o of moved) {
        if (
          o.lane === playerLaneRef.current &&
          o.y + OBS_H > playerY &&
          o.y < playerY + PLAYER_SIZE
        ) {
          aliveRef.current = false;
          setAlive(false);
          setTimeout(() => onGameOver(scoreRef.current), 500);
          return prev;
        }
      }
      return moved;
    });

    setScore((s) => s + 1);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [onGameOver, playerY]);

  const start = useCallback(() => {
    setStarted(true);
    setAlive(true);
    setScore(0);
    setObstacles([]);
    lastTime.current  = performance.now();
    spawnTime.current = performance.now();
    rafRef.current    = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Touch / click lane switching
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!started || !alive) return;
    const rect   = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const x      = clientX - rect.left;
    const lane   = Math.floor((x / rect.width) * LANES);
    setPlayerLane(Math.max(0, Math.min(LANES - 1, lane)));
  }, [started, alive]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setPlayerLane((l) => Math.max(0, l - 1));
      if (e.key === "ArrowRight") setPlayerLane((l) => Math.min(LANES - 1, l + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const LANE_COLORS = ["rgba(200,241,53,0.04)", "rgba(200,241,53,0.02)", "rgba(200,241,53,0.04)"];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Score */}
      <div className="w-full flex justify-between px-1">
        <div className="font-display text-2xl font-bold" style={{ color: "var(--accent)" }}>
          {score}
        </div>
        <div className="text-sm" style={{ color: "var(--text-3)" }}>
          Tap a lane to dodge
        </div>
      </div>

      {/* Canvas */}
      <div
        onClick={handleTap}
        onTouchStart={handleTap}
        className="relative rounded-2xl overflow-hidden select-none"
        style={{
          width: W, maxWidth: "100%",
          height: H,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          cursor: started && alive ? "pointer" : "default",
          touchAction: "none",
        }}>

        {/* Lane dividers */}
        {[1, 2].map((i) => (
          <div key={i} style={{
            position: "absolute", top: 0, left: (W / LANES) * i - 0.5,
            width: 1, height: H, background: "var(--border)", opacity: 0.5,
          }} />
        ))}

        {/* Lane highlights */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: "absolute", top: 0,
            left: i * LANE_W, width: LANE_W, height: H,
            background: LANE_COLORS[i],
          }} />
        ))}

        {/* Player */}
        {started && (
          <div style={{
            position: "absolute",
            left: laneX(playerLane),
            top: playerY,
            width: PLAYER_SIZE, height: PLAYER_SIZE,
            borderRadius: "50%",
            background: alive ? "var(--accent)" : "#ff5555",
            boxShadow: alive ? "0 0 16px rgba(200,241,53,0.5)" : "0 0 16px rgba(255,85,85,0.5)",
            transition: "left 0.12s cubic-bezier(0.25,0.8,0.25,1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            {alive ? "★" : "✕"}
          </div>
        )}

        {/* Obstacles */}
        {obstacles.map((o) => (
          <div key={o.id} style={{
            position: "absolute",
            left: o.lane * LANE_W + (LANE_W - OBS_W) / 2,
            top: o.y,
            width: OBS_W, height: OBS_H,
            borderRadius: 6,
            background: "rgba(255,80,80,0.25)",
            border: "1.5px solid rgba(255,80,80,0.6)",
          }} />
        ))}

        {/* Start overlay */}
        {!started && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}>
            <div className="text-5xl mb-4">🌪️</div>
            <div className="font-display text-xl font-bold mb-2">DodgeDash</div>
            <div className="text-sm mb-6" style={{ color: "var(--text-2)" }}>Tap a lane to dodge obstacles</div>
            <button className="btn-primary px-8 py-3" onClick={(e) => { e.stopPropagation(); start(); }}>
              Start →
            </button>
          </div>
        )}

        {/* Death overlay */}
        {started && !alive && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
          }}>
            <div className="text-4xl mb-2">💥</div>
            <div className="font-display text-lg font-bold" style={{ color: "#ff5555" }}>Crashed!</div>
            <div className="font-display text-3xl font-bold mt-1" style={{ color: "var(--accent)" }}>
              {score}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--text-3)" }}>
        Tap left/centre/right · arrow keys also work
      </p>
    </div>
  );
}
