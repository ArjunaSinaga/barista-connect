-- Phase 3: catatan tabel yang tadinya cuma ada di server (hasil introspeksi
-- live 2026-09-17). Idempotent: aman dijalankan di DB kosong maupun live.
-- Urutan: cafes -> team_members -> ratings/cafe_ratings -> saved_* -> payments.

create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  name text not null,
  location text not null default '',
  address text not null default '',
  lat double precision,
  lng double precision,
  whatsapp text not null default '',
  photo_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  barista_id uuid not null references public.barista_profiles(id) on delete cascade,
  job_post_id uuid references public.job_posts(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  job_title text not null default '',
  status text not null default 'active',
  hired_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cafe_id uuid references public.cafes(id) on delete set null
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  job_post_id uuid references public.job_posts(id) on delete cascade,
  owner_id uuid not null references public.owners(id) on delete cascade,
  barista_id uuid not null references public.barista_profiles(id) on delete cascade,
  stars integer not null check (stars between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  team_member_id uuid references public.team_members(id) on delete cascade
);

create table if not exists public.cafe_ratings (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  job_post_id uuid references public.job_posts(id) on delete set null,
  owner_id uuid not null references public.owners(id) on delete cascade,
  barista_id uuid not null references public.barista_profiles(id) on delete cascade,
  stars integer not null check (stars between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  barista_id uuid not null references public.barista_profiles(id) on delete cascade,
  job_post_id uuid not null references public.job_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (barista_id, job_post_id)
);

create table if not exists public.saved_baristas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  barista_id uuid not null references public.barista_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (owner_id, barista_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product text not null,
  amount integer not null,
  status text not null default 'pending',
  provider text not null default 'midtrans',
  provider_order_id text,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.cafes enable row level security;
alter table public.team_members enable row level security;
alter table public.ratings enable row level security;
alter table public.cafe_ratings enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.saved_baristas enable row level security;
alter table public.payments enable row level security;

-- cafes: publik baca, owner tulis miliknya
drop policy if exists cafes_public_read on public.cafes;
create policy cafes_public_read on public.cafes for select using (true);
drop policy if exists cafes_owner_write on public.cafes;
create policy cafes_owner_write on public.cafes for insert with check (owner_id = (select auth.uid()));
drop policy if exists cafes_owner_update on public.cafes;
create policy cafes_owner_update on public.cafes for update
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists cafes_owner_delete on public.cafes;
create policy cafes_owner_delete on public.cafes for delete using (owner_id = (select auth.uid()));

-- team: owner full atas timnya, barista baca barisnya sendiri
drop policy if exists team_owner_all on public.team_members;
create policy team_owner_all on public.team_members for all
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists team_barista_read on public.team_members;
create policy team_barista_read on public.team_members for select using (barista_id = (select auth.uid()));

-- ratings (owner->barista): publik baca, owner tulis/Ubah miliknya (seminggu sekali), hapus miliknya
drop policy if exists ratings_public_read on public.ratings;
create policy ratings_public_read on public.ratings for select using (true);
drop policy if exists ratings_insert_owner on public.ratings;
create policy ratings_insert_owner on public.ratings for insert with check (
  owner_id = (select auth.uid()) and exists (
    select 1 from team_members t
    where t.id = ratings.team_member_id and t.owner_id = (select auth.uid())));
drop policy if exists ratings_update_owner on public.ratings;
create policy ratings_update_owner on public.ratings for update
  using (owner_id = (select auth.uid()) and updated_at <= (now() - interval '7 days'))
  with check (owner_id = (select auth.uid()));
drop policy if exists ratings_delete_owner on public.ratings;
create policy ratings_delete_owner on public.ratings for delete using (owner_id = (select auth.uid()));

-- cafe_ratings (barista->cafe): cermin ratings
drop policy if exists cafe_ratings_public_read on public.cafe_ratings;
create policy cafe_ratings_public_read on public.cafe_ratings for select using (true);
drop policy if exists cafe_ratings_insert_barista on public.cafe_ratings;
create policy cafe_ratings_insert_barista on public.cafe_ratings for insert with check (
  barista_id = (select auth.uid()) and exists (
    select 1 from team_members t
    where t.id = cafe_ratings.team_member_id and t.barista_id = (select auth.uid()) and t.status = 'terminated'));
drop policy if exists cafe_ratings_update_barista on public.cafe_ratings;
create policy cafe_ratings_update_barista on public.cafe_ratings for update
  using (barista_id = (select auth.uid()) and updated_at <= (now() - interval '7 days'))
  with check (barista_id = (select auth.uid()));
drop policy if exists cafe_ratings_delete_barista on public.cafe_ratings;
create policy cafe_ratings_delete_barista on public.cafe_ratings for delete using (barista_id = (select auth.uid()));

-- saved_jobs / saved_baristas: milik sendiri saja
drop policy if exists saved_select_own on public.saved_jobs;
create policy saved_select_own on public.saved_jobs for select using (barista_id = (select auth.uid()));
drop policy if exists saved_insert_own on public.saved_jobs;
create policy saved_insert_own on public.saved_jobs for insert with check (barista_id = (select auth.uid()));
drop policy if exists saved_delete_own on public.saved_jobs;
create policy saved_delete_own on public.saved_jobs for delete using (barista_id = (select auth.uid()));

drop policy if exists saved_baristas_select_own on public.saved_baristas;
create policy saved_baristas_select_own on public.saved_baristas for select using (owner_id = (select auth.uid()));
drop policy if exists saved_baristas_insert_own on public.saved_baristas;
create policy saved_baristas_insert_own on public.saved_baristas for insert with check (owner_id = (select auth.uid()));
drop policy if exists saved_baristas_delete_own on public.saved_baristas;
create policy saved_baristas_delete_own on public.saved_baristas for delete using (owner_id = (select auth.uid()));

-- payments: user baca/tulis miliknya (update lunas via webhook service-role)
drop policy if exists payments_owner_read on public.payments;
create policy payments_owner_read on public.payments for select using (auth.uid() = user_id);
drop policy if exists payments_owner_insert on public.payments;
create policy payments_owner_insert on public.payments for insert with check (auth.uid() = user_id);
