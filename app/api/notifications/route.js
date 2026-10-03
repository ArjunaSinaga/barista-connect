import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const unreadOnly = new URL(req.url).searchParams.get("unread") === "1";
  let q = supabase.from("notifications").select("id,title,body,is_read,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (unreadOnly) q = q.eq("is_read", false);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function PATCH(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ids } = await req.json().catch(() => ({}));
  let q = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  if (Array.isArray(ids) && ids.length) q = q.in("id", ids);
  const { error } = await q;
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
