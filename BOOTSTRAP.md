# BOOTSTRAP.md — Session Startup Protocol

Dibaca di awal setiap sesi. Patuhi tanpa menunggu diminta.

## A. Urutan Startup
1. Baca `AGENTS.md` dan `memory/MEMORY.md` (maksimal konteks aktif 3 baris).
2. Cek lingkungan: `Get-Location; node -v; npm -v; git status --short`
3. Periksa skrip di `package.json` (lint, build, test, typecheck). Catat yang tidak ada.
4. Ringkasan pembuka maksimal 3 baris: konteks proyek + status memori + saran langkah berikut.
5. Jika `memory/MEMORY.md` belum ada, buat dari template lalu lanjutkan.

## B. Perilaku Premium
- Proaktif: laporkan bug jelas di file yang dikerjakan; perbaiki hanya dalam lingkup.
- Antisipatif: maksimal 2 langkah lanjutan, tanpa mengerjakan sendiri.
- Mandiri: keputusan kecil ambil sendiri dengan asumsi dinyatakan. Tanya hanya untuk risiko tinggi.
- Format laporan sama setiap kali: Ringkasan, Perubahan, Bukti, Risiko.

## C. Verifikasi Eksekusi Nyata
- Setiap perubahan kode: `npm run lint; npx tsc --noEmit` (cek `$LASTEXITCODE`).
- Perubahan routing/config/middleware/dependensi: tambah `npm run build`.
- Perubahan UI/API: uji runtime `npm run dev` + cek halaman/endpoint.
- Tampilkan potongan output nyata, bukan karangan. Jika tak bisa jalan, tulis BELUM TERVERIFIKASI + alasan.

## D. Aturan Klaim Selesai
- [ ] Intent terpenuhi, diff kecil, lint+typecheck lolos (bukti output)
- [ ] Build lolos bila relevan, runtime diuji bila relevan
- [ ] Tanpa file/dependensi/abstraksi di luar lingkup
- [ ] `memory/MEMORY.md` diperbarui bila ada keputusan/pelajaran baru
- Jika ada poin gagal: status "sebagian selesai" + sisa dijelaskan.

## E. Hemat Konteks
- Cari dulu (grep/glob/Select-String), baru baca potongan file.
- Jangan baca `node_modules`, `.next`, `.git`, `package-lock.json`.
- Jangan tempel ulang kode panjang; rujuk `path:baris`.
- Tugas >3 langkah: pakai todo, tandai satu per satu.

## F. PowerShell 5.1
- Rangkai dengan `;`, bukan `&&`/`||`. Cek `$LASTEXITCODE` tiap perintah native.
- `Select-String -Path ".\app\*" -Pattern "kata" -Recurse` untuk cari teks.
- `Get-Content .\log.txt -Tail 50` untuk ekor log. Kutip path berspasi.
- Jangan cetak nilai secret. `$env:NAMA = "nilai"` untuk set sesi.

## G. Keselamatan
- Minta persetujuan sebelum: `npm install`, `git commit/push`, migrasi DB, deploy vercel, hapus file.
- Dilarang: `push --force`, `reset --hard`, `Remove-Item -Recurse -Force` path luas, `supabase db reset`, `rm -rf`, tulis secret ke output/memori.
- Jangan buka/cetak isi `.env*`; cukup cek nama variabel.
