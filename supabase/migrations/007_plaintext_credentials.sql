-- 007_plaintext_credentials.sql
-- Adds plaintext_password column to credentials table so the admin portal
-- can display actual login passwords. The existing password column keeps
-- storing the SHA-256 hash for auth bypass verification.
--
-- HOW TO APPLY: open the Supabase dashboard -> SQL Editor -> paste this file -> Run.

alter table public.credentials
  add column if not exists plaintext_password text;

create index if not exists idx_credentials_plaintext
  on public.credentials(plaintext_password);
