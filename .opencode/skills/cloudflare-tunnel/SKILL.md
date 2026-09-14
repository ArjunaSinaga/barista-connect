---
name: cloudflare-tunnel
description: Expose a local dev server (Next.js, Vite, Flask, etc.) ke internet via Cloudflare Tunnel tanpa public IP — untuk preview perubahan dari HP/luar. Use when user wants to preview localhost from another device, share a local app as a public URL, or mentions cloudflared/tunnel/quick tunnel.
metadata:
  origin: user-request
---

# Cloudflare Tunnel — Preview Localhost

Expose `localhost:PORT` di mesin yang jalanin dev server menjadi URL publik
(`https://xxx.trycloudflare.com`) atau subdomain tetap — tanpa public IP,
tanpa port-forwarding. Terowongan terenkripsi (termasuk post-quantum).

## Konsep kunci (jangan salah)

- Tunnel harus jalan **di mesin yang sama dengan dev server-nya**.
  Tunnel di VM Proxmox cuma bisa expose app yang jalan **di VM itu** —
  TIDAK bisa expose `localhost:3000` di laptop.
- Untuk preview BaristaConnect dari RS: `npm run dev` + `cloudflared`
  dua-duanya jalan **di laptop**.

## Quick Tunnel (URL acak, tanpa setup — buat preview cepat)

```powershell
# Terminal 1 — dev server
npm run dev
# Terminal 2 — expose ke internet
cloudflared tunnel --url http://localhost:3000
# → dapat URL https://<acak>.trycloudflare.com, buka dari HP/browser mana saja
```

Install cloudflared di Windows (sekali saja):

```powershell
winget install --id Cloudflare.cloudflared
```

## Named Tunnel (subdomain tetap, misal dev.domain.com)

```powershell
cloudflared tunnel login
cloudflared tunnel create barista-dev
cloudflared tunnel route dns barista-dev dev.domain-kamu.com
cloudflared tunnel run --url http://localhost:3000 barista-dev
```

## Batasan Next.js yang perlu diingat

- Quick Tunnel URL acak → setiap restart ganti URL.
- Fitur yang mengandalkan domain tetap (OAuth callback, webhook Midtrans)
  TIDAK akan jalan lewat URL acak — pakai Named Tunnel atau Vercel Preview.
- `npm run dev` (bukan `build`) cukup untuk preview UI.
- Jangan expose service sensitif (DB port, Supabase local) — hanya port app.

## Alternatif tanpa tunnel

Push branch → Vercel otomatis bikin Preview Deployment dengan URL tetap.
Cocok untuk review UI, tanpa install apa pun.
