# BaristaConnect — System Design

> Turunan praktis dari 4 repo GitHub terpilih. Update: 2026-09-21.

## 1. Arsitektur sekarang

```
Browser → Vercel (Next.js 16 App Router, RSC + Client Islands)
  → Route Handlers /api/* (rate limit 10-30/mnt)
  → Supabase (Postgres RLS + Auth + Realtime + Storage: cvs/cafes/avatars)
  → Midtrans QRIS (webhook, OFF) + AI fallback (Nemotron→Groq→Cerebras→Gemini→Bytez)
```

Tabel inti: profiles → barista_profiles / owners → cafes → job_posts → applications → team_members → ratings/cafe_ratings + conversations/messages + payments.

## 2. Yang diadopsi dari GitHub

### A. System Design Primer (donnemartin/system-design-primer) — fondasi
- [x] FK terindeks, RLS ON semua tabel bisnis, SECURITY DEFINER hardened
- [x] Pagination + limit di feed (jobs 4 → full scroll-dalam kotak)
- [ ] Cache lowongan aktif (ISR 60s / `unstable_cache`) — feed kini query tiap load
- [ ] CDN image via Supabase transform (foto cafe polaroid belum di-resize)
- [ ] Read replica / connection pooling pantau saat >100 concurrent

### B. Awesome Scalability (binhnguyennus/awesome-scalability) — naik skala
- [x] Realtime chat (Supabase Realtime), hapus pesan/room via RLS
- [ ] Queue notifikasi WA/AI (n8n ready, belum sambung ke events lamaran)
- [ ] Search talenta: trigram index `pg_trgm` untuk q/loc (kini LIKE, lambat saat >10k row)
- [ ] Rate limit naik ke Redis/Upstash saat multi-instance (kini in-memory)

### C. System Design Interview (checkcheckzz/system-design-interview) — bedah kasus
Latihan wajib tim: Design job feed / Design chat owner-barista / Design rating anti-fake.
- Rating dua arah sudah live (blind review sempat ON lalu dimatikan 1147230 — tampil segera)
- WA mask accepted-only (f29ac6a) = pola privacy interview yang benar

### D. ML Systems Design (chiphuyen/machine-learning-systems-design) — AI suggest
- [x] Fallback multi-provider + reasoning hidden per-provider (fix Qwen `<think>` 56377ea)
- [ ] Prompt versioning + eval set (balasan lamaran bagus vs jelek)
- [ ] Log cost/latency per provider (kini buta)
- [ ] Guardrail: PII (WA pelamar) jangan masuk prompt sebelum accepted

## 3. Target skala (gratis → bayar)

| Stage | Beban | Aksi |
|---|---|---|
| Kini (free) | <1k user, <10k lamaran | ISR feed, pg_trgm, image resize — cukup |
| Tumbuh | 10k user, chat padat | Upstash Redis rate+cache, queue n8n → events |
| Bayar | 100k+, multi-kota | Read replica, partisi messages per bulan, CDN penuh |

## 4. Backlog sistemasi (prioritas)

1. P0: ISR feed + image transform (murah, dampak besar)
2. P0: `pg_trgm` index search + trigram di nama/skill/alamat
3. P1: Prompt log + eval AI suggest (sebelum jadi agen)
4. P1: Queue lamaran→notifikasi (n8n webhook dari Postgres)
5. P2: Agentic patterns (auto-match barista-cafe) — repo #10, hanya setelah 1-4

## Referensi penuh
1. github.com/donnemartin/system-design-primer
2. github.com/ByteByteGoHq/system-design-101 (visual, opsional)
3. github.com/binhnguyennus/awesome-scalability
4. github.com/checkcheckzz/system-design-interview
5. github.com/chiphuyen/machine-learning-systems-design
6. Supabase agent-skills (sudah di .agents/skills) + supabase/supabase
