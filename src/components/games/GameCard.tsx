import Link from "next/link";
import Image from "next/image";
import type { Game } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  game: Game;
  featured?: boolean;
  style?: React.CSSProperties;
}

const FALLBACK_BG: Record<string, string> = {
  word:    "linear-gradient(135deg, #ffd6f0, #ffb3e6)",
  reflex:  "linear-gradient(135deg, #fff3a0, #ffe066)",
  puzzle:  "linear-gradient(135deg, #b3f5e8, #80edd8)",
  trivia:  "linear-gradient(135deg, #b3d9ff, #80bfff)",
  visual:  "linear-gradient(135deg, #e8b3ff, #d480ff)",
  math:    "linear-gradient(135deg, #b3ffcc, #80ff99)",
  arcade:  "linear-gradient(135deg, #ffd4b3, #ffb380)",
  memory:  "linear-gradient(135deg, #d4b3ff, #b380ff)",
};

// Games with custom PNG thumbnails — shown without background card
const CUSTOM_PNG: Record<string, boolean> = {
  wordrush: true,
};

export default function GameCard({ game, featured, style }: Props) {
  const hasPng    = CUSTOM_PNG[game.slug];
  const thumbSrc  = hasPng
    ? `/thumbnails/${game.slug}.png`
    : `/thumbnails/${game.slug}.svg`;
  const fallbackBg = FALLBACK_BG[game.category] ?? FALLBACK_BG.arcade;
  const size = featured ? 176 : 112;

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn("group block animate-fade-up text-center transition-all duration-200 hover:-translate-y-2")}
      style={style}
    >
      {hasPng ? (
        /* Custom PNG — no background wrapper, image IS the card */
        <div
          className={cn(
            "mx-auto mb-3 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-2",
            featured ? "w-44 h-44" : "w-28 h-28"
          )}
        >
          <Image
            src={thumbSrc}
            alt={game.title}
            width={size}
            height={size}
            className="w-full h-full object-contain drop-shadow-lg"
            unoptimized
          />
        </div>
      ) : (
        /* SVG thumbnail — inside coloured background tile */
        <div
          className={cn(
            "rounded-3xl mx-auto mb-3 overflow-hidden transition-transform duration-200 group-hover:scale-105 group-hover:rotate-2",
            featured ? "w-44 h-44" : "w-28 h-28"
          )}
          style={{ background: fallbackBg, boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}
        >
          <Image
            src={thumbSrc}
            alt={game.title}
            width={size}
            height={size}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Title */}
      <div className={cn(
        "font-display font-bold truncate",
        featured ? "text-base" : "text-sm"
      )} style={{ color: "var(--text-1)" }}>
        {game.title}
      </div>

      {/* Category + badges */}
      <div className="flex flex-wrap gap-1 justify-center mt-1">
        <span className="text-xs capitalize font-medium" style={{ color: "var(--text-3)" }}>
          {game.category}
        </span>
        {game.is_daily && (
          <span className="text-xs font-bold px-1.5 rounded-full"
                style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>
            · Daily
          </span>
        )}
      </div>
    </Link>
  );
}

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn("group block animate-fade-up text-center transition-all duration-200 hover:-translate-y-2")}
      style={style}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "rounded-3xl mx-auto mb-3 overflow-hidden transition-transform duration-200 group-hover:scale-105 group-hover:rotate-2",
          featured ? "w-44 h-44" : "w-28 h-28"
        )}
        style={{ background: fallbackBg, boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}
      >
        <Image
          src={thumbSrc}
          alt={game.title}
          width={featured ? 176 : 112}
          height={featured ? 176 : 112}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      {/* Title */}
      <div className={cn(
        "font-display font-bold truncate",
        featured ? "text-base" : "text-sm"
      )} style={{ color: "var(--text-1)" }}>
        {game.title}
      </div>

      {/* Category + badges */}
      <div className="flex flex-wrap gap-1 justify-center mt-1">
        <span className="text-xs capitalize font-medium" style={{ color: "var(--text-3)" }}>
          {game.category}
        </span>
        {game.is_daily && (
          <span className="text-xs font-bold px-1.5 rounded-full"
                style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>
            · Daily
          </span>
        )}
      </div>
    </Link>
  );
}
