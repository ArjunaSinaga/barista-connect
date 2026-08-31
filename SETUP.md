# BaristaConnect — Setup Guide

Everything below is **free** and requires **no credit card**.
Total time: ±10 minutes.

---

## 1. Create the Supabase project (database + auth + storage)

1. Go to <https://supabase.com> → **Start your project** → sign up (GitHub recommended).
2. Click **New Project**:
   - Name: `barista-connect`
   - Database password: generate one and save it somewhere safe
   - Region: **Singapore** (closest to Indonesia)
3. Wait ~2 minutes for provisioning.

### Run the schema

4. In the left sidebar open **SQL Editor** → **New query**.
5. Open `supabase/schema.sql` from this repo, copy **everything**, paste into the editor, press **Run**. You should see `Success. No rows returned`.
6. *(Optional, demo data)* New query → paste contents of `supabase/seed.sql` → **Run**.
   This creates demo accounts you can log in with right away:

   | Role | Email | Password |
   |---|---|---|
   | Owner | `owner.senja@bc-demo.id` | `password123` |
   | Owner | `owner.brewok@bc-demo.id` | `password123` |
   | Barista | `barista1@bc-demo.id` … `barista8@bc-demo.id` | `password123` |

### Disable email confirmation (recommended for development)

7. Go to **Authentication → Sign In / Providers** (or *Providers → Email*).
8. Turn **OFF** "Confirm email". Without this, new signups must click an email link before they can use the app.

> ⚠️ Supabase free projects **pause after 7 days without activity**. A few requests per day keeps it alive; if paused, just hit **Restore** in the dashboard.

### Get your API keys

9. Go to **Project Settings → API** (gear icon in sidebar).
10. Copy these two values:
    - **Project URL**
    - **anon / public key**

---

## 2. Get a Gemini API key (AI chat assistant)

1. Go to <https://aistudio.google.com/apikey>.
2. Sign in with any Google account → **Create API key**.
3. Copy the key. The free tier is plenty for this app (no billing enabled).

---

## 3. Configure the project locally

```bash
# from the repo root
copy .env.example .env.local        # Windows
# cp .env.example .env.local        # macOS/Linux
```

Fill `.env.local` with your real values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIza...
```

Then run:

```bash
npm install     # first time only
npm run dev
```

Open <http://localhost:3000>.

---

## 4. Deploy to Netlify (free)

1. Push this repo to GitHub.
2. Go to <https://app.netlify.com> → sign up with GitHub → **Add new site → Import an existing project** → pick the repo.
3. Netlify auto-detects Next.js. Before deploying, add environment variables under
   **Site configuration → Environment variables**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
   | `GEMINI_API_KEY` | your Gemini key |

4. Click **Deploy**. Your site goes live at `https://<name>.netlify.app`.
5. Every future `git push` auto-deploys.

Free tier limits: 100 GB bandwidth/mo, 300 build minutes/mo — far more than this app needs.

---

## 5. Troubleshooting

| Problem | Fix |
|---|---|
| `Supabase URL is required` in terminal | `.env.local` missing or empty → check step 3 |
| Signup does nothing / "Email not confirmed" | Disable "Confirm email" (step 1.7–1.8) |
| Images not showing | Avatars come from the `avatars` bucket or seed URLs — re-run schema.sql storage section |
| AI replies never arrive | Check `GEMINI_API_KEY` is set and restart dev server |
| Supabase dashboard shows "Project paused" | Restore it (free tier pauses after 7 idle days) |
