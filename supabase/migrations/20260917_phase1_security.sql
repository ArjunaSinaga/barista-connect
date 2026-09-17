-- Phase 1: kunci keamanan + Gratis vs Bayar (centang biru). APPLIED 2026-09-17.
-- Model akses:
--   GRATIS (anon / login biasa) : etalase via views (tanpa WA/CV/alamat).
--   BAYAR (is_verified=true)    : kontak terbuka antar peran terverifikasi.
--   Owner tetap baca penuh pelamar ke lokernya sendiri.

-- 1. Owner hanya bisa edit/hapus lowongan MILIKNYA.
drop policy if exists jobs_update_own on public.job_posts;
create policy jobs_update_own on public.job_posts
  for update using (owner_id = (select auth.uid()));

drop policy if exists jobs_delete_own on public.job_posts;
create policy jobs_delete_own on public.job_posts
  for delete using (owner_id = (select auth.uid()));

-- 2. Policy loker dipecah: anon tanpa sentuh tabel owners (subquery owners
--    bikin anon 401 setelah revoke). Owner login lihat aktif + miliknya.
drop policy if exists jobs_public_read_active on public.job_posts;
drop policy if exists jobs_public_read_anon on public.job_posts;
create policy jobs_public_read_anon on public.job_posts
  for select to anon using (is_active = true);
drop policy if exists jobs_read_owner on public.job_posts;
create policy jobs_read_owner on public.job_posts
  for select to authenticated using (
    is_active = true
    or owner_id = (select auth.uid())
  );

-- 3. Etalase publik: views tanpa kolom sensitif.
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

-- 4. Cabut baca langsung tabel oleh anon; yang login baca data sendiri.
revoke select on public.owners from anon;
revoke select on public.barista_profiles from anon;

drop policy if exists owners_public_read on public.owners;
drop policy if exists owners_read_own on public.owners;
create policy owners_read_own on public.owners
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists barista_public_read on public.barista_profiles;
drop policy if exists barista_read_own on public.barista_profiles;
create policy barista_read_own on public.barista_profiles
  for select to authenticated using (id = (select auth.uid()));

-- 5. BAYAR: kontak terbuka untuk yang centang biru.
drop policy if exists barista_read_by_verified_owner on public.barista_profiles;
create policy barista_read_by_verified_owner on public.barista_profiles
  for select to authenticated using (
    exists (
      select 1 from public.owners o
      where o.id = (select auth.uid()) and o.is_verified = true
    )
  );

drop policy if exists owners_read_by_verified_barista on public.owners;
create policy owners_read_by_verified_barista on public.owners
  for select to authenticated using (
    exists (
      select 1 from public.barista_profiles b
      where b.id = (select auth.uid()) and b.is_verified = true
    )
  );

-- 6. GRATIS tapi relevan: owner lihat penuh pelamar yang melamar ke lokernya.
drop policy if exists barista_read_by_job_owner on public.barista_profiles;
create policy barista_read_by_job_owner on public.barista_profiles
  for select to authenticated using (
    exists (
      select 1 from public.applications a
      join public.job_posts j on j.id = a.job_post_id
      where j.owner_id = (select auth.uid())
        and a.barista_id = barista_profiles.id
    )
  );

-- 7. Baca CV diperketat: cocokkan akhir URL persis (dulu LIKE longgar,
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
