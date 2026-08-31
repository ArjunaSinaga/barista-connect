import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishInstagram, notifyTelegram } from "@/lib/influencer/publish";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function checkAuth(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") || "";
  const qp = req.nextUrl.searchParams.get("secret");
  return auth === `Bearer ${secret}` || qp === secret;
}

export async function GET(req) {
  if (!checkAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const base = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  // Trigger generate (foto) then auto-publish if ready
  const genRes = await fetch(`${base}/api/influencer/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron": "1", ...(process.env.CRON_SECRET ? { Authorization: `Bearer ${process.env.CRON_SECRET}` } : {}) },
    body: JSON.stringify({ type: "foto" }),
  });
  const gen = await genRes.json().catch(() => ({}));
  if (!genRes.ok) {
    await notifyTelegram(`❌ Generate gagal: ${gen.error || genRes.status}`);
    return NextResponse.json({ ok: false, gen }, { status: 500 });
  }
  // Auto publish to IG if configured
  let ig = null;
  if (gen.publicUrl) {
    try {
      const cap = `${gen.caption}\n\n${(gen.hashtags || []).join(" ")}`;
      ig = await publishInstagram({ imageUrl: gen.publicUrl, caption: cap });
      const supabase = await createClient();
      await supabase.from("influencer_posts").update({ status: "published", published_at: new Date().toISOString(), ig_media_id: ig.id || null }).eq("id", gen.postId);
      await notifyTelegram(`✅ Auto-post IG: ${gen.publicUrl}\n${cap.slice(0, 100)}`);
    } catch (e) {
      ig = { error: e.message };
      await notifyTelegram(`⚠️ Generate ok tapi IG gagal: ${e.message}\nURL: ${gen.publicUrl}`);
    }
  }
  return NextResponse.json({ ok: true, gen, ig });
}

// POST also allowed for manual trigger
export async function POST(req) { return GET(req); }
