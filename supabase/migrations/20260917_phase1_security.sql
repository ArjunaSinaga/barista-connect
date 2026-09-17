-- Phase 1: kunci keamanan + Gratis vs Bayar (centang biru).
-- ATURAN MAIN: STEP A bisa jalan kapan aja (aman). STEP B jalan BARENG
-- dengan code aplikasi di commit ini (query publik sudah pindah ke views).
--
-- Model akses:
--   GRATIS (anon / login biasa) : etalase saja via views (tanpa WA/CV/alamat).
--   BAYAR (is_verified=true)    : kontak terbuka — owner verified baca penuh
--                                 profil barista, barista verified baca penuh
--                                 profil owner. Plus hubungan lamaran (owner
--                                 lihat kontak pelamarnya sendiri) tetap jalan.

-- ============ STEP A (aman, tanpa ubah aplikasi) ============
-- Owner hanya bisa edit/hapus lowongan MILIKNYA (dulu: semua owner bisa
-- edit/hapus loker owner lain).
drop policy if exists jobs_update_own on public.job_posts;
create policy jobs_update_own on public.job_posts
  for update using (owner_id = (select auth.uid()));

drop policy if exists jobs_delete_own on public.job_posts;
create policy jobs_delete_own on public.job_posts
  for delete using (owner_id = (select auth.uid()));

-- ============ STEP B (bareng code aplikasi) ============
-- 1. Etalase publik: views tanpa kolom sensitif.
create or replace view public.owners_public as
  select id, business_name, avatar_url, location, is_verified, created_at
  from public.owners;

create or replace view public.baristas_public as
  select id, full_name, profile_picture_url, skills, location_place,
    years_of_experience, open_to_types, is_open_to_work, ideas_plus,
    cover_letter, is_verified, created_at
  from public.barista_profiles;

grant select on public.owners_public to anon, authenticated;
grant select on public.baristas_public to anon, authenticated;

-- 2. Cabut baca langsung tabel oleh anon; yang login baca seperlunya.
revoke select on public.owners from anon;
revoke select on public.barista_profiles from anon;

drop policy if exists owners_public_read on public.owners;
create policy owners_read_own on public.owners
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists barista_public_read on public.barista_profiles;
create policy barista_read_own on public.barista_profiles
  for select to authenticated using (id = (select auth.uid()));

-- 3. BAYAR: kontak terbuka untuk yang centang biru.
create policy barista_read_by_verified_owner on public.barista_profiles
  for select to authenticated using (
    exists (
      select 1 from public.owners o
      where o.id = (select auth.uid()) and o.is_verified = true
    )
  );

create policy owners_read_by_verified_barista on public.owners
  for select to authenticated using (
    exists (
      select 1 from public.barista_profiles b
      where b.id = (select auth.uid()) and b.is_verified = true
    )
  );

-- 4. GRATIS tapi relevan: owner lihat penuh pelamar yang melamar ke lokernya.
create policy barista_read_by_job_owner on public.barista_profiles
  for select to authenticated using (
    exists (
      select 1 from public.applications a
      join public.job_posts j on j.id = a.job_post_id
      where j.owner_id = (select auth.uid())
        and a.barista_id = barista_profiles.id
    )
  );

-- 5. Baca CV diperketat: cocokkan akhir URL persis (dulu LIKE longgar,
--    karakter % dan _ di nama file bisa bocor ke CV orang lain).
drop policy if exists cvs_owner_read on storage.objects;
create policy cvs_owner_read on storage.objects
  for select to authenticated using (
    bucket_id = 'cvs'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.job_posts j
        join public.applications a on a.job_post_id = j.id
        where j.owner_id = (select auth.uid())
          and a.cv_url is not null
          and right(a.cv_url, length(name)) = name
      )
    )
  );
