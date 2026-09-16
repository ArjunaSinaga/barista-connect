# Workflow — Barista Connect → Setara Mockup (G1–G4)

> Cara pakai di Notion: Notion → New Page → `...` → Import → Markdown → pilih file ini.
> Setiap fase jadi 1 block; checklist `- [ ]` otomatis jadi to-do di Notion.
> Status legend: ⬜ Belum mulai · 🟡 Jalan · 🟢 Selesai · 🔴 Blocked

## 📌 Status Fase (update tiap push)

| Fase | Scope | Status | PR/Commit | Deploy Vercel | Catatan |
|------|-------|--------|-----------|---------------|---------|
| F0 | Fondasi: Navbar baru, FooterStrip, FilterPills, StatCard | 🟢 Selesai | — | — | StatCard+FilterPills dipakai di Talenta/Active/Pelamar/Hero |
| F1 | Navbar + footer global aktif | 🟢 Selesai | — | — | Navbar baru (search/lokasi/bell/avatar/Post a Job), strip CTA global, /reviews real, /training ringan (F5-ringan ditarik maju agar nav tidak mati) |
| F2 | Landing → G2 (polish) | 🟢 Selesai | — | — | Rebrand kerja.inc→BaristaConnect, ekosistem jadi link real, Academy→/training, SmarterOps tanpa angka palsu, Reviews→/reviews |
| F3a | Jobs board shell 3 kolom + panel detail | 🟢 Selesai | — | — | Board G1: profil+nav, hero+filter+list, panel ?job= + tabs real (tanpa Save, tanpa Requirements/Benefits palsu) |
| F3b | Save jobs + sort + applied badge | 🟢 Selesai | — | — | Tabel saved_jobs + RLS, Save di list+panel, filter ?saved=1, sort recent/oldest/A–Z |
| F3c | Kolom kiri profil barista + hapus JobFeed lama | 🟢 Selesai | — | — | Dashboard barista → CTA ke board; JobFeed.jsx dihapus |
| F4 | Owner dashboard → G3 | 🟢 Selesai | — | — | + Saved Candidates beneran (tabel+hati+view), Training aktif, foto kanan ikut data |
| F5 | Training → G4 | 🟢 Selesai (ringan) | — | — | Katalog seed + filter server + waitlist; upgrade data real bila tabel ada |
| F6 | Bersih-bersih UI lama + bahasa + a11y | 🟢 Selesai | — | — | Compact/Grid mati dihapus, /jobs full EN, footer bar dihapus, brand BaristaConnect |
| F7 | Verifikasi akhir 5 rute + screenshot | 🟢 Selesai | — | — | Lint 0 error, build exit 0, 7/7 rute HTTP 200 lokal |

## ✅ Checklist per Fase

### F0 — Fondasi
- [ ] Komponen `Navbar` baru (search global, lokasi picker, bell, avatar dropdown, Post a Job)
- [ ] Komponen `FooterStrip` (foto biji kopi + CTA Barista/Owner + tombol X)
- [ ] Komponen `FilterPills`, `StatCard` (delta + chevron + tabular-nums)
- [ ] Verifikasi: `npx eslint` 0 error, `npm run build` exit 0

### F1 — Navbar + Footer Global
- [ ] Pasang Navbar + FooterStrip di layout
- [ ] Hapus link disabled (Reviews/Training aktif saat halaman ada)
- [ ] Mobile: search jadi ikon, bottom nav tetap jalan
- [ ] Verifikasi: build ijo + cek 3 rute

### F2 — Landing → G2
- [ ] Headline + stat real (tanpa angka palsu 2,500+)
- [ ] Foto hero real cafe (fallback Unsplash)
- [ ] Rapikan kolom kanan (Academy + SmarterOps)
- [ ] Verifikasi: screenshot vs G2

