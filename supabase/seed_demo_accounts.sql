-- =============================================================
-- KERJA.INC — reset akun tes + seed 4 akun demo untuk client
-- Cara pakai: buka Supabase Dashboard → SQL Editor → paste
-- seluruh file ini → Run. Satu klik, tanpa password tambahan.
--
-- Akun yang dibuat (password SEMUA: Demo1234!):
--   owner.demo1@kerja.inc    Owner KOMPLIT (kafe + 2 loker + pelamar pending)
--   owner.demo2@kerja.inc    Owner KOSONG (baru daftar, alur onboarding)
--   barista.demo1@kerja.inc  Barista KOMPLIT (profil + lamaran pending & diterima)
--   barista.demo2@kerja.inc  Barista KOSONG (baru daftar, alur onboarding)
-- =============================================================

-- 0. BERSIHKAN akun tes lama ---------------------------------
DO $$
DECLARE
  dead_ids uuid[];
BEGIN
  SELECT array_agg(u.id) INTO dead_ids FROM auth.users u
  WHERE u.email LIKE '%baristacon.test'
     OR u.email LIKE '%recheck.%'
     OR u.email LIKE '%ujicoba%'
     OR u.email LIKE '%uji_coba%'
     OR u.email = 'dummy.barista.tes@gmail.com';

  IF dead_ids IS NOT NULL THEN
    DELETE FROM public.applications WHERE barista_id = ANY(dead_ids);
    DELETE FROM public.applications WHERE job_post_id IN
      (SELECT id FROM public.job_posts WHERE owner_id = ANY(dead_ids));
    DELETE FROM public.saved_jobs WHERE barista_id = ANY(dead_ids);
    DELETE FROM public.saved_baristas WHERE owner_id = ANY(dead_ids) OR barista_id = ANY(dead_ids);
    DELETE FROM public.barista_portfolio WHERE barista_id = ANY(dead_ids);
    DELETE FROM public.team_members WHERE barista_id = ANY(dead_ids) OR owner_id = ANY(dead_ids);
    DELETE FROM public.cafe_ratings WHERE barista_id = ANY(dead_ids) OR owner_id = ANY(dead_ids);
    DELETE FROM public.ratings WHERE barista_id = ANY(dead_ids) OR owner_id = ANY(dead_ids);
    DELETE FROM public.job_posts WHERE owner_id = ANY(dead_ids);
    DELETE FROM public.cafes WHERE owner_id = ANY(dead_ids);
    DELETE FROM public.conversations WHERE owner_id = ANY(dead_ids) OR barista_id = ANY(dead_ids);
    DELETE FROM public.notifications WHERE user_id = ANY(dead_ids);
    DELETE FROM public.org_members WHERE user_id = ANY(dead_ids);
    DELETE FROM public.barista_profiles WHERE id = ANY(dead_ids);
    DELETE FROM public.owners WHERE id = ANY(dead_ids);
    DELETE FROM public.profiles WHERE id = ANY(dead_ids);
    DELETE FROM auth.identities WHERE user_id = ANY(dead_ids);
    DELETE FROM auth.users WHERE id = ANY(dead_ids);
  END IF;
END $$;

-- 1. BUAT 4 user auth (langsung terkonfirmasi, bisa login) ----
DO $$
DECLARE
  inst_id uuid;
  emails text[] := ARRAY[
    'owner.demo1@kerja.inc',
    'owner.demo2@kerja.inc',
    'barista.demo1@kerja.inc',
    'barista.demo2@kerja.inc'
  ];
  roles text[] := ARRAY['owner', 'owner', 'barista', 'barista'];
  e text; i int; uid uuid;
