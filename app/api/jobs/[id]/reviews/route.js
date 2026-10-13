import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { avgStars } from "@/lib/ratings";

export const runtime = "nodejs";

// Ulasan kafe untuk panel instan /jobs: ringan, tanpa sesi,
// hanya kolom publik (bintang, komentar, tanggal).
export async function GET(_req, { params }) {
  const { id } = await params;
  if (!id || !isSupabaseConfigured()) {
    return NextResponse.json({ avg: null, count: 0, reviews: [] });
  }
  try {
    const supabase = await createClient();
    const { data: job } = await supabase
      .from("job_posts")
      .select("owner_id")
      .eq("id", id)
      .maybeSingle();
    if (!job?.owner_id) {
      return NextResponse.json({ avg: null, count: 0, reviews: [] });
    }
    const { data: teams } = await supabase
      .from("team_members")
      .select("id")
      .eq("owner_id", job.owner_id);
    const tids = (teams ?? []).map((t) => t.id);
    if (!tids.length) {
      return NextResponse.json({ avg: null, count: 0, reviews: [] });
    }
    const { data: cr } = await supabase
      .from("cafe_ratings")
      .select("stars, comment, created_at")
      .in("team_member_id", tids)
      .order("created_at", { ascending: false })
      .limit(10);
    const list = cr ?? [];
    return NextResponse.json({
      avg: avgStars(list),
      count: list.length,
      reviews: list.filter((r) => r.comment),
    });
  } catch {
    return NextResponse.json({ avg: null, count: 0, reviews: [] });
  }
}
