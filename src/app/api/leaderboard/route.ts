import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  const limit  = Math.min(Number(searchParams.get("limit") ?? 10), 50);

  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("game_scores")
    .select("score, played_at, profiles(username, avatar_url)")
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaderboard = (data ?? []).map((row, i) => ({
    rank: i + 1,
    score: row.score,
    played_at: row.played_at,
    // @ts-expect-error — Supabase join types
    username: row.profiles?.username ?? "Anonymous",
    // @ts-expect-error — Supabase join types
    avatar_url: row.profiles?.avatar_url ?? null,
  }));

  return NextResponse.json({ data: leaderboard });
}
