import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";

// ponytail: 1 endpoint untuk uptime monitor (UptimeRobot/dll ping tiap 5 menit).
export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, db: "unconfigured" }, { status: 503 });
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.from("job_posts").select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, db: "up", at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
