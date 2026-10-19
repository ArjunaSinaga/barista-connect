# Prompt Profesional v2 — Minta Gemini / Claude / ChatGPT Membuat Skill Audit Visual untuk OpenCode + kerja.inc

> Cara pakai: salin seluruh isi bagian `PROMPT SIAP SALIN v2` ke Gemini, lalu ke Claude, lalu ke ChatGPT (satu per satu, sesi baru tiap AI). Bandingkan ketiga hasil, pilih yang terbaik, tempel ke saya untuk dipasang sebagai skill `audit-utama` v2 di OpenCode.
>
> Bedanya dari v1: v2 ini jauh lebih spesifik — target proyeknya jelas (kerja.inc: Next.js App Router + Supabase + Vercel), output-nya wajib ada visual (diagram Mermaid, blueprint arsitektur, peta database, matriks risiko), format temuan lebih rinci, ada contoh laporan penuh, dan ada aturan anti-halusinasi yang ketat.

---

## PROMPT SIAP SALIN v2 (satu prompt untuk ketiga AI)

```text
KONTEKS SAYA (baca dulu sebelum menulis):

Saya memakai OpenCode sebagai AI coding agent. Struktur skill OpenCode adalah satu folder berisi satu file SKILL.md dengan format standar persis seperti ini:

---
name: <nama-skill-kebab-case>
description: <satu kalimat: apa yang dilakukan + kapan dipakai + kata pemicu>
---

# <Judul>

Isi: kapan skill aktif, checklist langkah kerja berurutan, perintah verifikasi yang bisa dijalankan, kriteria selesai yang terukur, dan batasan yang tegas.

Proyek yang akan diaudit bernama "kerja.inc" — platform lowongan kerja kopi (kafe memposting loker, barista melamar, chat, rating dua arah, notifikasi). Stack-nya: Next.js App Router (React Server Components + Client Components) + Supabase (Postgres dengan Row Level Security, Auth, Storage bucket avatars/cvs/cafes/portfolio/feed-posts) + deploy Vercel + Tailwind CSS. OS saya Windows dengan PowerShell 5.1. Repo punya file AGENTS.md (aturan kerja agen), package.json (skrip lint/build), folder app/ (routes), components/, lib/, supabase/ (migrasi SQL).

TUGAS: buatkan skill audit profesional bernama "audit-utama" untuk proyek kerja.inc tersebut.

SKILL WAJIB mencakup 8 area audit ini (satu seksi per area, tiap seksi berisi: apa yang diperiksa, daftar checklist konkret, dan cara verifikasi):

1. KEAMANAN KODE DAN KONFIGURASI — cari secret/API key/token yang tertanam di kode atau file konfigurasi; variabel NEXT_PUBLIC_* yang mengekspos kredensial; 10 risiko OWASP Top 10 yang relevan (injection, broken access control, auth failure, misconfig, komponen rentan, kebocoran data); auth route, callback OAuth, reset password, webhook (verifikasi signature); security headers, cookie HttpOnly/Secure/SameSite, manajemen sesi; rate limiting; validasi redirect; XSS, SSRF, pembatasan upload file. Aturan: secret hanya boleh diakses di server, jangan pernah tampilkan nilainya di laporan.

2. SUPABASE DAN DATABASE — Row Level Security (RLS) tiap tabel yang bisa diakses via API (policy SELECT/INSERT/UPDATE/DELETE + uji akses lintas pengguna); policy Storage dan bucket publik; service_role tidak boleh sampai ke browser; migrasi aman (constraint, foreign key, transaksi, risiko hilang data); query N+1, pemanggilan berulang, pagination tidak aman; index sesuai pola query (filter/join/EXPLAIN). Dilarang menjalankan migrasi atau mengubah data produksi saat audit.

3. KUALITAS KODE — duplikasi logika, dead code, tipe any yang tidak perlu, penanganan error tidak konsisten, error yang menelan exception diam-diam, error yang membocorkan stack trace/secret/query sensitif; validasi input di trust boundary (route handler, Server Action, webhook, query database) — validasi browser saja tidak cukup; otorisasi dicek di server sebelum baca/ubah resource milik user (menyembunyikan tombol di UI bukan kontrol akses).

4. PERFORMA FRONTEND DAN SERVER — Core Web Vitals (LCP/INP/CLS) berbasis pengukuran nyata (jangan klaim skor tanpa data); next/image (dimensi, format, lazy); ukuran bundle dan JS tidak perlu; waterfall request, render ulang berlebih, Client Component yang seharusnya Server Component; caching/ISR/revalidasi (data privat dilarang di-cache lintas user); pagination dan query mahal.

5. AKSESIBILITAS DAN UX — WCAG 2.1 AA (kontras, struktur heading, label form, fokus, navigasi keyboard, pesan error); kontrol interaktif wajib punya accessible name; utamakan HTML semantik sebelum ARIA; target sentuh ±44px sebagai sasaran UX; mobile (overflow horizontal, zoom), kondisi loading/kosong/gagal. Bedakan hasil inspeksi kode vs pengujian manual/otomatis.

6. OPERASIONAL DAN DEPLOYMENT — identifikasi skrip lint/typecheck/test/build dari package.json, jalankan yang tersedia, catat exit code dan ringkasan; konfigurasi environment Vercel (tanpa mengungkap nilai secret); smoke test 3 endpoint nyata yang ada di repo (halaman utama, endpoint kesehatan/API, route auth atau route penting); rollback (deployment sebelumnya, pemulihan config, prosedur database). Dilarang deploy/rollback tanpa instruksi eksplisit.

7. VISUAL LAPORAN (wajib, ini pembeda v2) — setiap laporan audit yang dihasilkan skill harus memuat minimal:
   a. Satu diagram Mermaid flowchart alur yang diaudit (misal alur login → dashboard → aksi sensitif, atau alur lamaran → terima → chat → rating), dengan node temuan kritis ditandai.
   b. Satu diagram Mermaid entity-relationship sederhana untuk tabel database yang disentuh audit (tabel + kolom kunci + relasi), maksimal 10 tabel agar hemat konteks.
   c. Satu "blueprint arsitektur" berupa daftar terstruktur: route → komponen → sumber data → policy RLS yang melindungi, untuk setiap alur yang diaudit.
   d. Satu tabel matriks risiko (baris = temuan, kolom = Dampak × Kemungkinan × Keparahan akhir).
   e. Aturan gambar: diagram ditulis sebagai kode Mermaid (bukan gambar biner) agar bisa di-render di GitHub/Notion; bila butuh screenshot bukti uji, sebutkan nama file + apa yang harus terlihat, tanpa melampirkan data sensitif.

8. KEPATUHAN OUTPUT DAN ANTI-HALUSINASI — setiap temuan WAJIB format: Lokasi (path/file.ext:baris) | Keparahan (Kritis/Tinggi/Sedang/Rendah + alasan dampak) | Bukti (kode/perilaku yang benar-benar ditemukan) | Perbaikan minimal (perubahan terkecil di akar masalah) | Cara verifikasi (pengujian yang bisa diulang) | Status verifikasi (TERBUKTI / BELUM TERVERIFIKASI / DIPERBAIKI DAN DIUJI). Dilarang mengarang lokasi file, hasil pengujian, atau kerentanan. Jika bukti kurang, tulis BELUM TERVERIFIKASI. Dilarang saran generik tanpa lokasi konkret. Jangan menetapkan keparahan hanya dari nama fungsi.

ATURAN PENULISAN SKILL:
- Bahasa Indonesia, ringkas, tanpa jargon tanpa penjelasan.
- Audit bersifat read-only secara default: dilarang mengubah kode/config/database/deployment tanpa perintah eksplisit.
- Jangan mencetak nilai secret, token, cookie, atau data pribadi dalam laporan.
- Sertakan checklist "Gate Rilis" 6 item (lint, typecheck, build, 3 smoke test) — semua wajib PASS agar status LULUS GATE TEKNIS, selebihnya BELUM RILIS. Endpoint yang tidak ada/tidak terjangkau dilarang dianggap PASS.
- Sertakan bagian "Batasan": pentest menyeluruh, eksploitasi aktif, audit infra cloud, audit hukum/privasi formal, audit mendalam semua dependency, load test skala besar, dan verifikasi seluruh config produksi TIDAK dicakup.
- Total isi SKILL.md maksimal 250 baris agar hemat konteks (naik dari 150 karena tambahan seksi visual, tapi tetap ringkas — tiap baris harus membawa informasi, tanpa basa-basi).

OUTPUT YANG SAYA MAU (4 output, berurutan):
1. Satu blok kode SKILL.md lengkap siap simpan (frontmatter name: audit-utama + description + isi 8 area + gate rilis + batasan).
2. Satu contoh diagram Mermaid lengkap (flowchart alur + ER diagram mini, 15–30 baris kode Mermaid) untuk proyek lowongan kerja generik sebagai bukti seksi visual bisa dipakai.
3. Satu contoh laporan audit fiktif memakai format temuan di atas: 1 temuan Kritis + 1 Sedang + 1 tabel matriks risiko 3 baris + status Gate Rilis.
4. Satu daftar 6 perintah verifikasi (lint, typecheck, build, 3 smoke test curl) yang bisa dijalankan di Windows PowerShell 5.1.

Jangan tanya balik. Langsung hasilkan keempat output di atas, berurutan dan diberi nomor.
```

---

## Cara menilai hasil ketiga AI (pilih pemenang)

| Kriteria | Bobot | Yang dicari |
|---|---|---|
| Kelengkapan 8 area | 30% | Semua area ada, checklist konkret, bukan generik |
| Seksi visual bisa dipakai | 25% | Kode Mermaid valid, ER diagram masuk akal, blueprint jelas |
| Anti-halusinasi | 20% | Ada aturan TERBUKTI/BELUM TERVERIFIKASI, larang karang lokasi |
| Keringkasan | 15% | ≤250 baris, tiap baris informatif |
| Contoh laporan | 10% | Format temuan dipakai benar, matriks risiko terisi |

Tempel hasil pemenang ke saya — saya pasang sebagai `.opencode/skills/audit-utama/SKILL.md` v2.