BEGIN
  SELECT id INTO inst_id FROM auth.instances LIMIT 1;

  FOR i IN 1..4 LOOP
    e := emails[i];
    uid := gen_random_uuid();
    INSERT INTO auth.users
      (instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, confirmed_at, created_at, updated_at,
       raw_user_meta_data)
    VALUES
      (inst_id, uid, 'authenticated', 'authenticated', e,
       crypt('Demo1234!', gen_salt('bf')),
       now(), now(), now(), now(),
       jsonb_build_object('full_name', split_part(e, '@', 1)));

    INSERT INTO auth.identities
      (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES
      (gen_random_uuid(), uid,
       jsonb_build_object('sub', uid::text, 'email', e),
       'email', uid, now(), now(), now());

    INSERT INTO public.profiles (id, role, email)
    VALUES (uid, roles[i], e)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email;
  END LOOP;
END $$;

-- 2. OWNER KOMPLIT: Kopi Langit --------------------------------
DO $$
DECLARE
  oid uuid; cid uuid; j1 uuid; j2 uuid; bid uuid;
  pics text[];
BEGIN
  SELECT id INTO oid FROM public.profiles WHERE email = 'owner.demo1@kerja.inc';
  SELECT id INTO bid FROM public.profiles WHERE email = 'barista.demo1@kerja.inc';

  -- foto kafe: pinjam file yang sudah ada di storage (dinamis, aman bila kosong)
  SELECT COALESCE(array_agg(
    'https://swvmtyzzhjncfprhglpi.supabase.co/storage/v1/object/public/cafes/' || o.name
  ), '{}') INTO pics
  FROM (SELECT name FROM storage.objects WHERE bucket_id = 'cafes' LIMIT 3) o;

  INSERT INTO public.owners (id, business_name, business_type, whatsapp, location, avatar_url, is_verified)
  VALUES (oid, 'Kopi Langit', 'coffee_shop', '081200011122', 'Jakarta Selatan', NULL, true)
  ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type, whatsapp = EXCLUDED.whatsapp,
    location = EXCLUDED.location, is_verified = true;

  INSERT INTO public.cafes (owner_id, name, address, location, whatsapp, photo_urls, is_active)
  VALUES (oid, 'Kopi Langit — Kemang', 'Jl. Kemang Raya No. 12, Jakarta Selatan',
          'Jakarta Selatan', '081200011122', pics, true)
  RETURNING id INTO cid;

  INSERT INTO public.job_posts
    (owner_id, cafe_id, title, location, description, salary_text, employment_types, employment_type, is_active)
  VALUES
    (oid, cid, 'Barista — Kopi Langit — Kemang', 'Jakarta Selatan',
     'Menyajikan espresso dan manual brew sesuai standar.' || chr(10) || chr(10) ||
     'Tanggung Jawab:' || chr(10) || '- Menyajikan minuman' || chr(10) || '- Menjaga kebersihan bar' || chr(10) || chr(10) ||
     'Persyaratan:' || chr(10) || '- Pengalaman min 1 tahun' || chr(10) || '- Bisa latte art' || chr(10) || chr(10) ||
     'Jadwal: Senin, Selasa, Rabu, Kamis, Jumat (07:00–15:00). Mulai: 2026-10-15. Buka sampai terisi: Ya',
     'Rp 3.500.000 – Rp 4.500.000/bulan', ARRAY['full_time']::public.employment_type[], 'full_time', true),
    (oid, cid, 'Barista — Kopi Langit — Kemang', 'Jakarta Selatan',
     'Barista paruh waktu untuk shift sore.' || chr(10) || chr(10) ||
     'Tanggung Jawab:' || chr(10) || '- Membantu operasional sore' || chr(10) || chr(10) ||
     'Persyaratan:' || chr(10) || '- Ramah dan komunikatif' || chr(10) || chr(10) ||
     'Jadwal: Sabtu, Minggu (15:00–23:00). Mulai: 2026-10-20',
     'Rp 80.000 – Rp 100.000/shift', ARRAY['part_time']::public.employment_type[], 'part_time', true);

  SELECT id INTO j2 FROM public.job_posts
  WHERE owner_id = oid ORDER BY created_at DESC LIMIT 1 OFFSET 0;
  -- j1 = yang pertama dibuat? ambil eksplisit:
  SELECT id INTO j1 FROM public.job_posts WHERE owner_id = oid ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO j2 FROM public.job_posts WHERE owner_id = oid AND id <> j1 ORDER BY created_at DESC LIMIT 1;

  -- barista demo1 melamar: 1 pending (alurnya belum selesai, bisa diproses owner),
  -- 1 accepted (contoh hasil akhir). Trigger otomatis bikin notifikasi.
  INSERT INTO public.barista_profiles
    (id, full_name, age, location_place, profile_picture_url, years_of_experience,
     experience_months, skills, whatsapp, open_to_types, cover_letter, certificates,
     ideas_plus, is_open_to_work)
  VALUES
    (bid, 'Bima Demo', 23, 'Jakarta Selatan', NULL, 2, 26,
     ARRAY['espresso', 'latte_art', 'customer_service'], '081233344455',
     ARRAY['full_time']::public.employment_type[],
     'Saya barista 2 tahun, bisa latte art dan terbiasa shift pagi.',
     ARRAY['SCA Barista Foundation 2024'],
     'Suka dunia kopi dan hospitality, cepat belajar dan disiplin.',
     true)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name,
    skills = EXCLUDED.skills, whatsapp = EXCLUDED.whatsapp;

  INSERT INTO public.applications
    (job_post_id, barista_id, message, cover_letter, employment_types, status)
  VALUES
    (j1, bid, 'Halo, saya berpengalaman 2 tahun di espresso bar.',
     'Saya cocok karena terbiasa dengan volume tinggi dan latte art.', ARRAY['full_time']::public.employment_type[], 'pending'),
    (j2, bid, 'Siap shift sore dan akhir pekan.',
     'Pengalaman paruh waktu 1 tahun di kafe.', ARRAY['part_time']::public.employment_type[], 'accepted');
END $$;

-- 3. VERIFIKASI (opsional dibaca, tidak mengubah data) --------
SELECT email AS akun_demo, 'Demo1234!' AS password
FROM auth.users
WHERE email LIKE '%demo%@kerja.inc'
ORDER BY email;
