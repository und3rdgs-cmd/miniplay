-- ============================================================
-- MiniPlay Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  username            text unique not null,
  avatar_url          text,
  subscription_tier   text not null default 'free' check (subscription_tier in ('free', 'pro')),
  stripe_customer_id  text unique,
  subscription_end    timestamptz,
  streak_days         integer not null default 0,
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

-- ── Game Scores ──────────────────────────────────────────────
create table public.game_scores (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  game_id           text not null,
  score             integer not null default 0,
  duration_seconds  integer not null default 0,
  difficulty        text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  metadata          jsonb,
  played_at         timestamptz not null default now()
);

create index idx_game_scores_game_id    on public.game_scores(game_id);
create index idx_game_scores_user_id    on public.game_scores(user_id);
create index idx_game_scores_score_desc on public.game_scores(game_id, score desc);

-- ── Daily Challenges ─────────────────────────────────────────
create table public.daily_challenges (
  id                uuid primary key default uuid_generate_v4(),
  game_id           text not null,
  date              date not null,
  seed              integer not null,
  bonus_multiplier  numeric not null default 1.5,
  unique(game_id, date)
);

-- ── Leaderboard View ─────────────────────────────────────────
create or replace view public.leaderboard_view as
  select
    gs.game_id,
    gs.score,
    gs.played_at,
    p.username,
    p.avatar_url,
    row_number() over (partition by gs.game_id order by gs.score desc) as rank
  from public.game_scores gs
  join public.profiles p on p.id = gs.user_id;

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.game_scores enable row level security;

-- Profiles: users read their own, all can read others' usernames
create policy "Public profiles are viewable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Scores: insert own, read all (for leaderboard)
create policy "Anyone can view scores"
  on public.game_scores for select using (true);

create policy "Users can insert own scores"
  on public.game_scores for insert with check (auth.uid() = user_id);

-- ── Streak updater ───────────────────────────────────────────
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_played date;
  v_today       date := current_date;
begin
  select last_played_at::date into v_last_played
  from public.profiles where id = p_user_id;

  if v_last_played = v_today - 1 then
    -- Consecutive day
    update public.profiles
      set streak_days = streak_days + 1, last_played_at = now()
    where id = p_user_id;
  elsif v_last_played < v_today - 1 or v_last_played is null then
    -- Streak broken or first play
    update public.profiles
      set streak_days = 1, last_played_at = now()
    where id = p_user_id;
  else
    -- Same day, just update timestamp
    update public.profiles
      set last_played_at = now()
    where id = p_user_id;
  end if;
end;
$$;
