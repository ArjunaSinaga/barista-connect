-- ============================================================
-- BaristaConnect - Demo data (OPTIONAL)
-- Creates 3 demo owner accounts + 8 demo baristas + job posts.
-- Demo password for ALL seeded accounts: password123
-- Safe to re-run: wipes previous demo users first.
-- Run AFTER schema.sql
-- ============================================================

-- Remove previous demo data (cascades to profiles/owners/etc.)
delete from auth.users where email like '%@bc-demo.id';

-- ---------- Owners ----------
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated', 'owner.senja@bc-demo.id',
  crypt('password123', gen_random_uuid()::text), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '', '', '', '',
  now(), now()
),
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-222222222222',
  'authenticated', 'authenticated', 'owner.brewok@bc-demo.id',
  crypt('password123', gen_random_uuid()::text), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '', '', '', '',
  now(), now()
);

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select u.id, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@bc-demo.id'
on conflict do nothing;

insert into public.profiles (id, role, email) values
  ('11111111-1111-4111-8111-111111111111', 'owner', 'owner.senja@bc-demo.id'),
  ('11111111-1111-4111-8111-222222222222', 'owner', 'owner.brewok@bc-demo.id');

insert into public.owners (id, business_name, location) values
  ('11111111-1111-4111-8111-111111111111', 'Kopi Senja', 'Jakarta Selatan'),
  ('11111111-1111-4111-8111-222222222222', 'Brewok Coffee', 'Bandung');

-- ---------- Baristas ----------
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  ('bbbbbbbb-0000-4000-8000-' || lpad((n)::text, 12, '0'))::uuid,
  'authenticated', 'authenticated', 'barista' || n || '@bc-demo.id',
  crypt('password123', gen_random_uuid()::text), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '', '', '', '',
  now(), now()
from generate_series(1, 8) as g(n);

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select u.id, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.email like 'barista%@bc-demo.id'
on conflict do nothing;

insert into public.profiles (id, role, email)
select id, 'barista', email from auth.users where email like 'barista%@bc-demo.id';

insert into public.barista_profiles
  (id, full_name, age, location_place, profile_picture_url,
   years_of_experience, skills, certificates, ideas_plus, is_open_to_work)
values
  (('bbbbbbbb-0000-4000-8000-' || lpad('1', 12, '0'))::uuid,
   'Rizky Pratama', 24, 'Jakarta Selatan',
   'https://randomuser.me/api/portraits/men/32.jpg',
   3, '{Latte Art,Espresso Bar,Customer Service}',
   '{"Barista Level 2 - SCA","Workshop Manual Brew V60"}',
   'Ide signature drink: es kopi gula aren dengan cold foam kayu manis.', true),
  (('bbbbbbbb-0000-4000-8000-' || lpad('2', 12, '0'))::uuid,
   'Dinda Ayu Lestari', 22, 'Jakarta Pusat',
   'https://randomuser.me/api/portraits/women/44.jpg',
   2, '{Latte Art,Tea & Non-Coffee,Cashier POS}',
   '{}',
   'Suka interaksi dengan pelanggan dan bisa buat latte art tulip & heart.', true),
  (('bbbbbbbb-0000-4000-8000-' || lpad('3', 12, '0'))::uuid,
   'Bagas Nugraha', 27, 'Bandung',
   'https://randomuser.me/api/portraits/men/75.jpg',
   5, '{Roasting,Cupping,Manual Brew,Espresso Bar}',
   '{"Foundation Roasting - SCA"}',
   'Paham profil roasting untuk biji Gayo dan Toraja.', true),
  (('bbbbbbbb-0000-4000-8000-' || lpad('4', 12, '0'))::uuid,
   'Sari Wulandari', 23, 'Bandung',
   'https://randomuser.me/api/portraits/women/65.jpg',
   1, '{Bar Back,Customer Service}',
   '{}',
   '', true),
  (('bbbbbbbb-0000-4000-8000-' || lpad('5', 12, '0'))::uuid,
   'Fajar Ramadhan', 25, 'Yogyakarta',
   'https://randomuser.me/api/portraits/men/12.jpg',
   4, '{Manual Brew,Latte Art,Cold Brew}',
   '{"Brewing Intermediate - SCA"}',
   'Spesialis brew batch cold brew untuk event & bazar.', false),
  (('bbbbbbbb-0000-4000-8000-' || lpad('6', 12, '0'))::uuid,
   'Nadia Safira', 21, 'Jakarta Selatan',
   'https://randomuser.me/api/portraits/women/21.jpg',
   1, '{Cashier POS,Customer Service}',
   '{}',
   '', true),
  (('bbbbbbbb-0000-4000-8000-' || lpad('7', 12, '0'))::uuid,
   'Dimas Anggara', 29, 'Semarang',
   'https://randomuser.me/api/portraits/men/56.jpg',
   6, '{Espresso Bar,Roasting,Latte Art,Cupping}',
   '{"Barista Professional - SCA"}',
   'Terbiasa handle rush hour 200+ cup/hari di cafe ramai.', true),
  (('bbbbbbbb-0000-4000-8000-' || lpad('8', 12, '0'))::uuid,
   'Putri Maharani', 26, 'Bandung',
   'https://randomuser.me/api/portraits/women/33.jpg',
   3, '{Latte Art,Tea & Non-Coffee,Manual Brew}',
   '{"Latte Art Champion Regional Jabar 2025"}',
   'Bisa latte art swan & phoenix untuk konten sosmed cafe.', true);

-- ---------- Job posts ----------
insert into public.job_posts (owner_id, title, description, location, employment_type) values
  ('11111111-1111-4111-8111-111111111111',
   'Barista Shift Pagi',
   'Kami mencari barista untuk shift pagi (06.00-14.00). Tugas: menyediakan kopi berbasis espresso, menjaga kebersihan bar, melayani pelanggan dengan ramah. Pengalaman min. 1 tahun di coffee shop.',
   'Jakarta Selatan', 'part_time'),
  ('11111111-1111-4111-8111-111111111111',
   'Barista Full-Time Weekend Warrior',
   'Butuh barista full-time yang siap handle weekend rush. Fasilitas: seragam, makan shift, tips dibagi rata. Latte art jadi nilai plus besar.',
   'Jakarta Selatan', 'full_time'),
  ('11111111-1111-4111-8111-222222222222',
   'Barista Kasual Harian',
   'Dibutuhkan barista kasual harian untuk cover shift dan event catering. Jam fleksibel, bayar harian langsung mingguan. Cocok untuk mahasiswa.',
   'Bandung', 'casual');
