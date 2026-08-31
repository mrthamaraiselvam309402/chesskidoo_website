-- 006_homework_tables.sql
-- Creates the homework_assignments and homework_submissions tables.
-- Safe to re-run: everything is IF NOT EXISTS / OR REPLACE style.
--
-- HOW TO APPLY: open the Supabase dashboard -> SQL Editor -> paste this file -> Run.

create extension if not exists pgcrypto;

create table if not exists public.homework_assignments (
  id              text primary key,
  title           text not null default '',
  description     text not null default '',
  due_date        text,
  status          text not null default 'active',
  target_type     text not null default 'all',
  student_id      text,
  batch_id        text,
  questions_files jsonb not null default '[]'::jsonb,
  attachment_urls jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.homework_submissions (
  id              text primary key,
  assignment_id   text not null references public.homework_assignments(id) on delete cascade,
  student_id      text not null,
  submission_text text not null default '',
  submission_url  text not null default '',
  file_urls       jsonb not null default '[]'::jsonb,
  status          text not null default 'not_submitted',
  revision_count  integer not null default 0,
  feedback        text not null default '',
  score           numeric,
  submitted_at    timestamptz,
  reviewed_at     timestamptz,
  updated_at      timestamptz not null default now()
);

create index if not exists idx_homework_assignments_target on public.homework_assignments(target_type, batch_id, student_id);
create index if not exists idx_homework_assignments_status on public.homework_assignments(status);
create index if not exists idx_homework_submissions_assignment on public.homework_submissions(assignment_id);
create index if not exists idx_homework_submissions_student on public.homework_submissions(student_id);
create index if not exists idx_homework_submissions_status on public.homework_submissions(status);

alter table public.homework_assignments enable row level security;
alter table public.homework_submissions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'homework_assignments' and policyname = 'portal_all_access') then
    create policy portal_all_access on public.homework_assignments
      for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'homework_submissions' and policyname = 'portal_all_access') then
    create policy portal_all_access on public.homework_submissions
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;

grant select, insert, update, delete on public.homework_assignments to anon, authenticated;
grant select, insert, update, delete on public.homework_submissions to anon, authenticated;

notify pgrst, 'reload schema';
