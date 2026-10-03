import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Dipanggil Database Webhook Supabase saat applications INSERT.
// Header: x-hook-secret = NOTIFY_HOOK_SECRET. Pakai service-role key
// (server-only, tak ada sesi user di webhook) — RLS user tak berlaku di sini,
// akses dikunci secret di atas. Keduanya diisi di dashboard, bukan di repo
// (lihat docs/superpowers/plans/2026-10-03-queue-notifikasi.md Task 3).
export async function POST(req) {
  const secret = process.env.NOTIFY_HOOK_SECRET;
  if (!secret || req.headers.get("x-hook-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const rec = payload?.record ?? {};
  if (!rec.barista_id || !rec.job_post_id) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, serviceKey);
  const { data: job } = await admin.from("job_posts").select("owner_id").eq("id", rec.job_post_id).maybeSingle();
  const rows = [
    { user_id: rec.barista_id, title: "Lamaran terkirim", body: "Lamaran Anda sudah diteruskan ke pemilik kafe." },
  ];
  if (job?.owner_id) {
    rows.push({ user_id: job.owner_id, title: "Lamaran baru masuk", body: "Ada pelamar baru untuk lowongan Anda." });
  }
  const { error } = await admin.from("notifications").insert(rows);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true, inserted: rows.length });
}
