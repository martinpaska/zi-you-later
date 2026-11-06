-- Zì You Later: the admin page (#admin) and anonymous usage counts.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run (after schema.sql).
-- Safe to run again. Then make yourself an admin (see README.md, step "Admin"):
--   insert into public.admins (user_id) select id from auth.users where email = 'YOUR EMAIL' on conflict do nothing;

-- Who is an admin. Nobody can read or change this table from the app: there are no rules for it.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Anonymous usage: per day and kind ("visit" or "mode:cards" …), how many devices with and without an account.
-- The app sends each kind at most once a day per device. No id, no IP address, nothing about the person is stored.
create table if not exists public.usage (
  day     date not null,
  kind    text not null check (kind ~ '^(visit|mode:[a-z0-9_]{1,20})$'),
  guests  int  not null default 0,
  members int  not null default 0,
  primary key (day, kind)
);
alter table public.usage enable row level security;
revoke all on public.usage from anon, authenticated;

drop function if exists public.track(text);
create or replace function public.track(what text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare m boolean := auth.uid() is not null;
begin
  if what is null or what !~ '^(visit|mode:[a-z0-9_]{1,20})$' then return; end if;
  insert into public.usage as u (day, kind, guests, members)
  values (current_date, what, case when m then 0 else 1 end, case when m then 1 else 0 end)
  on conflict (day, kind) do update
    set guests = u.guests + excluded.guests, members = u.members + excluded.members;
end;
$$;
revoke all on function public.track(text) from public;
grant execute on function public.track(text) to anon, authenticated;

-- Everything the admin page shows, in one call. Only for admins; everyone else gets an error.
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not an admin' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'now', now(),
    'accounts', (select count(*) from auth.users),
    'confirmed', (select count(*) from auth.users where email_confirmed_at is not null),
    'signups', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d), '[]'::jsonb)
                from (select (created_at at time zone 'utc')::date as d, count(*) as n
                      from auth.users where created_at > now() - interval '120 days' group by 1) s),
    'usage', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'kind', kind, 'guests', guests, 'members', members) order by day), '[]'::jsonb)
              from public.usage where day > current_date - 120),
    'users', (select coalesce(jsonb_agg(u order by u->>'created' desc), '[]'::jsonb) from (
                select jsonb_build_object(
                  'email', a.email, 'created', a.created_at, 'confirmed', a.email_confirmed_at is not null,
                  'last_sign_in', a.last_sign_in_at, 'synced', g.updated_at,
                  'name', p.name, 'avatar', p.avatar, 'known', p.known, 'learning', p.learning,
                  'streak', p.streak, 'week', p.week, 'total', p.total,
                  'tests', g.data->'py'->'tests', 'lessons', g.data->'state'->'sel') as u
                from auth.users a
                left join public.profiles p on p.id = a.id
                left join public.progress g on g.user_id = a.id) x)
  );
end;
$$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
