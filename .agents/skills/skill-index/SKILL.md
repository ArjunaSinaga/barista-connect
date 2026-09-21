---
name: skill-index
description: Master indeks semua router + skill inti. Panggil saat mulai kerja ("pakai skill-index") agar tahu apa saja yang tersedia, lalu lazy-load hanya yang dibutuhkan.
---

# Skill Index — 1 pintu ke semua skill

> Cara pakai: baca daftar ini, pilih yang cocok dengan tugas, lalu panggil skill itu
> via skill tool. JANGAN load semua sekaligus.

## Router (panggil salah satu sesuai konteks)

| Router | Kapan dipakai | Isi |
|---|---|---|
| `hemat-core` | OTOMATIS tiap coding | ponytail, shrinkage, summarization + context-* |
| `secure-ship` | Sebelum deploy/publish | security-scan, threat-modeling, dependency-scanning, SAST/DAST, pentest-strix, prompt-injection-defense, skill-supply-chain-audit + 8 lain |
| `backend-data` | Database / API / webhook / MCP | supabase, supabase-postgres-best-practices, postgres-patterns, sql-pro, query-optimization + 10 lain |
| `quality-ops` | Testing / debug / CI-CD / infra / monitoring | testing, debugging, code-review, refactoring, docker-compose-setup + 10 lain |
| `ai-data` | ML / data / pipeline / RAG | deep-research, fact-checking, spreadsheet-analysis + 9 lain |
| `product-docs` | Tulisan / proposal / presentasi / email / meeting | technical-writing, email-drafting, presentation-creation + 9 lain |

## Skill inti (langsung, tanpa lewat router)

- `baristaconnect` — "pakai baristaconnect": 1 pintu BaristaConnect, system design + semua skill relevan terpanggil sekaligus
- `garap-ui-fullstack` — "pakai skill garap-ui-fullstack": image-to-code, frontend UX/UI, Vercel, Supabase (1 pintu frontend)
- `supabase` — auth, DB, edge function, realtime, storage, debug error Supabase
- `frontend-design` — desain interface production-ready + dark mode
- `no-ai-slop` — rapikan tulisan/kode agar tidak bau AI
- `cloudflare-tunnel` — expose dev server lokal via tunnel (preview HP/luar)
- `context7-mcp` — dokumentasi resmi library/framework (cek versi terbaru)
- `nextjs-developer` — App Router, server component/action, middleware, deploy Vercel
- `react-expert` — komponen, hooks, Server Component, performa React
- `typescript-pro` / `javascript-pro` — type aman / ES modern + Node
- `oauth-2-0-setup` — login OAuth PKCE / client credentials
- `api-integration` — konsumsi REST API pihak ketiga + webhook consumer
- `version-control` — branching, commit hygiene, resolve konflik, PR
- `enhance-prompt` — perbaiki prompt mentah jadi instruksi tajam
- `summarization` — ringkas teks level detail configurable
- `skill-creator` — bikin/edit skill baru + benchmark performa skill

## Aturan hemat (hemat-core)

1. Router/skill = lazy-load, bukan always-on. Jangan gabung jadi 1 file besar.
2. Tiap eksekusi plan: solusi terpendek, tolak over-engineering.
3. Tiap prompt selesai: update delta ke `memory/MEMORY.md`.
