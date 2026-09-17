import { createClient } from "@/lib/supabase/server";

// SERVER ONLY — jangan import dari client component (next/headers).
// Etalase publik: baca dari views (tanpa WA/CV/alamat).
export async function attachOwners(jobs, supabase) {
  const ids = [...new Set((jobs ?? []).map((j) => j.owner_id).filter(Boolean))];
  if (!ids.length) return jobs ?? [];
  const db = supabase ?? await createClient();
  const { data } = await db.from("owners_public").select("id, business_name, location, avatar_url, is_verified").in("id", ids);
  const map = new Map((data ?? []).map((o) => [o.id, o]));
  return (jobs ?? []).map((j) => ({ ...j, owners: map.get(j.owner_id) ?? null }));
}

export async function attachBaristaNames(ratings, supabase) {
  const bIds = [...new Set((ratings ?? []).map((r) => r.barista_id).filter(Boolean))];
  const oIds = [...new Set((ratings ?? []).map((r) => r.owner_id).filter(Boolean))];
  if (!bIds.length && !oIds.length) return ratings ?? [];
  const db = supabase ?? await createClient();
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

export async function attachRatings(rows, supabase) {  const ids = (rows ?? []).map((r) => r.id).filter(Boolean);
  if (!ids.length) return rows ?? [];
  const db = supabase ?? await createClient();
  const { data } = await db.from("ratings").select("barista_id, stars").in("barista_id", ids);
  const map = new Map();
  for (const r of data ?? []) {
    if (!map.has(r.barista_id)) map.set(r.barista_id, []);
    map.get(r.barista_id).push({ stars: r.stars });
  }
  return (rows ?? []).map((r) => ({ ...r, ratings: map.get(r.id) ?? [] }));
}

// Nama lawan bicara untuk thread chat (bentuk sama seperti embed FK lama).
export async function attachConversationNames(convs, supabase) {
  const list = convs ?? [];
  const oIds = [...new Set(list.map((c) => c.owner_id).filter(Boolean))];
  const bIds = [...new Set(list.map((c) => c.barista_id).filter(Boolean))];
  const db = supabase ?? await createClient();
  const [{ data: os }, { data: bs }] = await Promise.all([
    oIds.length ? db.from("owners_public").select("id, business_name").in("id", oIds) : { data: [] },
    bIds.length ? db.from("baristas_public").select("id, full_name, profile_picture_url").in("id", bIds) : { data: [] },
  ]);
  const oMap = new Map((os ?? []).map((o) => [o.id, o]));
  const bMap = new Map((bs ?? []).map((b) => [b.id, b]));
  return list.map((c) => ({
    ...c,
    owners: oMap.get(c.owner_id) ?? null,
    barista_profiles: bMap.get(c.barista_id) ?? null,
  }));
}
