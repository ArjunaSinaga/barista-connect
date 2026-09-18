-- Waitlists: email capture untuk tombol waitlist (training courses + smarter-ops).
-- Applied live via MCP 2026-09-18. Anon boleh insert, tak boleh baca.
create table if not exists public.waitlists (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic text not null default 'training',
  created_at timestamptz not null default now(),
  unique (email, topic)
);
alter table public.waitlists enable row level security;
drop policy if exists "waitlists_anon_insert" on public.waitlists;
create policy "waitlists_anon_insert" on public.waitlists
  for insert to anon, authenticated with check (true);
revoke all on public.waitlists from anon, authenticated;
grant insert on public.waitlists to anon, authenticated;
