import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Etalase publik: baca dari views (tanpa WA/CV/alamat).
// Dipakai SEMUA query publik. Tabel asli hanya untuk: data sendiri,
// pelamar ke loker sendiri, dan user centang biru (lihat policy SQL).
export async function attachOwners(jobs, supabase) {
  const ids = [...new Set((jobs ?? []).map((j) => j.owner_id).filter(Boolean))];
  if (!ids.length) return jobs ?? [];
  const db = supabase ?? (typeof window === "undefined" ? await createServerClient() : createBrowserClient());
  const { data } = await db.from("owners_public").select("id, business_name, location, avatar_url, is_verified").in("id", ids);
  const map = new Map((data ?? []).map((o) => [o.id, o]));
  return (jobs ?? []).map((j) => ({ ...j, owners: map.get(j.owner_id) ?? null }));
}

export async function attachBaristaNames(ratings, supabase) {
  const bIds = [...new Set((ratings ?? []).map((r) => r.barista_id).filter(Boolean))];
  const oIds = [...new Set((ratings ?? []).map((r) => r.owner_id).filter(Boolean))];
  if (!bIds.length && !oIds.length) return ratings ?? [];
  const db = supabase ?? (typeof window === "undefined" ? await createServerClient() : createBrowserClient());
  const [{ data: bs }, { data: os }] = await Promise.all([
    bIds.length ? db.from("baristas_public").select("id, full_name").in("id", bIds) : { data: [] },
    oIds.length ? db.from("owners_public").select("id, business_name").in("id", oIds) : { data: [] },
  ]);
  const bMap = new Map((bs ?? []).map((b) => [b.id, b]));
  const oMap = new Map((os ?? []).map((o) => [o.id, o]));
  return (ratings ?? []).map((r) => ({
    ...r,
    barista: bMap.get(r.barista_id) ?? null,
    owner: oMap.get(r.owner_id) ?? null,
  }));
}

export async function attachRatings(rows, supabase) {
  const ids = (rows ?? []).map((r) => r.id).filter(Boolean);
  if (!ids.length) return rows ?? [];
  const db = supabase ?? (typeof window === "undefined" ? await createServerClient() : createBrowserClient());
  const { data } = await db.from("ratings").select("barista_id, stars").in("barista_id", ids);
  const map = new Map();
  for (const r of data ?? []) {
    if (!map.has(r.barista_id)) map.set(r.barista_id, []);
    map.get(r.barista_id).push({ stars: r.stars });
  }
  return (rows ?? []).map((r) => ({ ...r, ratings: map.get(r.id) ?? [] }));
}
