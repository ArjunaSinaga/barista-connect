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

## 5. Watchlist (pantau, jangan adopsi sekarang — update 2026-09-21)

> Aturan: masuk watchlist = tercatat + alasan + syarat adopsi. Dieksekusi hanya saat backlog P0/P1 di §4 kelar.

### W1. Jev — TypeSafe AI System One model (X @akshay_pachaar, ✅ VALID 2026-09-21)
- Apa: model keputusan non-generatif. Input state + pertanyaan bertipe (`Choice`/`Score`/`Noul`), output jawaban + probabilitas terkalibrasi. Tak bisa nulis/koding.
- Fakta: rilis 15 Sep 2026, early access (waitlist), `jev-1.13.0`, $0.042/1M token input + output gratis, latensi 70–500ms, konteks 64K, closed weights, text-only. Integrasi real: LangChain `langchain-typesafe` + Vercel AI Gateway (`typesafe-ai/jev`).
- Caveat: klaim "200x/400x" = benchmark vendor (ceiling, bukan janji); "can't hallucinate" cuma soal schema-safe, tetap bisa salah pilih opsi valid.
- Calon pakai di kita (P1): gate AI suggest — skor kecocokan barista↔loker, risk check sebelum aksi sensitif, routing model murah vs mahal. Syarat adopsi: akses early access dibuka + Langfuse/eval P1 sudah jalan (butuh data kalibrasi sendiri).
- Sumber: typesafe.ai/blog/introducing-system-one-models-and-jev, langchain.com/blog/building-a-harness-with-jev

### W2. Picks dari AI Stack Map @triptitips (✅ VALID, detail di IG_BACKLOG.md #10)
- P1 (eval+guardrail): Langfuse atau LangSmith + Ragas (eval set AI suggest §D), Presidio/Lakera/NeMo Guardrails (PII WA jangan masuk prompt).
- P2 (auto-match): pgvector di Postgres existing (tanpa vector DB eksternal) + Redis (memory/cache) + n8n queue.
- Syarat adopsi: pilih SATU per kategori saat eksekusi P1/P2, jangan pasang semua.

### W3. KrillinAI — video repurposing (X @He1s_Sammy, ✅ VALID 2026-09-21)
- `krillinai/KrillinAI` (Go, GPL-3.0, ~11K stars): download → transcribe → translate → TTS dubbing → render vertikal/horizontal → cover. 100+ bahasa, YouTube/TikTok/Bilibili/Douyin.
- Caveat: "FREE" = software gratis, tapi butuh API key LLM+TTS sendiri (ada cost); self-host via CLI.
- Relevansi: mesin konten lead-gen organik (nyambung IG_BACKLOG #9 faceless). BUKAN prioritas sebelum POS fase 1. Detail di IG_BACKLOG.md #11.

### W4. Obscura — headless browser Rust (X @liambraus, ✅ repo real, klaim dikoreksi 2026-09-21)
- `h4ckf0r0day/obscura`: Rust + V8, server CDP (kompatibel Puppeteer/Playwright), MCP server, mode stealth + blocklist ±3.520 tracker, 30MB/85ms sesuai README. Ada cloud (obscura.sh) + self-host Docker.
- KOREKSI klaim X: stealth pakai fingerprint Chrome KONSISTEN, bukan random per sesi (dok arsitektur sendiri); "pengganti langsung" hanya utk ~30 method CDP umum + 9 domain — situs berat bisa beda render; lisensi belum dipastikan (cek sebelum pakai di produk).
- Relevansi: mesin scraping lead-gen (data cafe) + MCP browser tools. Syarat adopsi: Playwright MCP existing terbukti kurang → bandingkan dulu; cek lisensi. BUKAN prioritas sebelum POS fase 1.
- Catatan: Invidious (frontend YouTube alternatif, iv-org, AGPLv3, ~24k stars) dari thread yg sama ✅ real tapi TIDAK relevan utk produk — skip.

## Referensi penuh
1. github.com/donnemartin/system-design-primer
2. github.com/ByteByteGoHq/system-design-101 (visual, opsional)
3. github.com/binhnguyennus/awesome-scalability
4. github.com/checkcheckzz/system-design-interview
5. github.com/chiphuyen/machine-learning-systems-design
6. Supabase agent-skills (sudah di .agents/skills) + supabase/supabase
