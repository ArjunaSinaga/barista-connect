-- Langkah C: fitur sosial ala LinkedIn — C1 endorse skill, C2 koneksi, C3 feed postingan.
-- Idempotent: aman dijalankan ulang (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- CATATAN: jika migrasi portofolio (20261006_barista_portfolio.sql) sudah dijalankan,
-- jalankan file ini manual di Supabase SQL Editor (belum ada runner migrasi otomatis).

-- ============ C1: ENDORSE SKILL ============
create table if not exists public.barista_endorsements (
  id          uuid primary key default gen_random_uuid(),
  barista_id  uuid not null references public.barista_profiles (id) on delete cascade,
  endorser_id uuid not null references public.profiles (id) on delete cascade,
  skill       text not null check (char_length(skill) between 1 and 80),
  created_at  timestamptz not null default now(),
  unique (barista_id, endorser_id, skill),
  check (barista_id != endorser_id)
);
create index if not exists idx_endorsements_barista on public.barista_endorsements (barista_id);

alter table public.barista_endorsements enable row level security;
drop policy if exists "endorse_baca_publik" on public.barista_endorsements;
create policy "endorse_baca_publik" on public.barista_endorsements
  for select using (true);
drop policy if exists "endorse_tulis_sendiri" on public.barista_endorsements;
create policy "endorse_tulis_sendiri" on public.barista_endorsements
  for insert with check (endorser_id = auth.uid());
drop policy if exists "endorse_hapus_sendiri" on public.barista_endorsements;
create policy "endorse_hapus_sendiri" on public.barista_endorsements
  for delete using (endorser_id = auth.uid());

-- ============ C2: KONEKSI BARISTA ============
create table if not exists public.barista_connections (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, addressee_id),
  check (requester_id != addressee_id)
);
create index if not exists idx_connections_requester on public.barista_connections (requester_id);
create index if not exists idx_connections_addressee on public.barista_connections (addressee_id);

alter table public.barista_connections enable row level security;
drop policy if exists "conn_baca_pihak" on public.barista_connections;
create policy "conn_baca_pihak" on public.barista_connections
  for select using (requester_id = auth.uid() or addressee_id = auth.uid());
drop policy if exists "conn_minta_sendiri" on public.barista_connections;
create policy "conn_minta_sendiri" on public.barista_connections
  for insert with check (requester_id = auth.uid());
drop policy if exists "conn_terima_dituju" on public.barista_connections;
create policy "conn_terima_dituju" on public.barista_connections
  for update using (addressee_id = auth.uid());
drop policy if exists "conn_hapus_pihak" on public.barista_connections;
create policy "conn_hapus_pihak" on public.barista_connections
  for delete using (requester_id = auth.uid() or addressee_id = auth.uid());

-- ============ C3: FEED POSTINGAN ============
create table if not exists public.barista_posts (
  id          uuid primary key default gen_random_uuid(),
  barista_id  uuid not null references public.barista_profiles (id) on delete cascade,
  image_url   text,
  caption     text not null default '' check (char_length(caption) <= 500),
  created_at  timestamptz not null default now(),
  check (image_url is not null or char_length(caption) > 0)
);
create index if not exists idx_posts_waktu on public.barista_posts (created_at desc);

alter table public.barista_posts enable row level security;
drop policy if exists "post_baca_publik" on public.barista_posts;
create policy "post_baca_publik" on public.barista_posts
  for select using (true);
drop policy if exists "post_tulis_milik" on public.barista_posts;
create policy "post_tulis_milik" on public.barista_posts
  for insert with check (barista_id = auth.uid());
drop policy if exists "post_hapus_milik" on public.barista_posts;
create policy "post_hapus_milik" on public.barista_posts
  for delete using (barista_id = auth.uid());

-- Bucket foto feed: publik baca, user login tulis di foldernya sendiri, maks 10MB.
insert into storage.buckets (id, name, public)
values ('feed-posts', 'feed-posts', true)
on conflict (id) do update set public = true;

drop policy if exists "feed_baca_publik" on storage.objects;
create policy "feed_baca_publik" on storage.objects
  for select using (bucket_id = 'feed-posts');
drop policy if exists "feed_tulis_sendiri" on storage.objects;
create policy "feed_tulis_sendiri" on storage.objects
  for insert with check (
    bucket_id = 'feed-posts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "feed_hapus_sendiri" on storage.objects;
create policy "feed_hapus_sendiri" on storage.objects
  for delete using (
    bucket_id = 'feed-posts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Batas server 10MB sinkron dengan FEED_POST_MAX_BYTES di lib/constants.js
update storage.buckets set file_size_limit = 10485760 where id = 'feed-posts';
