# Prompt Profesional — Minta Gemini / Claude / ChatGPT Membuat Skill Audit untuk OpenCode

> Cara pakai: salin seluruh isi bagian `PROMPT SIAP SALIN` ke Gemini, Claude, atau ChatGPT. Hasil dari mereka berupa satu file `SKILL.md` yang langsung bisa dipasang sebagai skill audit di OpenCode.

---

## PROMPT SIAP SALIN (satu prompt untuk ketiga AI)

```text
Konteks: Saya memakai OpenCode sebagai AI coding agent. Struktur skill OpenCode adalah satu folder berisi satu file SKILL.md dengan format standar:

---
name: <nama-skill-kebab-case>
description: <satu kalimat: apa yang dilakukan + kapan dipakai + kata pemicu>
---

# <Judul>

Isi: kapan aktif, checklist langkah, perintah verifikasi, kriteria selesai, batasan.

Tugas: buatkan skill audit profesional bernama "audit-utama" untuk proyek fullstack Next.js App Router + Supabase (Postgres + Auth + Storage) + deploy Vercel.

Skill harus mencakup minimal 7 area ini:
1. Keamanan kode dan konfigurasi (secret bocor, OWASP Top 10, RLS Supabase, auth route, headers keamanan).
2. Kualitas kode (duplikasi, dead code, error handling, validasi input di trust boundary).
3. Database (migrasi aman, index, N+1 query, RLS per tabel).
4. Performa frontend (Core Web Vitals, next/image, bundle, ISR/caching).
5. Aksesibilitas dan UX (WCAG 2.1 AA: kontras, keyboard, aria-label, target sentuh 44px, responsif mobile).
6. Operasional (lint, typecheck, build, smoke test endpoint, panduan rollback).
7. Kepatuhan output (format temuan: lokasi file:baris, tingkat Keparahan, bukti, perbaikan minimal, status verifikasi).

Aturan penulisan skill:
- Bahasa Indonesia, ringkas, tanpa jargon tanpa penjelasan.
- Setiap temuan wajib format: Lokasi | Keparahan (Kritis/Tinggi/Sedang/Rendah) | Bukti | Perbaikan minimal | Cara verifikasi.
- Dilarang memberi saran generik tanpa lokasi file konkret.
- Dilarang mengubah kode di luar lingkup temuan.
- Sertakan checklist "Gate Rilis": lint PASS, typecheck PASS, build PASS, smoke test 3 endpoint PASS. Tanpa semua PASS, status = BELUM RILIS.
- Sertakan bagian "Batasan": apa yang TIDAK diaudit skill ini.
- Total isi SKILL.md maksimal 150 baris agar hemat konteks.

Output yang saya mau:
1. Satu blok kode SKILL.md lengkap siap simpan (frontmatter name: audit-utama + description + isi).
2. Satu contoh laporan audit fiktif 5 baris memakai format temuan di atas.
3. Satu daftar 5 perintah verifikasi (lint, typecheck, build, smoke) yang bisa saya jalankan di Windows PowerShell 5.1.

Jangan tanya balik. Langsung hasilkan ketiga output di atas.
```

---

## Catatan adaptasi per AI (opsional, bila hasil kurang pas)

| AI | Tambahan kalimat bila perlu |
|----|------------------------------|
| Gemini | Tambahkan di akhir: `Gunakan format heading Markdown yang rapi dan tabel untuk temuan.` |
| Claude | Tambahkan di akhir: `Ikuti gaya penulisan Anthropic: presisi, tanpa superlatif, setiap klaim ada bukti file:baris.` |
| ChatGPT | Tambahkan di akhir: `Bagi jawaban menjadi 3 bagian bernomor sesuai output yang diminta, tanpa pengantar panjang.` |

## Cara pasang hasil ke OpenCode

1. Buat folder `.opencode/skills/audit-utama/`.
2. Simpan blok `SKILL.md` dari AI sebagai `.opencode/skills/audit-utama/SKILL.md`.
3. Restart OpenCode agar skill terdeteksi.
4. Uji dengan perintah: `pakai audit-utama untuk audit proyek ini`.
5. Bila ingin jadi skill audit utama, tulis di `AGENTS.md`: audit wajib memakai skill `audit-utama` sebelum klaim selesai.

## Skor enhancement (skill enhance-prompt)

| Dimensi | Sebelum | Sesudah |
|---------|---------|---------|
| Clarity | 2/5 | 5/5 |
| Specificity | 1/5 | 5/5 |
| Context | 2/5 | 5/5 |
| Structure | 2/5 | 5/5 |
| Constraints | 1/5 | 5/5 |
| Output Format | 1/5 | 5/5 |
| Verification | 1/5 | 4/5 |
