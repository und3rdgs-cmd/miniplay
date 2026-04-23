import Link from "next/link";
import type { Game } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  game: Game;
  featured?: boolean;
  style?: React.CSSProperties;
}

const CARD_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  word:    { bg: "linear-gradient(135deg, #fff0fa, #ffe8f5)", border: "#f9a8d4", glow: "rgba(249,168,212,0.4)" },
  reflex:  { bg: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "#fcd34d", glow: "rgba(252,211,77,0.4)" },
  puzzle:  { bg: "linear-gradient(135deg, #f0fdfa, #ccfbf1)", border: "#5eead4", glow: "rgba(94,234,212,0.4)" },
  trivia:  { bg: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "#93c5fd", glow: "rgba(147,197,253,0.4)" },
  visual:  { bg: "linear-gradient(135deg, #fdf4ff, #fae8ff)", border: "#e879f9", glow: "rgba(232,121,249,0.4)" },
  math:    { bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "#86efac", glow: "rgba(134,239,172,0.4)" },
  arcade:  { bg: "linear-gradient(135deg, #fff7ed, #ffedd5)", border: "#fb923c", glow: "rgba(251,146,60,0.4)" },
  memory:  { bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "#a78bfa", glow: "rgba(167,139,250,0.4)" },
};

export default function GameCard({ game, featured, style }: Props) {
  const colors = CARD_COLORS[game.category] ?? CARD_COLORS.arcade;

  return (
    <Link href={`/games/${game.slug}`}
      className={cn(
        "group block p-4 rounded-2xl transition-all duration-200 animate-fade-up",
        "hover:-translate-y-1 active:scale-[0.97]",
      )}
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        boxShadow: `0 2px 12px ${colors.glow}`,
        ...style,
      }}>

      {/* Emoji icon */}
      <div className={cn(
        "rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6",
        featured ? "text-5xl w-16 h-16" : "text-3xl w-12 h-12"
      )}
        style={{ background: "rgba(255,255,255,0.7)", boxShadow: `0 2px 8px ${colors.glow}` }}>
        {game.emoji}
      </div>

      {/* Title */}
      <div className="font-display font-bold text-sm mb-1 truncate" style={{ color: "var(--text-1)" }}>
        {game.title}
      </div>

      {featured && (
        <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: "var(--text-2)" }}>
          {game.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-1">
        {game.is_daily && (
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>
            Daily
          </span>
        )}
        {game.is_pro_only && (
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(255,217,61,0.2)", color: "#b45309" }}>
            Pro
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
              style={{ background: "rgba(255,255,255,0.7)", color: "var(--text-3)" }}>
          {game.category}
        </span>
      </div>

    </Link>
  );
}
