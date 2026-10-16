# MONKAS (Monjali Kasir) — Dokumen Tunggal: Desain + Plan Tahap 1 PWA — 2026-10-14

> App kasir STANDALONE, tidak ada hubungan dengan kerja.inc. Satu lokasi besar menampung banyak tenant (contoh cafe A/B/C). 1 QRIS bersama untuk semua tenant. Uang parkir di database/sistem (satu rekening manager), akhir bulan diserahkan cash ke tiap tenant sesuai catatan DB. Perangkat paralel: tiap tenant di perangkat/layar masing-masing + login/PIN sendiri, buka bersamaan (bukan shift bergantian). Eksekusi DITAHAN — full planning dulu.

## Bagian 1 — Desain (semua keputusan disetujui user)

1. Model kasir: paralel per tenant, 1 layar dipakai masing-masing tenant, UI awal dibedakan per tenant.
2. Satu QRIS bersama, uang parkir di DB.
3. Struk: 1 struk = 1 tenant (multi-tenant satu struk ditolak karena ribet).
4. Pembayaran: verifikasi manual — pelanggan scan QRIS printed, tunjukkan bukti, kasir tekan lunas. Tanpa integrasi gateway.
5. Model pesan: hanya kasir-input (self-order via QR meja DIBATALKAN total, tidak ada no meja).
6. Produk: nama + harga + varian/ukuran + deskripsi + kategori menu. Stok opsional / unlimited (tidak wajib).
7. Bootstrap/pendaftaran (Admin daftarkan — dipilih user): tenant pertama didaftarkan admin/manager, bukan daftar sendiri. 1 akun admin dibuat manual saat setup. Alur: admin buka Kelola Tenant -> Tambah Tenant (nama tenant + PIN awal) -> serahkan PIN ke tenant -> tenant login PIN di perangkatnya -> lengkapi profil + daftarkan produk/varian sendiri -> tenant siap jualan. Tidak ada formulir apply mandiri, tidak ada peran kasir terpisah (kasir = tenant itu sendiri).
8. Admin bisa hapus tenant = soft-delete/nonaktif, bukan hapus beneran (riwayat order + rekap aman).
9. Rekap: total harian per tenant, per transaksi, jumlah minuman, total sebelum tutup kasir, + kategori menu.
10. Stack strategi dua tahap: Tahap 1 PWA Next.js + Supabase untuk demo manager, Tahap 2 Expo native. Pendekatan Tahap 1: opsi 1 cepat demo (1 repo Next.js PWA + tabel tenants/products/orders, login PIN, kasir klik + total + lunas manual + rekap).
11. Tutup hari: tombol tutup hari per tenant (rekap dikunci hari itu).
12. Void: wajib ada, pakai PIN tenant sendiri (kasir = tenant itu sendiri).
13. Cetak struk: NANTI, printer milik tenant sendiri (bukan dari kita). Tahap 1 tanpa cetak.
14. Harga per varian: tiap varian/ukuran punya harga sendiri, dibedakan di kasir.
15. Edit item per baris: ubah varian/qty/hapus per baris sebelum Lunas. YA.
16. Struk pending: simpan draft belum lunas, bisa lanjutkan/batalkan. YA.
17. Status menunggu konfirmasi: order lunas tapi menunggu dibuat/diantar. YA.
18. Harga history: harga disalin ke tiap transaksi (ganti harga tidak ubah struk lama).
19. Nonaktif dikunci: tenant yang ada order hari itu tidak bisa dinonaktifkan.
20. Rekap berjenjang: harian -> bulanan -> tahunan otomatis. YA.
21. Nama resmi: MONKAS (Monjali Kasir).
22. Supabase: project BARU terpisah (belum ada, dibuat saat setup).
23. Rekap setoran: dibuka semua — per tenant, per hari, rinci per transaksi; rincian final dirangkum pas tutup kasir (tutup hari mengunci angka hari itu).
24. Struk pending gantung: dua-duanya nyala — (a) kasir bisa batalkan manual kapan saja sebelum tutup hari; (b) bila kasir lupa, semua pending otomatis tertutup/batal saat tutup hari; (c) sistem tampilkan notifikasi pengingat bila masih ada pending yang ketinggalan saat kasir tekan tutup hari (kasir konfirmasi: batalkan semua / kembali selesaikan).
DITOLAK: split bill (tidak), ganti tenant cepat tanpa PIN (tidak, PIN beda).

## Bagian 2 — Arsitektur Tahap 1

- 1 repo Next.js BARU (PWA, installable di Android/Tab, terpisah dari kerja.inc) + Supabase project BARU.
- Tabel: tenants (id, nama, PIN, aktif), products (id, tenant_id, nama, deskripsi, kategori, aktif), variants (id, product_id, nama, harga), orders (id, tenant_id, items JSON + harga-history, total, status pending/lunas/menunggu/selesai/batal, waktu, tutup_hari).
- Auth: PIN per tenant + 1 akun admin. Session sederhana (PIN di device tenant itu).
- Alur kasir: login PIN tenant -> menu produk tenant itu saja -> klik minuman + pilih porsi/varian -> edit per baris bila perlu -> total otomatis -> pelanggan bayar via QRIS printed -> kasir tekan Lunas -> order tersimpan (status menunggu konfirmasi -> selesai) -> struk 1 tenant.
- Kelola Tenant (admin): tambah tenant + PIN, nonaktifkan tenant (dikunci bila ada order hari itu), lihat semua tenant.
- Kelola Produk (tenant): tambah/edit/nonaktifkan produk + varian harga sendiri.
- Rekap (tenant): hari ini — total penjualan, jumlah minuman, daftar transaksi; berjenjang harian/bulanan/tahunan.
- Rekap (admin/manager): per tenant + total semua, dibuka semua rinci per transaksi, untuk setor akhir bulan.
- Data flow: kasir klik produk -> order draft di state -> tekan Lunas -> INSERT orders (tenant_id, items, total, waktu) -> rekap baca SELECT orders WHERE tenant_id + tanggal.
- SENGAJA tidak ada di Tahap 1: integrasi QRIS gateway / QR dinamis; self-order / QR meja / no meja; stok wajib; struk gabungan multi-tenant; daftar tenant mandiri; hapus permanen; cetak struk; Tahap 2 native (Expo).

