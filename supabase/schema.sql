-- ═══════════════════════════════════════════════════════════════════════════════
-- CrickBuz / Gamelens — Profiles Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  username text unique not null default '',
  phone_number text,
  country_code text not null default '+91',
  location text,
  latitude double precision,
  longitude double precision,
  height double precision,
  height_unit text not null default 'cm' check (height_unit in ('cm', 'ft')),
  weight_kg double precision,
  dob date,
  avatar_url text,
  player_role text check (player_role in ('Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper', 'Wicket Keeper Batsman')),
  batting_style text check (batting_style in ('Right Hand Bat', 'Left Hand Bat')),
  bowling_style text check (bowling_style in ('Right Arm Fast', 'Right Arm Medium', 'Right Arm Off Spin', 'Right Arm Leg Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Orthodox', 'Left Arm Chinaman')),
  matches_played integer not null default 0,
  friends_count integer not null default 0,
  posts_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. RLS Policies
create policy "Users can view any profile"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(lower(replace(new.raw_user_meta_data->>'full_name', ' ', '_')), 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

-- Drop existing trigger if re-running
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Increment stat function (for RPC calls)
create or replace function public.increment_profile_stat(
  user_id uuid,
  stat_field text,
  amount integer default 1
)
returns void
language plpgsql
security definer
as $$
begin
  if stat_field = 'matches_played' then
    update public.profiles set matches_played = matches_played + amount, updated_at = now() where id = user_id;
  elsif stat_field = 'friends_count' then
    update public.profiles set friends_count = friends_count + amount, updated_at = now() where id = user_id;
  elsif stat_field = 'posts_count' then
    update public.profiles set posts_count = posts_count + amount, updated_at = now() where id = user_id;
  end if;
end;
$$;

-- 6. Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 7. Storage policies
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
