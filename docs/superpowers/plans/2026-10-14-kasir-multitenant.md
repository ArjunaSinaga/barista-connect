# MONKAS (Monjali Kasir) Tahap 1 (PWA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** App kasir PWA standalone MONKAS untuk demo manager (paralel per tenant, 1 QRIS manual, struk 1 tenant).

**Architecture:** 1 repo Next.js PWA baru (terpisah dari kerja.inc) + Supabase project BARU: tabel tenants/products/variants/orders. PIN per tenant + 1 admin. Kasir klik -> Lunas manual -> rekap.

**Tech Stack:** Next.js (PWA), Supabase (Postgres), PIN session sederhana.

**Spec:** docs/superpowers/specs/2026-10-14-kasir-multitenant-design.md

## Global Constraints
- Repo BARU terpisah, bukan di kerja.inc.
- Tanpa integrasi QRIS gateway; bayar = verifikasi manual.
- Tanpa self-order / no meja / QR meja.
- Tanpa stok wajib (opsional/unlimited).
- Hapus = soft-delete/nonaktif selalu.
- 1 struk = 1 tenant, tanpa split bill.
- Cetak struk NANTI (printer milik tenant).
- Rekap dibuka semua: per tenant, per hari, rinci per transaksi; dikunci pas tutup hari.
- Pending gantung: batal manual + auto-tutup saat tutup hari + notifikasi pengingat sebelum kunci.

## Review Focus
- PIN tenant A dipakai di device B: hanya lihat data tenant pemilik PIN.
- Ganti harga produk tidak mengubah total struk lama (harga history).
- Void tanpa PIN / PIN tenant lain: ditolak.
- Nonaktifkan tenant yang ada order hari itu: ditolak.
- Order pending 2 hari: tidak bocor ke rekap hari ini.

---

### Task 1: Setup repo + schema DB

**Files:**
- Create: repo baru kasir-multitenant (Next.js PWA) + supabase/migrations/001_init.sql
- Test: buka app, halaman login PIN render.

**Interfaces:**
- Produces: tabel tenants(id,nama,pin,aktif), products(id,tenant_id,nama,deskripsi,kategori,aktif), variants(id,product_id,nama,harga), orders(id,tenant_id,items JSON,harga-history,total,status,waktu,tutup_hari).

- [ ] Step 1: Scaffold Next.js + PWA manifest (installable Android/Tab).
- [ ] Step 2: Migrasi 001 (4 tabel + RLS PIN-scoped + seed admin).
- [ ] Step 3: Verifikasi: login page render; tabel ada di Supabase.
- [ ] Step 4: Commit.

### Task 2: Login PIN + Kelola Tenant (admin)

**Files:**
- Create: app/(auth)/login, app/admin/tenants
- Test: PIN A tidak lihat produk B; tambah + nonaktifkan tenant.

**Interfaces:**
- Consumes: tabel tenants (Task 1).
- Produces: loginPIN(pin)->tenant|admin; session per device.

- [ ] Step 1: Tulis test gagal: login PIN salah ditolak; PIN A isolasi data.
- [ ] Step 2: Implement login PIN + session + guard per tenant.
- [ ] Step 3: Implement admin tambah tenant + nonaktif (kunci bila ada order hari itu).
- [ ] Step 4: Verifikasi + commit.

### Task 3: Kelola Produk + varian harga

**Files:**
- Create: app/tenant/produk
- Test: tambah produk + varian beda harga; harga lama di struk tidak berubah.

**Interfaces:**
- Consumes: products, variants, session tenant.
- Produces: CRUD produk + varian (milik tenant sendiri).

- [ ] Step 1: Test gagal: tenant B tidak bisa edit produk A.
- [ ] Step 2: Implement CRUD produk + varian harga + nonaktif.
- [ ] Step 3: Verifikasi + commit.

### Task 4: Kasir (klik + edit baris + pending + lunas)

**Files:**
- Create: app/tenant/kasir
- Test: klik -> total benar; edit baris; pending lanjutkan; Lunas simpan harga-history.

**Interfaces:**
- Consumes: products/variants; Produces: orders(status: pending/lunas).

- [ ] Step 1: Test gagal: total = sum(varian*qty).
- [ ] Step 2: Implement grid menu + draft + edit per baris + pending + Lunas manual.
- [ ] Step 3: Verifikasi + commit.

### Task 5: Status konfirmasi + void PIN

**Files:**
- Modify: app/tenant/kasir (antrian status), orders status.
- Test: lunas -> menunggu -> selesai; void minta PIN sendiri.

- [ ] Step 1: Test gagal: void tanpa PIN / PIN tenant lain ditolak.
- [ ] Step 2: Implement antrian menunggu-konfirmasi + void ber-PIN.
- [ ] Step 3: Verifikasi + commit.

### Task 6: Rekap + tutup hari

**Files:**
- Create: app/tenant/rekap, app/admin/rekap
- Test: rekap harian/bulanan/tahunan; tutup hari kunci; admin lihat per tenant + total.

- [ ] Step 1: Test gagal: order kemarin tidak masuk rekap hari ini.
- [ ] Step 2: Implement rekap berjenjang + tombol tutup hari per tenant + pengingat pending (konfirmasi batalkan-semua / kembali) + auto-tutup pending saat kunci.
- [ ] Step 3: Verifikasi di Android/Tab (PWA install) + commit.
