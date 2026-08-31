# Security Audit & Deployment Notes

## Date: 2026-08-31

### Critical Fixes Applied

1. **Auth bypass fixed** — `cron/influencer/route.js` and `influencer/generate/route.js` now `return false` when `CRON_SECRET` is missing (was `return true`, allowing unauthenticated access).

2. **Duplicate HSTS removed** — `next.config.mjs` no longer sets `Strict-Transport-Security` (already in `netlify.toml` at the edge).

3. **Dead files cleaned** — Deleted `page_dark.jsx`, `page.jsx.bak`, `next.config.mjs.bak`.

### Remaining Security Items (not yet fixed)

| Issue | File | Severity |
|-------|------|----------|
| `/api/ai/autorespond` has NO auth check | `app/api/ai/autorespond/route.js` | HIGH |
| `/api/ai/suggest` has NO auth check | `app/api/ai/suggest/route.js` | HIGH |
| `publishInstagram` missing `access_token` param | `lib/influencer/publish.js` | MEDIUM |
| `TELEGRAM_BOT_TOKEN` displayed in dashboard UI | `app/dashboard/influencer/page.jsx:19` | MEDIUM |
| Middleware skips ALL auth when env vars missing | `middleware.js:10-12` | MEDIUM |
| Seed file inserts into `auth.users` with hardcoded `123` password | `supabase/seed.sql` | LOW (demo only) |

### Environment Variables Required in Netlify

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
MODELSLAB_TOKEN
CRON_SECRET
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
SITE_URL
21ST_API_KEY
IG_ACCESS_TOKEN (optional — Instagram integration)
IG_USER_ID (optional — Instagram integration)
HF_TOKEN (optional — HuggingFace face swap)
BYTEZ_API_KEY (optional — video generation)
HF_VIDEO_SPACE (optional — video generation)
FACE_SWAP_SPACE (optional — face swap)
GEMINI_API_KEY (optional — Gemini image gen)
```

### Architecture

- **Framework**: Next.js App Router (JSX, no TypeScript)
- **Auth**: Supabase Auth (email/password) + middleware
- **Database**: Supabase PostgreSQL with RLS
- **AI**: Multiple providers (Kimi/LLM, Gemini, Pollinations, HuggingFace)
- **Deployment**: Netlify via `@netlify/plugin-nextjs`
- **Cron**: `/api/cron/influencer` triggered by Netlify scheduled function

### Build Command

```bash
npm run build
```

### Key Files

- `middleware.js` — Auth gating, role-based redirects
- `lib/supabase/server.js` — Server-side Supabase client with getUser()
- `lib/supabase/client.js` — Browser Supabase client
- `lib/ai.js` — AI content generation (autoRespond, suggestReply, loadConversationContext)
- `netlify.toml` — Build config + security headers (CSP, HSTS, X-Frame-Options)
- `next.config.mjs` — Image remotePatterns for Supabase storage + randomuser.me