## Bagian 3 — Plan implementasi (6 task, TDD, eksekusi DITAHAN)

**Goal:** App kasir PWA standalone MONKAS untuk demo manager (paralel per tenant, 1 QRIS manual, struk 1 tenant).
**Architecture:** 1 repo Next.js PWA baru + Supabase project BARU: tabel tenants/products/variants/orders. PIN per tenant + 1 admin. Kasir klik -> Lunas manual -> rekap.
**Tech Stack:** Next.js (PWA), Supabase (Postgres), PIN session sederhana.

### Global Constraints

- Repo BARU terpisah, bukan di kerja.inc.
- Tanpa integrasi QRIS gateway; bayar = verifikasi manual.
- Tanpa self-order / no meja / QR meja.
- Tanpa stok wajib (opsional/unlimited).
- Hapus = soft-delete/nonaktif selalu.
- 1 struk = 1 tenant, tanpa split bill.
- Cetak struk NANTI (printer milik tenant).
- Rekap dibuka semua: per tenant, per hari, rinci per transaksi; dikunci pas tutup hari.
- Pending gantung: batal manual + auto-tutup saat tutup hari + notifikasi pengingat sebelum kunci.

### Review Focus

- PIN tenant A dipakai di device B: hanya lihat data tenant pemilik PIN.
- Ganti harga produk tidak mengubah total struk lama (harga history).
- Void tanpa PIN / PIN tenant lain: ditolak.
- Nonaktifkan tenant yang ada order hari itu: ditolak.
- Order pending 2 hari: tidak bocor ke rekap hari ini.

### Task 1: Setup repo + schema DB

- Create: repo baru kasir-multitenant (Next.js PWA) + supabase/migrations/001_init.sql. Test: buka app, halaman login PIN render.
- Produces: tabel tenants(id,nama,pin,aktif), products(id,tenant_id,nama,deskripsi,kategori,aktif), variants(id,product_id,nama,harga), orders(id,tenant_id,items JSON,harga-history,total,status,waktu,tutup_hari).
- [ ] Step 1: Scaffold Next.js + PWA manifest (installable Android/Tab).
- [ ] Step 2: Migrasi 001 (4 tabel + RLS PIN-scoped + seed admin).
- [ ] Step 3: Verifikasi: login page render; tabel ada di Supabase.
- [ ] Step 4: Commit.

### Task 2: Login PIN + Kelola Tenant (admin)

- Create: app/(auth)/login, app/admin/tenants. Test: PIN A tidak lihat produk B; tambah + nonaktifkan tenant.
- Consumes: tabel tenants (Task 1). Produces: loginPIN(pin)->tenant|admin; session per device.
- [ ] Step 1: Tulis test gagal: login PIN salah ditolak; PIN A isolasi data.
- [ ] Step 2: Implement login PIN + session + guard per tenant.
- [ ] Step 3: Implement admin tambah tenant + nonaktif (kunci bila ada order hari itu).
- [ ] Step 4: Verifikasi + commit.

### Task 3: Kelola Produk + varian harga

- Create: app/tenant/produk. Test: tambah produk + varian beda harga; harga lama di struk tidak berubah.
- Consumes: products, variants, session tenant. Produces: CRUD produk + varian (milik tenant sendiri).
- [ ] Step 1: Test gagal: tenant B tidak bisa edit produk A.
- [ ] Step 2: Implement CRUD produk + varian harga + nonaktif.
- [ ] Step 3: Verifikasi + commit.

### Task 4: Kasir (klik + edit baris + pending + lunas)

- Create: app/tenant/kasir. Test: klik -> total benar; edit baris; pending lanjutkan; Lunas simpan harga-history.
- Consumes: products/variants; Produces: orders(status: pending/lunas).
- [ ] Step 1: Test gagal: total = sum(varian*qty).
- [ ] Step 2: Implement grid menu + draft + edit per baris + pending + Lunas manual.
- [ ] Step 3: Verifikasi + commit.

### Task 5: Status konfirmasi + void PIN

- Modify: app/tenant/kasir (antrian status), orders status. Test: lunas -> menunggu -> selesai; void minta PIN sendiri.
- [ ] Step 1: Test gagal: void tanpa PIN / PIN tenant lain ditolak.
- [ ] Step 2: Implement antrian menunggu-konfirmasi + void ber-PIN.
- [ ] Step 3: Verifikasi + commit.

### Task 6: Rekap + tutup hari

- Create: app/tenant/rekap, app/admin/rekap. Test: rekap harian/bulanan/tahunan; tutup hari kunci; admin lihat per tenant + total.
- [ ] Step 1: Test gagal: order kemarin tidak masuk rekap hari ini.
- [ ] Step 2: Implement rekap berjenjang + tombol tutup hari per tenant + pengingat pending (konfirmasi batalkan-semua / kembali) + auto-tutup pending saat kunci.
- [ ] Step 3: Verifikasi di Android/Tab (PWA install) + commit.

## Status

Planning lengkap, eksekusi DITAHAN menunggu lampu hijau. Berikutnya bila disetujui: setup repo + Supabase baru (Task 1), lalu Task 2-6 berurutan.
