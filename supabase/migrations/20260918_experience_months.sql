-- Pengalaman tahun+bulan: kolom experience_months (total bulan) + backfill + view.
-- Kolom lama years_of_experience tetap ditulis (= floor(months/12)) untuk kompatibilitas.
-- View: kolom baru di APPEND di akhir (OR REPLACE tak boleh ubah kolom lama).
-- Grants view tidak berubah (select anon/authenticated tetap dari Phase 1).
-- Applied live via MCP 2026-09-18.
alter table public.barista_profiles add column if not exists experience_months int not null default 0 check (experience_months >= 0 and experience_months <= 1200);
update public.barista_profiles set experience_months = years_of_experience * 12 where experience_months = 0 and years_of_experience > 0;
create or replace view public.baristas_public as
  select id, full_name, profile_picture_url, skills, location_place,
    years_of_experience, open_to_types, is_open_to_work, ideas_plus,
    cover_letter, is_verified, created_at, experience_months
  from public.barista_profiles;
