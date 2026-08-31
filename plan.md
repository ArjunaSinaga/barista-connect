# Beauty Dance AI Influencer — IG Auto / TikTok Semi-Auto (Railway Free)

## Stack
- Character: flux/sdxl text-to-image, seed fixed, 9:16
- Motion: modelslab motion-control (init_image karakter + init_video tiktok dance)
- Storage: Supabase Storage (bucket `influencer`)
- Hosting: N8N on Railway free (cron 1-5x/day, cold start ok, ~4h/month for 4x/day)
- Publish: IG Graph API auto, TikTok semi-auto via Telegram notif + 1-click upload

## N8N Workflow (7 nodes) — Railway import JSON at `n8n-workflow.json`
Cron -> TikTok Trending Search -> ModelsLab motion-control -> Poll fetch-video -> Supabase Upload -> IG Publish -> Telegram Notify

## Scale
- Start 1x/day (0 7 * * *), validate 3 days
- Scale to 3-5x/day by editing Cron to `0 7,12,17,20 * * *` — no infra change
- Bottleneck: ModelsLab credits, not Railway

## Risks
- Trending sound = takedown risk, keep <15s, switch to AI music if strike
- TikTok full auto needs dev approval, hence semi-auto

## Next
- Generate base character
- Verify motion model
- Import n8n-workflow.json to Railway
- Connect IG Business + FB Page token (once)
