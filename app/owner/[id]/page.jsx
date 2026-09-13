import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getSessionSafe } from "@/lib/supabase/server";
import OwnerProfileView from "@/components/owner/OwnerProfileView";
import { avgStars, visibleCafeRatings } from "@/components/ratings/RatingForm";

export async function generateMetadata() {
  return { title: "Profil Coffee Shop" };
}

export default async function OwnerPublicPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: o } = await supabase.from("owners").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();

  const { user, profile } = await getSessionSafe();
  const isSelf = user?.id === id;
  const isBarista = profile?.role === "barista";

  const { data: teams } = await supabase.from("team_members").select("id").eq("owner_id", id);
  const teamIds = (teams ?? []).map((t) => t.id);
  let cafeRatings = [];
  if (teamIds.length) {
    const [{ data: cr }, { data: or }] = await Promise.all([
      supabase.from("cafe_ratings").select("team_member_id, stars, comment, created_at").in("team_member_id", teamIds).order("created_at", { ascending: false }).limit(20),
      supabase.from("ratings").select("team_member_id").in("team_member_id", teamIds),
    ]);
    cafeRatings = visibleCafeRatings(or ?? [], cr ?? []);
  }
  const avg = avgStars(cafeRatings);

  const { data: cafes } = await supabase.from("cafes").select("id, name, location, photo_urls").eq("owner_id", id).eq("is_active", true).order("created_at", { ascending: true }).limit(20);

  let myTeam = null;
  let myRating = null;
  if (isBarista) {
    const { data: mine } = await supabase.from("team_members").select("id, status").eq("owner_id", id).eq("barista_id", user.id).eq("status", "terminated").order("hired_at", { ascending: false }).limit(1);
    myTeam = mine?.[0] ?? null;
    if (myTeam) {
      const { data: r } = await supabase.from("cafe_ratings").select("id, stars, comment, updated_at").eq("team_member_id", myTeam.id).maybeSingle();
      myRating = r ?? null;
    }
  }

  return (
    <>
      <OwnerProfileView
        o={o} cafes={cafes ?? []} cafeRatings={cafeRatings} avg={avg}
        isSelf={isSelf} isBarista={isBarista} viewerId={user?.id ?? null}
        myTeam={myTeam} myRating={myRating}
        editHref={isSelf ? "/dashboard/owner/profile?edit=1" : null}
      />
      {!isSelf && (
        <div className="mx-auto max-w-3xl px-4 pb-8">
          <Link href="/jobs" className="text-sm font-bold text-caramel hover:underline">← Lihat lowongan</Link>
        </div>
      )}
    </>
  );
}
