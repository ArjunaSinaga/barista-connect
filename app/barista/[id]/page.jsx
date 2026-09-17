import { notFound } from "next/navigation";
import { createClient, getSessionSafe } from "@/lib/supabase/server";
import { avgStars, visibleOwnerRatings } from "@/lib/ratings";
import BaristaProfileView from "@/components/barista/BaristaProfileView";

export async function generateMetadata() {
  return { title: "Profil Barista" };
}

export default async function BaristaPublicPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: b } = await supabase.from("baristas_public").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();

  const { user, profile } = await getSessionSafe();
  const isSelf = user?.id === b.id;
  const isOwner = profile?.role === "owner";

  const { data: workRaw } = await supabase
    .from("team_members")
    .select("job_title, status, hired_at, owner_id")
    .eq("barista_id", id)
    .in("status", ["active", "terminated"])
    .order("hired_at", { ascending: false })
    .limit(10);
  const ownerIds = [...new Set((workRaw ?? []).map((w) => w.owner_id).filter(Boolean))];
  const { data: ownerRows } = ownerIds.length
    ? await supabase.from("owners_public").select("id, business_name").in("id", ownerIds)
    : { data: [] };
  const ownerMap = new Map((ownerRows ?? []).map((o) => [o.id, o]));
  const workHistory = (workRaw ?? []).map((w) => ({ ...w, owners: ownerMap.get(w.owner_id) ?? null }));

  const { data: ownerRatings } = await supabase
    .from("ratings")
    .select("team_member_id, stars, comment, created_at")
    .eq("barista_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  const ratings = visibleOwnerRatings(ownerRatings);
  const avg = avgStars(ratings);

  let rateableTeam = null;
  let myRating = null;
  if (isOwner) {
    const { data: teams } = await supabase.from("team_members").select("id").eq("owner_id", user.id).eq("barista_id", id).order("hired_at", { ascending: false }).limit(1);
    rateableTeam = teams?.[0] ?? null;
    if (rateableTeam) {
      const { data: r } = await supabase.from("ratings").select("id, stars, comment, updated_at").eq("team_member_id", rateableTeam.id).maybeSingle();
      myRating = r ?? null;
    }
  }

  return (
    <BaristaProfileView
      b={b} workHistory={workHistory ?? []} ratings={ratings} avg={avg}
      isSelf={isSelf} isOwner={isOwner} viewerId={user?.id ?? null}
      rateableTeam={rateableTeam} myRating={myRating}
      editHref={isSelf ? "/dashboard/barista/profile?edit=1" : null}
    />
  );
}
