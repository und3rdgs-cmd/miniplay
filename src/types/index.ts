// ─── User & Subscription ────────────────────────────────────

export type SubscriptionTier = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  subscription_end?: string;
  streak_days: number;
  last_played_at?: string;
  created_at: string;
}

// ─── Games ──────────────────────────────────────────────────

export type GameCategory = "word" | "reflex" | "puzzle" | "trivia" | "visual" | "math" | "arcade" | "memory";
export type GameDifficulty = "easy" | "medium" | "hard";

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: GameCategory;
  emoji: string;
  color: string;          // Tailwind bg class e.g. "bg-purple-100"
  accent: string;         // Tailwind text/border class
  is_pro_only: boolean;
  is_daily: boolean;
  min_session_seconds: number;
  max_session_seconds: number;
  tags: string[];
}

export interface GameScore {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  duration_seconds: number;
  difficulty: GameDifficulty;
  metadata?: Record<string, unknown>;
  played_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url?: string;
  score: number;
  played_at: string;
}

// ─── Daily Challenge ────────────────────────────────────────

export interface DailyChallenge {
  id: string;
  game_id: string;
  date: string;           // YYYY-MM-DD
  seed: number;           // deterministic game seed
  bonus_multiplier: number;
}

// ─── Ad Slots ───────────────────────────────────────────────

export type AdSlot = "banner_bottom" | "interstitial" | "rewarded";

export interface AdConfig {
  slot: AdSlot;
  client_id: string;
  show_to_free_only: boolean;
}

// ─── API Responses ──────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
