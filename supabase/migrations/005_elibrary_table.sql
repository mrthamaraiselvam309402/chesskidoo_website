-- 005_elibrary_table.sql
-- Creates the elibrary table for the LMS E-Library & Recorded Sessions Hub.
-- Safe to re-run: everything is IF NOT EXISTS / OR REPLACE style.
--
-- HOW TO APPLY: open the Supabase dashboard -> SQL Editor -> paste this file -> Run.

create extension if not exists pgcrypto;

create table if not exists public.elibrary (
  id                  text primary key,
  title               text not null default '',
  description         text not null default '',
  category            text not null default 'openings',
  category_label      text not null default '',
  level               text not null default 'All Levels',
  type                text not null default 'video',
  url                 text not null default '',
  author              text not null default '',
  coach_id            text,
  date                text not null default '',
  duration            text not null default '',
  access_type         text not null default 'all',
  allowed_batch_id    text not null default '',
  allowed_batch_name  text not null default '',
  allowed_student_ids jsonb not null default '[]'::jsonb,
  allowed_student_names jsonb not null default '[]'::jsonb,
  tags                jsonb not null default '[]'::jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists idx_elibrary_category on public.elibrary(category);
create index if not exists idx_elibrary_access on public.elibrary(access_type);
create index if not exists idx_elibrary_coach on public.elibrary(coach_id);

alter table public.elibrary enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'elibrary' and policyname = 'portal_all_access') then
    create policy portal_all_access on public.elibrary
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;

grant select, insert, update, delete on public.elibrary to anon, authenticated;

-- Ask PostgREST to reload its schema cache so the new table is visible immediately.
notify pgrst, 'reload schema';
