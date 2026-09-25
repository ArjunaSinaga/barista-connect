import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import ProfileEditor from "@/components/barista/ProfileEditor";
import BaristaProfileView from "@/components/barista/BaristaProfileView";

export const metadata = { title: "Profil Saya" };

export default async function BaristaProfilePage({ searchParams }) {
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const params = await searchParams;

  const supabase = await createClient();
  const { data: row } = await supabase.from("barista_profiles").select("*").eq("id", user.id).maybeSingle();
  if (!row) notFound();

  if (params?.edit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/dashboard/barista/profile" className="text-sm font-bold text-caramel hover:underline">
          ← Kembali ke profil
        </Link>
        <div className="mt-4"><ProfileEditor initial={row} /></div>
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

  return (
    <BaristaProfileView
      b={row} workHistory={workHistory ?? []} ratings={ratings} avg={avg}
      isSelf viewerId={user.id} editHref="/dashboard/barista/profile?edit=1"
    />
  );
}
