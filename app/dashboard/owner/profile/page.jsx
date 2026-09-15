import Link from "next/link";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import BusinessForm from "@/components/owner/BusinessForm";
import OwnerProfileView from "@/components/owner/OwnerProfileView";
import { avgStars, visibleCafeRatings } from "@/lib/ratings";

export const metadata = { title: "Data Bisnis" };

export default async function OwnerProfilePage({ searchParams }) {
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const params = await searchParams;

  const supabase = await createClient();
  const { data: row } = await supabase.from("owners").select("*").eq("id", user.id).maybeSingle();

  if (params?.edit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/dashboard/owner/profile" className="text-sm font-bold text-caramel hover:underline">
          ← Kembali ke profil
        </Link>
        <div className="mt-4"><BusinessForm initial={row ?? null} /></div>
      </div>
    );
  }

  const { data: teams } = await supabase.from("team_members").select("id").eq("owner_id", user.id);
  const teamIds = (teams ?? []).map((t) => t.id);
  let cafeRatings = [];
  if (teamIds.length) {
    const [{ data: cr }, { data: or }] = await Promise.all([
      supabase.from("cafe_ratings").select("team_member_id, stars, comment, created_at").in("team_member_id", teamIds).order("created_at", { ascending: false }).limit(20),
      supabase.from("ratings").select("team_member_id").in("team_member_id", teamIds),
    ]);
    cafeRatings = visibleCafeRatings(or ?? [], cr ?? []);
  }
  const { data: cafes } = await supabase.from("cafes").select("id, name, location, photo_urls").eq("owner_id", user.id).eq("is_active", true).order("created_at", { ascending: true }).limit(20);

  return (
    <OwnerProfileView
      o={row ?? { id: user.id, business_name: "Bisnismu", location: "-" }}
      cafes={cafes ?? []} cafeRatings={cafeRatings} avg={avgStars(cafeRatings)}
      isSelf viewerId={user.id} editHref="/dashboard/owner/profile?edit=1"
    />
  );
}
