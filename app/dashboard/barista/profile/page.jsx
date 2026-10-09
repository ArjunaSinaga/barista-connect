import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import ProfileEditor from "@/components/barista/ProfileEditor";
import WorkerProfileView from "@/components/barista/WorkerProfileView";
import ConnectionInbox from "@/components/social/ConnectionInbox";

export const metadata = { title: "Profil Saya" };

export default async function BaristaProfilePage({ searchParams }) {
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const params = await searchParams;

  const supabase = await createClient();
  const { data: row } = await supabase.from("barista_profiles").select("*").eq("id", user.id).maybeSingle();
  if (!row) notFound();

  if (params?.edit) {
    const { data: portfolio } = await supabase
      .from("barista_portfolio")
      .select("id, image_url, caption")
      .eq("barista_id", user.id)
      .order("sort_order")
      .order("created_at");
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/dashboard/barista/profile" className="text-sm font-bold text-caramel hover:underline">
          ← Kembali ke profil
        </Link>
        <div className="mt-4"><ProfileEditor initial={row} portfolio={portfolio ?? []} /></div>
      </div>
    );
  }

  const { data: workHistory } = await supabase
    .from("team_members")
    .select("job_title, status, hired_at, owner_id, owners ( business_name )")
    .eq("barista_id", user.id)
    .in("status", ["active", "terminated"])
    .order("hired_at", { ascending: false })
    .limit(10);

  const { data: ownerRatings } = await supabase
    .from("ratings")
    .select("id, team_member_id, stars, comment, created_at, hidden")
    .eq("barista_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const teamIds = [...new Set((ownerRatings ?? []).map((r) => r.team_member_id).filter(Boolean))];
  let cafeTeamIds = new Set();
  if (teamIds.length) {
    const { data: pairs } = await supabase.from("cafe_ratings").select("team_member_id").in("team_member_id", teamIds);
    cafeTeamIds = new Set((pairs ?? []).map((r) => r.team_member_id));
  }
  const ratings = (ownerRatings ?? []).filter((r) => cafeTeamIds.has(r.team_member_id));
  // Rata-rata publik: yang disembunyikan (Shield) tidak ikut hitung.
  const visible = ratings.filter((r) => !r.hidden);
  const avg = visible.length ? (visible.reduce((s, r) => s + r.stars, 0) / visible.length).toFixed(1) : null;

  const { data: portfolio } = await supabase
    .from("barista_portfolio")
    .select("id, image_url, caption")
    .eq("barista_id", user.id)
    .order("sort_order")
    .order("created_at");

  // Nama pemberi ulasan: ratings -> team_members -> owners.
  const rTeamIds = [...new Set(ratings.map((r) => r.team_member_id).filter(Boolean))];
  let ownerByTeam = {};
  if (rTeamIds.length) {
    const { data: tm } = await supabase.from("team_members").select("id, owner_id").in("id", rTeamIds);
    const oIds = [...new Set((tm ?? []).map((t) => t.owner_id).filter(Boolean))];
    let owners = [];
    if (oIds.length) {
      const { data: ow } = await supabase.from("owners").select("id, business_name").in("id", oIds);
      owners = ow ?? [];
    }
    const oName = Object.fromEntries(owners.map((o) => [o.id, o.business_name]));
    (tm ?? []).forEach((t) => { ownerByTeam[t.id] = oName[t.owner_id] ?? "Pemberi kerja"; });
  }
  const ratingsNamed = ratings.map((r) => ({ ...r, ownerName: ownerByTeam[r.team_member_id] ?? "Pemberi kerja" }));

  const completedCount = (workHistory ?? []).filter((w) => w.status === "terminated").length;
  const compItems = [
    !!row.full_name, !!row.profile_picture_url, !!row.location_place,
    (row.experience_months ?? 0) > 0 || (row.years_of_experience ?? 0) > 0,
    (row.skills?.length ?? 0) > 0, !!row.cv_url,
  ];
  const completeness = Math.round((compItems.filter(Boolean).length / compItems.length) * 100);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <ConnectionInbox viewerId={user.id} />
      </div>
      <WorkerProfileView
        b={row} workHistory={workHistory ?? []} ratings={ratingsNamed} avg={avg}
        ratingCount={visible.length} portfolio={portfolio ?? []}
        completedCount={completedCount} completeness={completeness}
        editHref="/dashboard/barista/profile?edit=1"
      />
    </>
  );
}
