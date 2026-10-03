# Queue Lamaran→Notifikasi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setiap lamaran baru dan setiap perubahan status lamaran otomatis muncul sebagai notifikasi in-app untuk pihak yang berkepentingan.

**Architecture:** Postgres trigger AFTER INSERT/UPDATE on `applications` menulis row ke `notifications` (tabel = queue, tanpa worker persisten — aman di Vercel serverless). UI bell polling baca `notifications`. Endpoint `/api/hooks/lamaran` disiapkan untuk webhook n8n/WA tahap berikut (kode saja, tanpa aktifkan dashboard).

**Tech Stack:** Supabase Postgres (plpgsql trigger), Next.js App Router route handler, existing Supabase client.

**Spec:** `docs/SYSTEM_DESIGN.md` §4 item 4 (P1: Queue lamaran→notifikasi, n8n webhook dari Postgres).

## Global Constraints

- Tanpa worker persisten (pg-boss DITOLAK 2026-09-21 — tak jalan di Vercel serverless).
- Trigger hanya INSERT ke `notifications`, tanpa network call (no `pg_net`, no http).
- RLS `notifications`: user hanya baca/update miliknya (`user_id = auth.uid()`).
- Bahasa UI: Indonesia.
- Verifikasi tiap task: `npx next lint <file>` + `npm run build -- --webpack`.

## Review Focus

- Lamaran ke loker yang `cafe_id` NULL (job_posts personal): notif tetap ke `job_posts.owner_id`, jangan gagal.
- UPDATE status yang nilainya sama (touch tanpa perubahan): jangan spam notif duplikat.
- `barista_id`/`owner_id` NULL: skip diam-diam, jangan error.
- Bell polling jangan hantam DB tiap detik saat tab idle (interval ≥30s + pause saat hidden).
- Body notifikasi jangan bocorkan PII pihak lain (nama pelamar ke owner OK; WA/telepon jangan).

---

### Task 1: Trigger + migrasi notifications queue

**Files:**
- Create: `supabase/migrations/20261003_applications_notify.sql`
- Test: SQL manual via dashboard / `supabase_execute_sql`

**Interfaces:**
- Consumes: `applications(id, job_post_id, barista_id, status)`, `job_posts(id, owner_id)`, `notifications(user_id, title, body)`.
- Produces: trigger `trg_applications_notify` → row notifikasi; dieksekusi Task 2 (baca) dan Task 3 (webhook payload).

- [ ] **Step 1: Tulis migrasi trigger**

Fungsi `notify_application_change() RETURNS trigger`: jika `TG_OP='INSERT'` → INSERT notif ke owner (`SELECT owner_id FROM job_posts WHERE id=NEW.job_post_id`), title `'Lamaran baru'`, body `'Lamaran baru masuk untuk loker #' || NEW.job_post_id`. Jika `TG_OP='UPDATE'` dan `OLD.status IS DISTINCT FROM NEW.status` → INSERT notif ke `NEW.barista_id`, title `'Status lamaran: ' || NEW.status`, body secukupnya. Guard NULL: `IF target IS NULL THEN RETURN NEW; END IF`. Trigger AFTER INSERT OR UPDATE ON applications FOR EACH ROW. Tambah `CREATE POLICY` baca/update own di `notifications` bila belum ada.

- [ ] **Step 2: Apply migrasi ke Supabase live**

Run: `supabase_execute_sql` per statement (atau apply_migration). Expected: `trg_applications_notify` ada di `pg_trigger`.

- [ ] **Step 3: Uji manual dua arah**

INSERT lamaran dummy → cek 1 row notif milik owner; UPDATE status → cek 1 row notif milik barista; UPDATE tanpa ganti status → cek TIDAK ada row baru. Hapus data dummy. Expected: 2 row tercipta lalu terhapus, tanpa error.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261003_applications_notify.sql
git commit -m "P1 queue notif: trigger applications INSERT/UPDATE ke notifications"
```

### Task 2: Bell notifikasi di UI

**Files:**
- Create: `components/NotificationBell.jsx` (client island: fetch `/api/notifications`, polling 30s, pause saat `document.hidden`, badge unread, tandai-baca)
- Create: `app/api/notifications/route.js` (GET list milik session, PATCH tandai is_read)
- Modify: `components/Navbar.jsx` (pasang bell — cek nama file aktual dulu)

**Interfaces:**
- Consumes: trigger Task 1 (rows `notifications`).
- Produces: bell bebas-spam; dipakai semua peran.

- [ ] **Step 1: Tulis route GET+PATCH dengan auth session**

GET: session → `SELECT id,title,body,is_read,created_at WHERE user_id=session ORDER BY created_at DESC LIMIT 20`. PATCH: body `{ids}` → `UPDATE is_read=true WHERE user_id=session AND id=ANY(ids)`. Tanpa session → 401.

- [ ] **Step 2: Tulis NotificationBell + pasang di Navbar**

Fetch saat mount + `setInterval(30000)`, skip saat `document.hidden`. Klik bell → PATCH ids unread → badge nol. Tanpa teks Inggris.

- [ ] **Step 3: Verifikasi lint+build**

Run: `npx next lint components/NotificationBell.jsx app/api/notifications/route.js` Expected: no errors. Run: `npm run build -- --webpack` Expected: sukses, route `/api/notifications` terdaftar.

- [ ] **Step 4: Commit**

```bash
git add components/NotificationBell.jsx app/api/notifications/route.js components/Navbar.jsx
git commit -m "P1 queue notif: bell + API notifications milik session"
```

### Task 3: Hook endpoint untuk n8n/WA (kode saja, nonaktif)

**Files:**
- Create: `app/api/hooks/lamaran/route.js` (POST: verifikasi `x-hook-secret` vs `NOTIFY_HOOK_SECRET` env, log payload, return 200; tanpa kirim WA sungguhan)

**Interfaces:**
- Consumes: event lamaran (dipanggil Database Webhook Supabase, diaktifkan manual nanti).
- Produces: endpoint siap disambung n8n; eksekutor P1-berikut tinggal aktifkan webhook di dashboard + isi secret.

- [ ] **Step 1: Tulis route hook + secret check**

POST: `req.headers.get('x-hook-secret') !== process.env.NOTIFY_HOOK_SECRET` → 401. Body `{type, application_id}` → `console.log` + return `{ok:true}`. Tanpa secret di kode.

- [ ] **Step 2: Verifikasi lint+build, commit**

Run: lint + build seperti Task 2. Commit: `P1 queue notif: hook endpoint lamaran (nonaktif, tunggu webhook dashboard)`.

- [ ] **Step 3: Catat langkah manual user (DOKUMEN SAJA, jangan eksekusi)**

Di plan ini: aktifkan Database Webhooks di dashboard Supabase (event applications INSERT/UPDATE → URL `/api/hooks/lamaran` + header secret), set `NOTIFY_HOOK_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` di Vercel env. INI LANGKAH MANUAL — user yang pegang dashboard, AI tidak.