### F3a — Jobs Board Shell (G1)
- [ ] Layout 3 kolom: profil | list + hero | panel detail
- [ ] Klik job → panel kanan update, URL `?job=` (shareable)
- [ ] Tabs: Overview / Requirements / Benefits / Reviews (data real)
- [ ] Verifikasi: build + cek `/jobs?job=<id>`

### F3b — Save + Sort
- [ ] Migrasi tabel `saved_jobs` + RLS
- [ ] Tombol Save/bookmark + badge Applied
- [ ] Sort: relevan / terbaru / gaji
- [ ] Verifikasi: test simpan + build

### F3c — Kolom Kiri + Hapus Legacy
- [ ] Kartu profil barista (progress %, Saved/Applied/Alerts nav)
- [ ] Hapus `JobFeed` 1-kolom lama
- [ ] `/dashboard/barista` jadi redirect/ringkas
- [ ] Verifikasi: tidak ada import mati (`eslint` + `tsc`)

### F4 — Owner Dashboard → G3 (lanjutan)
- [x] Hero fidelity + stats delta + Top Candidates full (live `35b73e4`)
- [x] Strip carousel + panah di Active/Pelamar (live `35b73e4`)
- [ ] Foto (bukan inisial) di kolom kanan Recommended/Certified
- [ ] Nav Saved Candidates + Training di sidebar
- [ ] Verifikasi: screenshot vs G3

### F5 — Training → G4
- [ ] ⏳ Keputusan: ringan-statis ATAU full + tabel (`courses, enrollments, sessions, certifications`)
- [ ] Hero + filter + 4 stat
- [ ] Recommended Courses + Learning Paths
- [ ] Right rail: Team Progress + Upcoming Sessions + Certified Members
- [ ] Verifikasi: screenshot vs G4

### F6 — Bersih-bersih
- [ ] Hapus UI lama yang bertentangan (daftar file di PR)
- [ ] Bahasa per rute: `/jobs` EN, sisanya ID
- [ ] Empty-state jujur di semua list (tanpa angka palsu)
- [ ] A11y pass: keyboard, fokus, kontras overlay

### F7 — Verifikasi Akhir
- [ ] `npx eslint` 0 error
- [ ] `npm run build` exit 0
- [ ] 5 rute HTTP 200: `/`, `/jobs`, `/jobs?job=`, `/dashboard/owner`, `/training`
- [ ] Screenshot 5 rute vs G1–G4, bandingkan
- [ ] Push `main` → Vercel live ✅

## 🧾 Decision Log (butuh jawaban owner)

| # | Pertanyaan | Status | Keputusan |
|---|-----------|--------|-----------|
| 1 | Training ringan-statis atau full + 4 tabel? | 🟢 Decided | **Ringan-statis dulu** |
| 2 | Jobs pakai Rp + lokasi Indonesia (bukan S$)? | 🟢 Decided | **Rp, tanpa dolar** |
| 3 | Saved = tabel `saved_jobs` beneran atau bookmark lokal dulu? | 🟢 Decided | **Beneran di F3** |
| 4 | Urutan eksekusi: berurutan F1→F5 atau lompat ke F3 dulu? | 🟢 Decided | **Berurutan** |

## 📝 Changelog Deploy

| Tanggal | Commit | Isi | Link Vercel |
|---------|--------|-----|-------------|
| 2026-09-16 | `35b73e4` | Top candidates strip + panah (Active/Pelamar) | barista-connect.vercel.app/dashboard/owner |
| 2026-09-16 | `356a7cd` | Hero fidelity, stats delta, kandidat full | barista-connect.vercel.app/dashboard/owner |
| 2026-09-16 | `1362097` | Navbar mockup, strip global, StatCard/FilterPills, /reviews, /training ringan | barista-connect.vercel.app |
| 2026-09-16 | (baru) | Strip hilang saat login, snooze 2x semua X, sidebar ramping + X Pro, kolom tengah tanpa scroll | barista-connect.vercel.app/dashboard/owner |
