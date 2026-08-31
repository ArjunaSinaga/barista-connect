# Proposal B2B — Barista Connect

Gunakan template ini untuk Gmail draft (Apps Script `GmailApp.createDraft`). Data sumber: `wiki/biodata.md`.

## JSON (copy untuk AI Prompt Enhancer)

```json
{
  "subject": "Proposal Barista Connect — Kedai Kopi Go-Digital. Tanpa Ribet | untuk {{NAMA_KEDAI}}",
  "body": "Halo {{NAMA_PENERIMA}} di {{NAMA_KEDAI}},\n\nSaya Arjuna Rahman Maulana Sinaga — Founder Barista Connect, Mahasiswa Sistem Informasi Universitas Amikom Yogyakarta (2024—2028).\n\nBarista Connect membantu kedai kopi & UMKM go-digital tanpa ribet: website pemesanan + profil kedai (Next.js/Tailwind) dengan iterasi desain 10x lebih cepat via AI Prompt Enhancer (150-250 kata).\n\nDemo: https://barista-connect.demo (placeholder) — WA 085228883510 untuk akses.\n\nJika berkenan, saya buatkan draft preview gratis 1 halaman untuk {{NAMA_KEDAI}} (tanpa komitmen). Balas jam yang enak untuk 15 menit call?\n\nSalam,\nArjuna — arjunasinaga003@gmail.com | https://www.linkedin.com/in/arjuna-sinaga-62180a280\n"
}
```

## Cara pakai (30 detik)
1. Ganti `{{NAMA_KEDAI}}` & `{{NAMA_PENERIMA}}` → paste ke Apps Script `data.subject / data.body`
2. Jalankan `createDraft()` → cek Gmail Drafts → review manual → Send

## Aturan
- Draft only, tidak auto-send (human review)
- 150-250 kata, anti-spam: spesifik ke 1 kedai, 1 CTA, no mass blast
