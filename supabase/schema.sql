-- Zì You Later: tables and security rules for Supabase.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to run again: it only creates what is missing and replaces the rules.

-- Public profile shown on the leaderboard. No email or other private data here.
create table if not exists public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  name      text not null check (char_length(name) between 2 and 20 and name = btrim(name)),
  avatar    text not null default '🐼' check (char_length(avatar) between 1 and 8),
  known     int  not null default 0 check (known    between 0 and 5000),
  learning  int  not null default 0 check (learning between 0 and 5000),
  streak    int  not null default 0 check (streak   between 0 and 3660),
  week      int  not null default 0 check (week     between 0 and 50000),
  total     int  not null default 0 check (total    between 0 and 10000000),
  updated   bigint not null default 0
);
-- nicknames are unique, ignoring upper/lower case
create unique index if not exists profiles_name_unique on public.profiles (lower(name));

-- Private study progress, one row per user.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null check (pg_column_size(data) < 2000000),
  updated_at timestamptz not null default now()
);

-- Row level security: without a matching rule, nobody can read or change anything.
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists "profiles: anyone can read"     on public.profiles;
drop policy if exists "profiles: insert own"          on public.profiles;
drop policy if exists "profiles: update own"          on public.profiles;
drop policy if exists "profiles: delete own"          on public.profiles;
drop policy if exists "progress: read own"            on public.progress;
drop policy if exists "progress: insert own"          on public.progress;
drop policy if exists "progress: update own"          on public.progress;
drop policy if exists "progress: delete own"          on public.progress;

create policy "profiles: anyone can read" on public.profiles
  for select to anon, authenticated using (true);
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles: delete own" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

create policy "progress: read own" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress: insert own" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress: update own" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress: delete own" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.profiles from anon, authenticated;
revoke all on public.progress from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.progress to authenticated;

-- "Delete account" in the app: removes the signed-in user. Profile and progress go with it (on delete cascade).
create or replace function public.delete_me()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
