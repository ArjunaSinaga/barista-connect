import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ponytail: ganti n8n (butuh hosting) dengan Database Webhooks bawaan Supabase (gratis).
// Setup (sekali, di dashboard Supabase > Database > Webhooks): INSERT di tabel applications
// -> POST ke https://domain/api/hooks/lamaran dengan header x-hook-secret.
// Tanpa provider WA, event dicatat di Vercel logs — siap disambung pengirim WA kapan saja.
export async function POST(req) {
  if (!process.env.HOOK_SECRET || req.headers.get("x-hook-secret") !== process.env.HOOK_SECRET)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const { type, record } = await req.json();
    console.log(`[hook-lamaran] ${type ?? "?"} job=${record?.job_post_id ?? "?"} barista=${record?.barista_id ?? "?"}`);
    // TODO: kirim WA ke owner saat provider sudah ada (pakai record.job_post_id + record.barista_id)
  } catch {
    // diam: webhook tak boleh merusak app
  }
  return NextResponse.json({ ok: true });
}
