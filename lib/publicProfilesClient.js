import { createClient } from "@/lib/supabase/client";

// Client-safe: hanya browser client, tanpa next/headers.
// Dipakai BaristaDirectory (client component).
export async function attachRatings(rows) {
  const ids = (rows ?? []).map((r) => r.id).filter(Boolean);
  if (!ids.length) return rows ?? [];
  const supabase = createClient();
  const { data } = await supabase.from("ratings").select("barista_id, stars").in("barista_id", ids);
  const map = new Map();
  for (const r of data ?? []) {
    if (!map.has(r.barista_id)) map.set(r.barista_id, []);
    map.get(r.barista_id).push({ stars: r.stars });
  }
  return (rows ?? []).map((r) => ({ ...r, ratings: map.get(r.id) ?? [] }));
}
