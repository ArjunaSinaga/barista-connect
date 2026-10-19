# Prompt + File Tema — Generate Mockup kerja.inc (untuk Gemini / Claude)

File ini DIBERIKAN ke Gemini/Claude sebagai input. Tugas mereka: generate GAMBAR mockup saja. Image-to-code dikerjakan di sesi ini.

## 1. Prompt siap copy-paste (satu per halaman)

> Design a desktop web UI mockup, 1440x900, for "kerja.inc" — an Indonesian coffee-shop job platform.
> Theme: warm paper background #f5f1e8, white cards #ffffff with thin warm border rgba(43,33,24,0.14), dark coffee text #2b2118, muted text #6f6252, primary CTA solid dark coffee #3d2c1e with white text, accent caramel #9a6a2f / #b56a2a, success green #1f6b4a, links blue #2b6cb0.
> Typography: Plus Jakarta Sans for UI, Fraunces/Georgia serif for big headlines, Kalam/cursive for small chalk accents only.
> Style: flat, clean, rounded-2xl cards, generous whitespace, subtle grain — NO gradients, NO glassmorphism, NO purple/blue neon, NO AI-slop.
> Content language: Bahasa Indonesia. No lorem ipsum, no fake numbers.
> Page to design: [NAMA_HALAMAN — mis. Login].
> Layout: [DESKRIPSI_SINGKAT — mis. centered card, email + password + role radio Barista/Owner + tombol Masuk + link lupa password/daftar].
> Output: single full-page mockup image only.

Daftar [NAMA_HALAMAN] + [DESKRIPSI_SINGKAT] (30 halaman, batch prioritas):

Batch 1 — Auth + onboarding:
1. Login — kartu tengah: email, password + toggle mata, radio Barista/Owner, tombol Masuk, link lupa password + daftar.
2. Signup — kartu tengah: nama, HP, email, password, konfirmasi, pilih peran, tombol Daftar.
3. Check-email — kartu sukses: ikon amplop, instruksi cek inbox, tombol kirim ulang + cooldown.
4. Forgot-password — kartu tengah: input email + tombol kirim link.
5. Update-password — kartu tengah: password baru + konfirmasi + tombol simpan.
6. Onboarding barista — wizard 3 langkah: foto, nama/WA/kota, skill + pengalaman + CV.
7. Onboarding owner — wizard: nama bisnis + WA opsional, foto, selesai.
8. Onboarding academy — wizard: nama lembaga + bidang + logo.

Batch 2 — Dashboard barista:
9. Dashboard barista — ringkasan stat (Total/Menunggu/Diterima/Selesai) + lamaran terbaru + feed loker.
10. Lamaran saya — daftar lamaran + status pending/viewed/accepted/rejected + detail.
11. Notifikasi — daftar notifikasi + bell + tandai dibaca.
12. Profil barista (edit) — form foto, bio, skill chips, pengalaman, portofolio, CV.

Batch 3 — Konten + detail:
13. Academy — grid kelas + foto + checklist + tombol daftar.
14. Academy detail — hero foto, silabus, instruktur, tombol daftar.
15. Feed — timeline postingan barista + composer + like/komentar.
16. Training — daftar pelatihan + filter + kartu.
17. Reviews — daftar ulasan + rating + filter.
18. Cafes — grid kafe + foto + kota + tombol detail.
19. Cafe detail — galeri foto, info, lowongan aktif, ulasan.
20. Hire — halaman rekrut untuk owner: hero + CTA pasang loker.
21. Trust — 3 pilar verifikasi + badge + FAQ singkat.

Batch 4 — Profil publik + pesan + legal:
22. Barista publik — header foto/nama/rating, tentang, pengalaman, portofolio, ulasan, tombol Chat/Koneksi/Masuk.
23. Talent detail — profil singkat panel kanan.
24. Owner publik — profil bisnis + kafe + lowongan.
25. Messages — inbox percakapan + unread badge.
26. Chat thread — bubble chat + timestamp + input + tombol kirim.
27. Verify — form verifikasi centang biru + upload dokumen.
28. Verify-cert — cek sertifikat + hasil.
29. Privacy — artikel legal rapi.
30. Terms — artikel legal rapi.

## 2. File tema yang dilampirkan ke Gemini/Claude

- `app/globals.css` (token warna: --background #f5f1e8, --foreground #2b2118, cream #ffffff, latte #e8e0cf, espresso #2b2118, caramel #9a6a2f, matcha #1f6b4a, coffee #3d2c1e, link #2b6cb0)
- `app/page.jsx` (referensi landing terbaru: hero + bento + kartu)
- Screenshot live: https://barista-connect.vercel.app (atau URL Vercel terbaru) — untuk nuansa nyata.

## 3. Aturan hasil gambar

- Satu gambar per halaman, 1440x900 desktop + varian mobile 390x844 bila sempat.
- Semua teks Bahasa Indonesia, tajam terbaca.
- Kembalikan sebagai file PNG per halaman dengan nama rute (mis. login.png, onboarding-barista.png).
- JANGAN tulis kode — gambar saja. Kode dikerjakan di sesi kerja.inc ini via skill image-to-code.
