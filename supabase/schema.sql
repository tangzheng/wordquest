-- WordQuest Multi-user Database Schema for Supabase
-- PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User game state (mastery, stars, badges, streak, settings)
create table public.game_states (
  id uuid references auth.users(id) on delete cascade primary key,
  current_level text default 'starters' check (current_level in ('starters', 'movers', 'flyers', 'ket')),
  total_stars integer default 0,
  daily_streak integer default 0,
  last_play_date date,
  grace_days_used integer default 0,
  settings jsonb default '{"soundEnabled":true,"musicEnabled":false,"speechRate":0.8,"showChinese":true}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Word mastery per user (Leitner box system)
create table public.word_mastery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  word_id text not null,
  box integer default 1 check (box between 1 and 5),
  last_review_date date,
  next_review_date date,
  correct_streak integer default 0,
  total_attempts integer default 0,
  total_correct integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, word_id)
);

-- User badges
create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_id)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_word_mastery_user_id on public.word_mastery(user_id);
create index idx_word_mastery_user_word on public.word_mastery(user_id, word_id);
create index idx_user_badges_user_id on public.user_badges(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger for game_states updated_at
create trigger handle_game_states_updated_at
  before update on public.game_states
  for each row execute function public.handle_updated_at();

-- Trigger for word_mastery updated_at
create trigger handle_word_mastery_updated_at
  before update on public.word_mastery
  for each row execute function public.handle_updated_at();

-- Function to get or create game state
create or replace function public.get_or_create_game_state(p_user_id uuid)
returns game_states as $$
declare
  v_state game_states;
begin
  select * into v_state from public.game_states where id = p_user_id;
  if not found then
    insert into public.game_states (id) values (p_user_id) returning * into v_state;
  end if;
  return v_state;
end;
$$ language plpgsql security definer;

-- Function to upsert word mastery
create or replace function public.upsert_word_mastery(
  p_user_id uuid,
  p_word_id text,
  p_box integer,
  p_correct boolean,
  p_last_review date
) returns void as $$
begin
  insert into public.word_mastery (user_id, word_id, box, last_review_date, next_review_date, correct_streak, total_attempts, total_correct)
  values (p_user_id, p_word_id, p_box, p_last_review, p_last_review, case when p_correct then 1 else 0 end, 1, case when p_correct then 1 else 0 end)
  on conflict (user_id, word_id) do update set
    box = case when p_correct then least(word_mastery.box + 1, 5) else 1 end,
    last_review_date = p_last_review,
    next_review_date = p_last_review,
    correct_streak = case when p_correct then word_mastery.correct_streak + 1 else 0 end,
    total_attempts = word_mastery.total_attempts + 1,
    total_correct = word_mastery.total_correct + case when p_correct then 1 else 0 end;
end;
$$ language plpgsql security definer;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.game_states enable row level security;
alter table public.word_mastery enable row level security;
alter table public.user_badges enable row level security;

-- Users can only see/modify their own data
create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users can manage own game state" on public.game_states
  for all using (auth.uid() = id);

create policy "Users can manage own word mastery" on public.word_mastery
  for all using (auth.uid() = user_id);

create policy "Users can manage own badges" on public.user_badges
  for all using (auth.uid() = user_id);

-- ============================================
-- INITIAL SETUP (run after auth setup)
-- ============================================

-- Create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile
  insert into public.profiles (id) values (new.id);

  -- Create game state
  insert into public.game_states (id) values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();