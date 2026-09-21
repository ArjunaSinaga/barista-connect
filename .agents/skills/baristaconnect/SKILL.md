---
name: baristaconnect
description: 1 pintu BaristaConnect — system design + semua skill relevan terpanggil sekaligus. Panggil dengan "pakai baristaconnect".
---

# BaristaConnect — Unified Skill

> Saat skill ini dipanggil, load SEMUA di bawah (berurutan, lazy tapi wajib):

## 0. Dokumen sistem (baca dulu)
- `docs/SYSTEM_DESIGN.md` — arsitektur + adopsi 4 repo + backlog P0/P1/P2
- `wiki/project-overview.md` — fitur + alur + roadmap
- `memory/MEMORY.md` — status sesi terakhir (delta saja)

## 1. Router + skill yang ikut terpanggil
1. `backend-data` — Supabase RLS, Postgres patterns, query optimization (feed, search pg_trgm, ISR)
2. `supabase` — auth, realtime chat, storage cvs/cafes/avatars, debug error
3. `nextjs-developer` + `react-expert` — App Router RSC vs Client Islands (jangan taruh helper server di file use client)
4. `garap-ui-fullstack` — image-to-code + frontend UX + Vercel deploy
5. `secure-ship` — audit sebelum push (secret, RLS, rate limit, headers)
6. `quality-ops` — testing, debugging, smoke (`npm run smoke`)
7. `ai-data` — eval + cost/log AI suggest (Nemotron→Groq→Cerebras→Gemini→Bytez)
8. `hemat-core` — OTOMATIS: solusi terpendek, tolak over-engineering

## 2. Aturan main
- Urutan kerja: baca §0 → pilih backlog di SYSTEM_DESIGN.md §4 → eksekusi via skill yang cocok → verifikasi (lint+build+smoke) → AUTO-PUSH main → update delta MEMORY.md.
- Jangan load skill lain di luar daftar kecuali diminta eksplisit.
