# Desain MONKAS (Monjali Kasir) — Sistem Kasir Multi-Tenant (Tahap 1 PWA) — 2026-10-14

## 1. Pemahaman (brief disetujui)
App kasir STANDALONE, tidak ada hubungan dengan kerja.inc. Satu lokasi besar menampung banyak tenant (contoh cafe A/B/C). 1 QRIS bersama untuk semua tenant. Uang parkir di database/sistem (satu rekening manager), akhir bulan diserahkan cash ke tiap tenant sesuai catatan DB. Perangkat paralel: tiap tenant di perangkat/layar masing-masing + login/PIN sendiri, buka bersamaan (bukan shift bergantian).

## 2. Keputusan yang sudah disetujui user
1. Model kasir: paralel per tenant, 1 layar dipakai masing-masing tenant, UI awal dibedakan per tenant. Benar.
2. Satu QRIS bersama, uang parkir di DB. Benar.
3. Struk: 1 struk = 1 tenant (multi-tenant satu struk ditolak karena ribet).
4. Pembayaran: verifikasi manual — pelanggan scan QRIS printed, tunjukkan bukti, kasir tekan lunas. Tanpa integrasi gateway.
5. Model pesan: hanya kasir-input (self-order via QR meja DIBATALKAN total, tidak ada no meja).
6. Produk: nama + harga + varian/ukuran + deskripsi + kategori menu. Stok opsional / unlimited (tidak wajib).
7. Bootstrap: tenant pertama didaftarkan admin/manager, bukan daftar sendiri. 1 akun admin dibuat manual saat setup, admin tambah tenant via Kelola Tenant, tenant dapat PIN lalu daftarkan produk.
8. Admin bisa hapus tenant = soft-delete/nonaktif, bukan hapus beneran (riwayat order + rekap aman).
9. Rekap: total harian per tenant, per transaksi, jumlah minuman, total sebelum tutup kasir, + kategori menu.
10. Stack strategi dua tahap: Tahap 1 PWA Next.js + Supabase untuk demo manager, Tahap 2 Expo native. Pendekatan Tahap 1: opsi 1 cepat demo (1 repo Next.js PWA + tabel tenants/products/orders, login PIN, kasir klik + total + lunas manual + rekap).

## 3. Arsitektur Tahap 1 (pendekatan A, disetujui)
- 1 repo Next.js (PWA, installable di Android/Tab) + Supabase sebagai database.
- Tabel: tenants (id, nama, PIN, aktif), products (id, tenant_id, nama, harga, varian/ukuran, deskripsi, kategori, aktif), orders (id, tenant_id, items JSON, total, waktu, kasir, status lunas).
- Auth: PIN per tenant + 1 akun admin. Session sederhana (PIN di device tenant itu).
- Alur kasir: login PIN tenant -> menu produk tenant itu saja -> klik minuman + pilih porsi/varian -> total otomatis -> pelanggan bayar via QRIS printed -> kasir tekan Lunas -> order tersimpan -> struk 1 tenant.
- Kelola Tenant (admin): tambah tenant + PIN, nonaktifkan tenant, lihat semua tenant.
- Kelola Produk (tenant): tambah/edit/nonaktifkan produk sendiri.
- Rekap (tenant): hari ini — total penjualan, jumlah minuman, daftar transaksi. Rekap (admin/manager): per tenant + total semua, untuk setor akhir bulan.

## 4. Data flow
Kasir klik produk -> order draft di state -> tekan Lunas -> INSERT orders (tenant_id, items, total, waktu) -> rekap baca SELECT orders WHERE tenant_id + tanggal.

## 5. Yang SENGAJA tidak ada di Tahap 1
- Integrasi QRIS gateway / QR dinamis per struk.
- Self-order / QR meja / no meja.
- Stok wajib / pengurangan stok otomatis.
- Struk gabungan multi-tenant.
- Daftar tenant mandiri (self-signup).
- Hapus permanen tenant / produk (selalu soft-delete).
- Tahap 2 native (Expo) — terpisah setelah demo disetujui manager.

## 6. Testing (rencana verifikasi)
- Login PIN tenant A tidak bisa lihat produk tenant B.
- Buat order -> total benar -> Lunas -> muncul di rekap hari itu.
- Nonaktifkan tenant -> tidak bisa login, riwayat order tetap ada.
- PWA ter-install di Android/Tab dan bisa dibuka fullscreen.

## 7. Sukses = demo ke manager
Manager bisa lihat: tiap tenant punya kasir sendiri, pesan-lunas-rekap jalan, satu QRIS, pembagian per tenant tercatat untuk setor akhir bulan.

## 8. Tambahan disetujui (putaran gap 1+2)
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
DITOLAK: split bill (tidak), ganti tenant cepat tanpa PIN (tidak, PIN beda).

## 9. Finalisasi planning (disetujui 2026-10-14)
21. Nama resmi: MONKAS (Monjali Kasir).
22. Supabase: project BARU terpisah (belum ada, dibuat saat setup).
23. Rekap setoran: dibuka semua — per tenant, per hari, rinci per transaksi; rincian final dirangkum pas tutup kasir (tutup hari mengunci angka hari itu).
24. Struk pending gantung: dua-duanya nyala — (a) kasir bisa batalkan manual kapan saja sebelum tutup hari; (b) bila kasir lupa, semua pending otomatis tertutup/batal saat tutup hari; (c) sistem tampilkan notifikasi pengingat bila masih ada pending yang ketinggalan saat kasir tekan tutup hari (kasir konfirmasi: batalkan semua / kembali selesaikan).
