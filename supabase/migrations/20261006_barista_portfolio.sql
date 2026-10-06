-- Langkah A: portofolio barista (etalase karya, maks 9 per barista, tampil publik)
-- Dijalankan via Supabase Dashboard > SQL Editor (atau supabase db push)

create table if not exists public.barista_portfolio (
  id          uuid primary key default gen_random_uuid(),
  barista_id  uuid not null references public.barista_profiles (id) on delete cascade,
  image_url   text not null,
  caption     text not null default '' check (char_length(caption) <= 140),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_portfolio_barista on public.barista_portfolio (barista_id, sort_order, created_at);

alter table public.barista_portfolio enable row level security;

-- Etalase publik: siapa pun boleh lihat (profil publik + view hiring owner)
drop policy if exists portfolio_public_read on public.barista_portfolio;
create policy portfolio_public_read on public.barista_portfolio
  for select using (true);

-- Tulis hanya milik sendiri
drop policy if exists portfolio_insert_own on public.barista_portfolio;
create policy portfolio_insert_own on public.barista_portfolio
  for insert to authenticated
  with check (barista_id = (select auth.uid()));

drop policy if exists portfolio_update_own on public.barista_portfolio;
create policy portfolio_update_own on public.barista_portfolio
  for update to authenticated
  using (barista_id = (select auth.uid()))
  with check (barista_id = (select auth.uid()));

drop policy if exists portfolio_delete_own on public.barista_portfolio;
create policy portfolio_delete_own on public.barista_portfolio
  for delete to authenticated
  using (barista_id = (select auth.uid()));

-- Storage: bucket portfolio (public read, tulis lingkup folder user, gambar maks 10MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists portfolio_public_read on storage.objects;
create policy portfolio_public_read on storage.objects
  for select using (bucket_id = 'portfolio');

drop policy if exists portfolio_user_insert on storage.objects;
create policy portfolio_user_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists portfolio_user_update on storage.objects;
create policy portfolio_user_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists portfolio_user_delete on storage.objects;
create policy portfolio_user_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
