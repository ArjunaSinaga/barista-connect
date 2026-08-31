# ☕ BaristaConnect

Platform pencarian kerja khusus **barista & casual worker** — pemilik coffee shop memasang lowongan, barista melengkapi profil sekali lalu melamar. Termasuk chat real-time berbantu AI.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (Postgres + Auth + Storage + Realtime) · Google Gemini · Netlify

## Menjalankan lokal

1. Ikuti [SETUP.md](./SETUP.md) untuk membuat project Supabase gratis, key Gemini, dan mengisi `.env.local`.
2. Lalu:

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Struktur singkat

```
app/                  semua route (App Router)
  api/ai/*            server functions Gemini (auto-responder & copilot)
  dashboard/barista   feed lowongan + lamaran saya + profil
  dashboard/owner     kelola lowongan + pelamar + data bisnis
  find-baristas       direktori barista (khusus owner)
  jobs                feed & detail lowongan publik
  messages            inbox + chat realtime
components/
  cards               JobCard · BaristaCard
  jobs                JobFeed · ApplyButton · JobPostForm
  search              BaristaDirectory (filter & sort)
  chat                ChatWindow realtime + StartChatButton
  ui                  primitif (Button, Field, Sheet, Toggle, ...)
lib/                  klien supabase, konstanta, validasi zod, helper AI
supabase/schema.sql   SELURUH skema DB + RLS + storage — jalankan di SQL Editor
proxy.js              guard sesi & peran (Next.js 16 proxy)
```

## Fitur utama

- Autentikasi dengan pilihan peran saat daftar: **Barista** atau **Pemilik Usaha**
- Onboarding barista 4 langkah — **foto profil wajib** (dikompres otomatis), skill dinamis, sertifikat, status *buka kerja*
- Lowongan sederhana: judul, lokasi, tipe (full-time/part-time/kasual), deskripsi; bisa dijeda/dihapus
- Lamaran 1-klik + pesan opsional; pemilik menerima/menolak pelamar
- Direktori barista untuk owner: filter skill/lokasi/pengalaman, urutkan buka-kerja dulu
- Chat real-time antar pengguna dengan **AI assistant Gemini**: menjawab FAQ rutin otomatis (ditandai ✨) dan menyarankan balasan
- Publik: siapa pun dapat melihat lowongan tanpa login

## Deployment

Panduan lengkap deploy gratis ke Netlify ada di [SETUP.md](./SETUP.md).
