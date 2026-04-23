import { notFound } from "next/navigation";
import { getGameBySlug, GAMES } from "@/lib/games";
import GameShell from "@/components/games/GameShell";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.description,
    openGraph: { title: `${game.title} | MiniPlay`, description: game.description },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  return <GameShell game={game} />;
}
