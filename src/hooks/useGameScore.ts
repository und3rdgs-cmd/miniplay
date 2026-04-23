"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GameDifficulty } from "@/types";

export function useGameScore(gameId: string) {
  const supabase = createClient();

  const submitScore = useCallback(
    async (score: number, durationSeconds: number, difficulty: GameDifficulty = "medium", metadata?: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // anonymous — don't save

      await supabase.from("game_scores").insert({
        user_id: user.id,
        game_id: gameId,
        score,
        duration_seconds: durationSeconds,
        difficulty,
        metadata,
        played_at: new Date().toISOString(),
      });
    },
    [gameId, supabase]
  );

  const getLeaderboard = useCallback(
    async (limit = 10) => {
      const { data } = await supabase
        .from("leaderboard_view")
        .select("*")
        .eq("game_id", gameId)
        .order("score", { ascending: false })
        .limit(limit);
      return data ?? [];
    },
    [gameId, supabase]
  );

  const getPersonalBest = useCallback(
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("game_scores")
        .select("score")
        .eq("game_id", gameId)
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(1)
        .single();
      return data?.score ?? null;
    },
    [gameId, supabase]
  );

  return { submitScore, getLeaderboard, getPersonalBest };
}
