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

  const { data: b } = await supabase.from("barista_profiles").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();

  const { user, profile } = await getSessionSafe();
  const isSelf = user?.id === b.id;
  const isOwner = profile?.role === "owner";

  const { data: workHistory } = await supabase
    .from("team_members")
    .select("job_title, status, hired_at, owner_id, owners ( business_name )")
    .eq("barista_id", id)
    .in("status", ["active", "terminated"])
    .order("hired_at", { ascending: false })
    .limit(10);

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
