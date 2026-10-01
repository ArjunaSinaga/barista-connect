# BaristaConnect — Handover Programmer

> Copy-paste file ini ke Notion, lalu share link Notion ke programmer.

## 1. URL Penting

| Apa | URL |
|---|---|
| GitHub repo | https://github.com/ArjunaSinaga/barista-connect |
| Live site | https://barista-connect.vercel.app |
| Vercel dashboard | https://vercel.com/dashboard (cari project `barista-connect`) |
| Supabase dashboard | buka https://supabase.com/dashboard, cari project BaristaConnect |
| Local dev | http://localhost:3000 |

Branch aktif: `main`

## 2. Akses yang harus di-invite

1. **GitHub** → repo Settings → Collaborators → add username dia (minimal Write)
2. **Supabase** → Project Settings → Team → invite email dia
3. **Vercel** → Project → Settings → Members → invite email dia (Member/Viewer)

## 3. Cara jalan lokal (5 menit)

```powershell
git clone https://github.com/ArjunaSinaga/barista-connect.git
cd barista-connect
npm install
# copy .env.local dari owner (jangan commit!), lalu:
npm run dev
# buka http://localhost:3000
```

Scripts: `dev` (next dev), `build` (next build), `start` (next start), `lint` (eslint), `smoke` (node scripts/smoke.mjs)

## 4. Stack

Next.js 16.3.3 + React 19 + Supabase (@supabase/ssr, supabase-js) + Tailwind 4 + Vercel deploy + Midtrans (payment webhook) + react-hook-form/zod.

## 5. Struktur folder (kode produksi)

- `app/` — App Router: pages + API routes
  - `app/api/mobile/chat`, `app/api/verify/*`, `app/api/webhooks/midtrans`, `app/api/healthz`, `app/api/client-log`
  - `app/auth/*`, `app/login`, `app/signup`, `app/forgot-password`, `app/update-password`
  - `app/dashboard/owner/*` (cafes, jobs, team, applicants), `app/dashboard/barista/*` (applications, profile)
  - `app/jobs`, `app/barista/[id]`, `app/cafes/[id]`, `app/owner/[id]`, `app/messages`, `app/reviews`, `app/training`, `app/find-baristas`, `app/onboarding/*`, `app/verify`
- `components/` — barista/, owner/dashboard/, jobs/, cards/, chat/, ratings/, search/, landing/, layout/, training/, ui/
- `lib/` — supabase/client.js, supabase/server.js, midtrans.js, ai.js (fallback GROQ→CEREBRAS→BYTEZ→GEMINI→NVIDIA), ratings.js, team.js, validation.js, dsb.
- `supabase/` — migrations/ (15 file, sumber kebenaran), schema.sql, seed.sql
- `public/` — icon, archify/
- `scripts/` — smoke.mjs
- `proxy.ts`, `next.config.mjs`, `jsconfig.json`, `postcss.config.mjs`

## 6. Env vars (.env.local — MINTA KE OWNER, jangan commit)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= (server only!)
# AI fallback (lib/ai.js): GROQ_API_KEY, CEREBRAS_API_KEY, BYTEZ_API_KEY, GEMINI_API_KEY, NVIDIA_API_KEY
# Payment: MIDTRANS_* (cek lib/midtrans.js)
```

## 7. Database

Sumber kebenaran: `supabase/migrations/` (15 file, dari 20250903 sampai 20260925_rating_shield). Jalankan berurutan di Supabase baru. Seed: `supabase/seed.sql`.

## 8. Deploy

Push ke `main` → Vercel auto-deploy → cek https://barista-connect.vercel.app. Debug: Vercel → Deployments → Logs. API sehat: `/api/healthz`.

## 9. Folder non-produksi (abaikan, jangan hapus)

`_vendor/`, `character-lora/`, `kopimatch/`, `archify-demo/`, `memory/`, `wiki/`, `.agents/`, `.opencode/`, `docs/`
