-- ============================================================
-- MiniPlay — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  username            text unique not null,
  avatar_url          text,
  subscription_tier   text not null default 'free' check (subscription_tier in ('free', 'pro')),
  stripe_customer_id  text unique,
  subscription_end    timestamptz,
  streak_days         int not null default 0,
  last_played_at      timestamptz,
  created_at          timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Game Scores ─────────────────────────────────────────────
create table public.game_scores (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  game_id          text not null,
  score            int not null,
  duration_seconds int not null default 0,
  difficulty       text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  metadata         jsonb,
  played_at        timestamptz not null default now()
);

create index idx_game_scores_game_id    on public.game_scores(game_id);
create index idx_game_scores_user_id    on public.game_scores(user_id);
create index idx_game_scores_score_desc on public.game_scores(game_id, score desc);

-- ── Daily Challenges ─────────────────────────────────────────
create table public.daily_challenges (
  id                 uuid primary key default uuid_generate_v4(),
  game_id            text not null,
  date               date not null,
  seed               int not null,
  bonus_multiplier   numeric(4,2) not null default 1.5,
  unique (game_id, date)
);

-- ── Daily Challenge Completions ──────────────────────────────
create table public.daily_completions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  score        int not null,
  completed_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

-- ── Leaderboard View ─────────────────────────────────────────
-- Best score per user per game
create view public.leaderboard_view as
select distinct on (game_id, user_id)
  gs.id,
  gs.game_id,
  gs.user_id,
  gs.score,
  gs.played_at,
  p.username,
  p.avatar_url,
  p.subscription_tier
from public.game_scores gs
join public.profiles p on p.id = gs.user_id
order by gs.game_id, gs.user_id, gs.score desc;

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.game_scores    enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_completions enable row level security;

-- Profiles: users read their own, public can read username/avatar
create policy "profiles_select_own"   on public.profiles for select using (true);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);

-- Scores: users insert their own, everyone can read (for leaderboard)
create policy "scores_select_all"     on public.game_scores for select using (true);
create policy "scores_insert_own"     on public.game_scores for insert with check (auth.uid() = user_id);

-- Daily challenges: public read
create policy "challenges_select_all" on public.daily_challenges for select using (true);

-- Completions: users manage their own
create policy "completions_select_own"  on public.daily_completions for select using (auth.uid() = user_id);
create policy "completions_insert_own"  on public.daily_completions for insert with check (auth.uid() = user_id);

-- ── Streak Update Function ───────────────────────────────────
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_played date;
  v_today date := current_date;
begin
  select last_played_at::date into v_last_played
  from public.profiles where id = p_user_id;

  if v_last_played is null or v_last_played < v_today - interval '1 day' then
    -- Streak broken or first play
    update public.profiles
    set streak_days = case when v_last_played = v_today - 1 then streak_days + 1 else 1 end,
        last_played_at = now()
    where id = p_user_id;
  else
    -- Already played today, just update timestamp
    update public.profiles set last_played_at = now() where id = p_user_id;
  end if;
end;
$$;

-- ── Seed Daily Challenges for next 7 days ───────────────────
-- (Run manually or via a cron job)
insert into public.daily_challenges (game_id, date, seed, bonus_multiplier)
select
  game_id,
  current_date + i as date,
  floor(random() * 999999)::int as seed,
  1.5 as bonus_multiplier
from
  unnest(array['wordrush', 'quizdrop']) as game_id,
  generate_series(0, 6) as i
on conflict (game_id, date) do nothing;
