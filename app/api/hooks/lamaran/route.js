import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Dipanggil Database Webhook Supabase saat applications INSERT.
// Header: x-hook-secret = NOTIFY_HOOK_SECRET. Secret diisi di dashboard,
// bukan di repo (lihat docs/superpowers/plans/2026-10-03-queue-notifikasi.md Task 3).
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
  const supabase = await createClient();
  const { data: job } = await supabase.from("job_posts").select("owner_id").eq("id", rec.job_post_id).maybeSingle();
  const rows = [
    { user_id: rec.barista_id, title: "Lamaran terkirim", body: "Lamaran Anda sudah diteruskan ke pemilik kafe." },
  ];
  if (job?.owner_id) {
    rows.push({ user_id: job.owner_id, title: "Lamaran baru masuk", body: "Ada pelamar baru untuk lowongan Anda." });
  }
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true, inserted: rows.length });
}
