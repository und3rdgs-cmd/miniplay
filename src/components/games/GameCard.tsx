import Link from "next/link";
import type { Game } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  game: Game;
  featured?: boolean;
  style?: React.CSSProperties;
}

export default function GameCard({ game, featured, style }: Props) {
  return (
    <Link href={`/games/${game.slug}`}
      className={cn(
        "card group block p-4 transition-all duration-200 animate-fade-up",
        "hover:border-white/20 hover:-translate-y-0.5 active:scale-[0.98]",
        featured && "sm:col-span-1"
      )}
      style={style}>

      {/* Emoji icon */}
      <div className={cn(
        "text-3xl mb-3 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
        featured ? "text-4xl w-14 h-14 rounded-2xl" : ""
      )}
        style={{ background: "var(--bg-raised)" }}>
        {game.emoji}
      </div>

      {/* Title + desc */}
      <div className="font-display font-semibold text-sm mb-1 truncate">{game.title}</div>

      {featured && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-2)" }}>
          {game.description}
        </p>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap gap-1 mt-2">
        {game.is_daily && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
            Daily
          </span>
        )}
        {game.is_pro_only && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(255,200,50,0.12)", color: "#f5c842" }}>
            Pro
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
              style={{ background: "var(--bg-raised)", color: "var(--text-3)" }}>
          {game.category}
        </span>
      </div>

    </Link>
  );
}
