# Progress BaristaConnect

## 2026-09-17 — Analisa + full plan
- Verifikasi klaim carousel IG: semua repo real (context-mode 23.3k, codeburn ~10.7k, planning 27k, adhd 47.3k, ponytail 141k). Angka hemat = klaim author.
- Pasang paket hemat token: plugins opencode.json (context-mode, opencode-planning-with-files, ponytail) + skills lokal + AGENTS.md Token Economy + codeburn v0.9.24. Verified post-restart OK.
- Audit paralel 2 agent (DB + frontend) → temuan di findings.md.
- Tanya-jawab user → tujuan (cari duit, logika normal), alur signup ideal, cek token OK.
- Full plan ditulis di task_plan.md (5 phase). Eksekusi belum mulai.

## 2026-09-17 — Phase 1 (in progress)
- Baca schema.sql:175-274 + policy cvs + pemakaian query app + format cv_url (public URL, path uid/timestamp-nama).
- Tulis `supabase/migrations/20260917_phase1_security.sql` (REVIEW ONLY): fix jobs_update/delete kepemilikan baris, views publik tanpa WA/CV/alamat, cvs exact-suffix match, policy owner-lihat-kontak-pelamar. Belum apply.
- User: terserah saya + bedakan Gratis vs Bayar. Cek sistem verify: is_verified via Midtrans webhook ada.
- SQL final 2-step (A aman, B bareng code) + policies centang biru (verified owner↔barista full read).
- Helper lib/publicProfiles.js + 8 query pindah ke views. ESLint 0 errors. Belum apply ke live, belum push.

## 2026-09-17 — Phase 1 apply (blocked on Vercel)
- MCP Supabase connected (screenshot user). Apply phase1_security_additive OK; fix kolom view (profile_picture_url, tanpa bio — sesuai live schema).
- Push e1fe5d6 ke origin main OK. Views verified (37 barista).
- Bukti bocor pre-STEP-B: anon baca owners.whatsapp 200. Post-STEP-B: 401 blocked, views 200.
- Efek samping: jobs_public_read_active subquery owners → anon 401 → pecah jadi anon/authenticated policies.
- Live masih code lama (jobs 0, detail 404) → ROLLBACK STEP B (migration phase1_rollback_anon_temp), site normal (200).
- SISA: user cek Vercel dashboard kenapa e1fe5d6 belum deploy; lalu re-apply STEP B.

## 2026-09-17 — Phase 1 COMPLETE
- Root cause deploy Error: publicProfiles.js import server.js (next/headers) ke client component → split publicProfilesClient.js → build OK → push 439e3ce → deploy hijau (detail 200).
- Re-apply STEP B (revoke anon + pecah policy loker). Verifikasi: 5/5 PASS (WA/CV 401, etalase+loker 200), live /jobs 21 loker tampil.

## 2026-09-17 — Phase 2 (in progress)
- Root cause: auth.users 53/53 confirmed = autoconfirm ON, signup langsung sesi → onboarding tanpa email.
- Code: check-email page (+resend), verified page (tombol adaptif sesi), confirm catat peran bila profil kosong, signup redirect ke check-email. Push 1e9b328, live 200.
- SISA: tes Gmail baru end-to-end + 4 akun demo (butuh email real user).

## 2026-09-17 — Phase 2 COMPLETE
- Tes user LOLOS penuh: check-email → email Gmail masuk → klik link → verified → onboarding barista. Confirm email ON terbukti di live.
- Sisa nyusul: 4 akun demo (butuh email real user).

## 2026-09-17 — Phase 3 COMPLETE
- Link nyasar: kartu cafe jadi div, link Edit + Lihat tim terpisah.
- Rating: confirm() sebelum timpa (mingguan), toast sukses/gagal sudah ada.
- Form: lib/focusFirstError.js + 5 form (bisnis, cafe, profil, lamar, pasang loker).
- 7 tabel + FK + policies didokumentasi dari introspeksi live ke phase3_tables.sql.
- Push 3526603, live 200.

## 2026-09-17 — Phase 4 COMPLETE
- clean() semua varian thinking + budget 600/350 + potong batas kalimat; reasoning hidden nvidia/bytez.
- Konteks AI, inbox, thread via views; label [AI]/butuh kamu; suggest retry 1x + tombol Coba lagi.
- Push b6467c0, live reviews OK. SISA: tes suggest (user lagi login).

## 2026-09-17 — Phase 5 COMPLETE (semua phase done)
- Bookmark sudah jalan (no-op). Picsum dibuang → fallback jujur. Midtrans code OK, butuh key user.
- seed bcrypt + schema initplan. Push 37e6a92, live 200.
- SISA USER: 4 akun demo, tes suggest AI, Midtrans (daftar + key + webhook).

## 2026-09-18 — Phase 6 COMPLETE (payment off → v2)
- User: hapus payment, ganti info v2, badge tetap. Nol transaksi live = aman.
- /verify info v2, 3 endpoint 410, VerifyCheckout dihapus. Push d28122e, live 200.

## 2026-09-18 — Phase 7 Sesi A COMPLETE
- Login: radio peran dibuang, peran dari DB. Talent: try/catch + tombol coba lagi + hint anon.
- Dashboard owner: banner gagal load. Barista: pesan koneksi + nama kafe via views + CTA cari loker.
- Chat: tombol hapus selalu tampil di HP. Push a42bb20, live login verified.

## 2026-09-18 — Hero CTA peran (extra)
- BottomCtaStrip barista → /signup?role=barista; signup terima role barista/owner. Push 9a6f0f2. Tes user LOLOS.

## 2026-09-18 — Demo sempurna A + purge Netlify (ec01c20)
- Navbar ID: Loker/Talenta/Ulasan/Pelatihan/Untuk Owner/Pasang Loker. Urutan Post>Masuk>Daftar sudah benar, header tanpa search (PDF #5/#7 DONE).
- Netlify dibuang paksa total: README, SETUP (jadi Vercel), toast login, client.js, mobile chat prompt, .gitignore, eslint ignore, wiki. app/+lib/ nol jejak. Sisa cuma riwayat di findings/task_plan + skill pihak ketiga.
- Lint 0 error, push ec01c20.
- SISA B→E: auth, jobs, talenta/ulasan, training/landing.

## 2026-09-18 — Phase 7 Sesi B COMPLETE
- Onboarding barista 5→3 langkah (foto gabung data diri, toggle di dokumen), stepper tampil di HP, tombol "Lanjut (x dari 3)".
- Training: badge Contoh, rating/harga palsu dibuang, 1 tombol waitlist, placeholder ID.
- Link Phase-2: tidak bisa diklik + badge "Segera hadir". Push 45fd0a5, live training verified.
