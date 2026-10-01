<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## CEO Thinking (always-on, `.agents/skills/ceo-thinking/`)

- Selalu aktif tiap sesi OpenCode tanpa dipanggil manual.
- Setiap keputusan/plan penting tutup dengan CEO Gate: Rekomendasi + Kenapa + Next action + Risiko.
- Ambigu berdampak biaya/waktu/arsitektur → tanya dulu. Tolak over-engineering.

## Deploy Rule
## Anti-slop (v3.2.13, `.agents/skills/antislop*/`)

Filter anti AI-slop, bukan style guide. Core selalu berlaku tiap kerja UI/teks/kode:
- Kerja UI → load `antislop` + `antislop-ui` (+ `antislop-layoutmobile` bila responsif, `antislop-human` bila aksesibilitas).
- Kerja teks/copy → load `antislop` + `antislop-copywriting`.
- Rapikan komentar kode → load `antislop-code` (komentar saja, jangan sentuh kode).
- Sebelum ship hasil UI/teks: jalankan Delivery Gate (lapor PASS/FAIL 4 blok).

## Disiplin perubahan (Karpathy, yang belum tercakup skill lain)

- Nyatakan asumsi eksplisit sebelum coding; bila ambigu, tanya dulu — jangan pilih diam-diam.
- Setiap baris diff harus tertelusur ke permintaan user. Jangan "perbaiki" kode/komentar/format sebelahnya; temuan tak terkait cukup disebutkan, jangan dihapus.
- Sisa yatim (import/variabel/fungsi) yang KAMU buat → bersihkan. Kode mati lama → sebutkan saja.
## Router keamanan (BugHunter vs Claude-Red — saya yang memilih)

- Minta audit/review/cari celah di aplikasi MILIK SENDIRI → keluarga BugHunter (`hunt-*`, `bb-*`, `triage-*`, `recon-scope-triage`, `report-writing`): defensif, scope-aware, hasil berupa laporan + bukti.
- Minta eksploitasi/red-team/coba serang/bikin payload/profiling target → keluarga Claude-Red (`offensive-*`, varian `*-red` cth. `offensive-osint-red`).
- Satu-satunya nama kembar: `offensive-osint` (BugHunter: arsenal probe/wordlist) vs `offensive-osint-red` (Claude-Red: metodologi/profiling/tracing) — pilih sesuai kebutuhan di atas.
- Ambigu (tidak jelas defensif vs ofensif, atau target bukan milik user) → TANYA DULU sebelum jalan. Default = defensif.
- Aturan ini permanen sampai user mencabut ("pilih skill manual").

## Auto-trigger skills (`.opencode/skills/`)
- Kerja React/Next.js performa → load `react-best-practices` (70 aturan perf) + `nextjs-developer`.
- Optimasi biaya/Vercel → load `vercel-optimize` (metrics-first, investigasi hanya kandidat berbasis metrik).
- Review UI → load `web-design-guidelines`; review tulisan/docs → load `writing-guidelines` (keduanya fetch remote command.md lalu review).
- Trigger otomatis berdasarkan prompt user, tanpa diminta manual.

## Alur tetap prompt-jelek → hasil (permanen)

- User kasih prompt jelek (ID singkat) → agent analisa isi otak: Tebakan Mau + Asumsi + skor singkat.
- Scan codebase (wajib) → upgrade via `enhance-prompt` 7-layer (ID + English tech terms) → present before/after singkat.
- Eksekusi langsung upgraded prompt pakai skill auto-trigger. Max 1 pertanyaan klarifikasi bila ambigu kritis.
- Tutup dengan CEO Gate. Belum pas → user revisi → ulangi loop (max 3 iterasi, lalu minta contoh konkret).

## Shared Memory (personal use - non-isolated)

Workspace ini dipakai pribadi oleh satu user. Jangan perlakukan tiap chat/page sebagai terisolasi.
- Di AWAL setiap sesi: baca `memory/MEMORY.md` saja (single source).
- Di AKHIR setiap prompt yang selesai dikerjakan: langsung update delta penting ke `memory/MEMORY.md` (keputusan, progress, error, next step). Hanya delta, bukan verbatim. Jangan nunggu akhir sesi besar.
- Jika user bilang "lanjutkan dari sebelah", minta paste ringkasan/error/code bila belum ada di memory, lalu sambung dari situ.