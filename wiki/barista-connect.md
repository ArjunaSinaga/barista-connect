# Barista Connect — Platform Rekrutmen Kedai Kopi

> **Tagline:** Kedai Kopi Go-Digital. Tanpa Ribet.
> **Stack:** Next.js 16 (App Router) + React 19 + Tailwind v4 + Supabase (Postgres, Auth, Realtime, Storage) + AI Gateway
> **Status:** MVP live, dark-theme, fully Server Components
> **Founder:** Arjuna Rahman Maulana Sinaga — [[biodata]]

## Ringkasan

Barista Connect menghubungkan pemilik kedai kopi (owner) dan barista dalam satu alur tanpa spreadsheet/DM hilang: profil → lowongan → lamaran 1-klik → chat realtime + AI → hired/onboarding → rating & riwayat.

Lihat detail:
- [[barista-connect-workflow]] — alur pengguna & bisnis end-to-end
- [[barista-connect-architecture]] — arsitektur teknis, DB, RLS, edge
- [[barista-connect-api]] — contract API & rute app

## 5 Langkah Visual (sesuai `/workflow`)

| Step | Judul | Aktor | Deskripsi |
|------|-------|-------|-----------|
| 01 | Daftar & Profil | barista + owner | Barista buat profil skill/pengalaman, owner buat shop profile |
| 02 | Pasang / Cari Lowongan | owner → barista | Owner posting job, barista filter lokasi & jadwal |
| 03 | Apply 1-Klik | barista → owner | Lamaran masuk dashboard owner, notifikasi realtime |
| 04 | Chat & Interview | both | Chat in-app, jadwal interview, reminder |
| 05 | Hired & Onboarding | owner → barista | Status hired, shift pertama, rating & riwayat kerja |

> Halaman visual: `app/workflow/page.jsx` — Server Component, grid 5 kolom, CTA ke `/jobs`.

## Persona Cepat

- **Barista:** cari kerja part-time/full-time, butuh chat cepat, profil portable.
- **Owner:** butuh barista siap kerja, posting cepat, filter pelamar, chat tanpa pindah WA.
- **Sistem/AI:** jawab FAQ rutin, eskalasi ke manusia jika tidak tahu.

## KPI MVP

- Time-to-first-application < 2 menit (1-klik)
- Balasan chat < 30 detik (AI auto-respond)
- Zero DM hilang (semua di Supabase Realtime)
