import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Go Pro",
  description: "Upgrade to MiniPlay Pro. Remove all ads, unlock exclusive games, and get full stats for $3.99/month.",
};

const FEATURES = [
  { emoji: "🚫", title: "Zero ads",          desc: "Clean, distraction-free gaming across every game." },
  { emoji: "🔒", title: "Exclusive games",   desc: "Access 2–3 Pro-only games not available on the free tier." },
  { emoji: "📊", title: "Full stats",         desc: "Complete score history, personal bests, and detailed analytics." },
  { emoji: "🏆", title: "Pro leaderboard",   desc: "Compete on a separate Pro-only leaderboard." },
  { emoji: "⚡", title: "Priority access",   desc: "Be first to try new games before they go public." },
  { emoji: "❤️", title: "Support the dev",   desc: "Help us keep MiniPlay free for everyone." },
];

export default function ProPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-16 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
             style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(200,241,53,0.3)" }}>
          ⭐ MiniPlay Pro
        </div>

        <h1 className="font-display text-5xl font-bold mb-4 leading-tight">
          Play without limits
        </h1>
        <p className="text-lg mb-12" style={{ color: "var(--text-2)" }}>
          One simple subscription. Cancel anytime.
        </p>

        {/* Pricing card */}
        <div className="card-raised p-8 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5"
               style={{ background: "radial-gradient(circle at 50% 0%, var(--accent), transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-end justify-center gap-1 mb-2">
              <span className="font-display text-6xl font-bold">$3.99</span>
              <span className="text-lg mb-3" style={{ color: "var(--text-2)" }}>/month</span>
            </div>
            <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>Billed monthly · Cancel anytime</p>

            {/* This posts to our Stripe checkout API route */}
            <form action="/api/stripe/checkout" method="POST">
              <button type="submit" className="btn-primary w-full py-4 text-base font-semibold">
                Upgrade to Pro →
              </button>
            </form>

            <p className="text-xs mt-4" style={{ color: "var(--text-3)" }}>
              Powered by Stripe · Secure payment
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="text-2xl mb-3">{f.emoji}</div>
              <div className="font-display font-semibold mb-1">{f.title}</div>
              <div className="text-sm" style={{ color: "var(--text-2)" }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm" style={{ color: "var(--text-3)" }}>
          Already a member?{" "}
          <Link href="/account" className="underline" style={{ color: "var(--text-2)" }}>
            Manage your subscription
          </Link>
        </p>

      </main>
    </>
  );
}
