# MiniPlay 🎮

> Quick games, big fun. AI-powered casual gaming platform.

## Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Framework    | Next.js 15 (App Router)           |
| Language     | TypeScript                        |
| Styling      | Tailwind CSS + CSS variables      |
| Auth + DB    | Supabase (Postgres + RLS)         |
| Payments     | Stripe (subscriptions)            |
| Ads          | Google AdSense                    |
| Hosting      | Vercel                            |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in all values — see sections below
```

### 3. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase-schema.sql`
3. Copy your **Project URL** and **anon key** → paste into `.env.local`
4. Copy your **service role key** → paste into `.env.local`
5. In **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/api/auth/callback`

### 4. Set up Stripe
1. Create an account at [stripe.com](https://stripe.com)
2. In **Products**, create a recurring product: **MiniPlay Pro**, price **$3.99/month**
3. Copy the **price ID** → `STRIPE_PRO_PRICE_ID` in `.env.local`
4. Copy **publishable** and **secret keys** → `.env.local`
5. Set up webhook:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook secret → `STRIPE_WEBHOOK_SECRET`

### 5. Run dev server
```bash
npm run dev
# http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── games/
│   │   ├── page.tsx          # All games listing
│   │   └── [slug]/page.tsx   # Individual game page
│   ├── pro/page.tsx          # Upgrade page
│   └── api/
│       ├── stripe/
│       │   ├── checkout/     # Create Stripe session
│       │   └── webhook/      # Handle Stripe events
│       ├── auth/callback/    # Supabase OAuth callback
│       └── leaderboard/      # Leaderboard API
├── components/
│   ├── ui/Navbar.tsx
│   ├── games/
│   │   ├── GameCard.tsx      # Game tile on listing pages
│   │   └── GameShell.tsx     # Wrapper for every game
│   └── ads/AdBanner.tsx      # AdSense (hidden for Pro)
├── hooks/
│   ├── useAuth.ts            # User + subscription state
│   └── useGameScore.ts       # Submit + fetch scores
├── lib/
│   ├── games.ts              # Game registry (all 8 games)
│   ├── stripe.ts             # Stripe helpers
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client
│   └── utils.ts              # Helpers (cn, formatScore…)
└── types/index.ts            # All TypeScript types
```

---

## Adding a New Game

1. Add the game definition to `src/lib/games.ts`
2. Create `src/components/games/[GameName].tsx`
3. Import and render it in `GameShell.tsx` based on `game.slug`

Each game component receives:
```tsx
interface GameProps {
  onGameOver: (finalScore: number) => void;
}
```

---

## Monetisation

### Ads (free users)
- `AdBanner` component auto-hides for Pro users
- Replace placeholder in `AdBanner.tsx` with your AdSense `<ins>` tag
- Slots: `banner_bottom`, `interstitial` (game over screen), `rewarded`

### Pro subscription ($3.99/mo)
- Stripe Checkout → webhook → Supabase `profiles.subscription_tier = 'pro'`
- `useAuth().isPro` is `true` for Pro users throughout the app

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all `.env.local` variables to Vercel's Environment Variables.

For Stripe webhooks in production, create a new endpoint in Stripe Dashboard:
`https://yourdomain.com/api/stripe/webhook`

---

## Revenue Projections

| Milestone       | Target                          |
|-----------------|---------------------------------|
| Month 3         | $200–500/mo (ads only)          |
| Month 6         | $1–3k/mo (ads + early subs)     |
| Month 12        | $5–15k/mo (scale + optimise)    |

Key metric: **1,000 Pro subscribers = $4,000/mo recurring** before ads.
