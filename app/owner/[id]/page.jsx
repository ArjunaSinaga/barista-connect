import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Store } from "lucide-react";
import { createClient, getSessionSafe } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";
import StartChatButton from "@/components/chat/StartChatButton";
import CafeRatingForm from "@/components/ratings/CafeRatingForm";
import { Stars, avgStars, visibleCafeRatings } from "@/components/ratings/RatingForm";

export async function generateMetadata({ params }) {
  return { title: "Profil Coffee Shop" };
}

export default async function OwnerPublicPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: o } = await supabase
    .from("owners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!o) notFound();

  const { user, profile } = await getSessionSafe();
  const isBarista = profile?.role === "barista";

  // Blind review: rating cafe tampil publik hanya jika owner menilai balik
  const { data: teams } = await supabase
    .from("team_members")
    .select("id")
    .eq("owner_id", id);
  const teamIds = (teams ?? []).map((t) => t.id);
  let cafeRatings = [];
  let ownerCount = 0;
  if (teamIds.length) {
    const [{ data: cr }, { data: or }] = await Promise.all([
      supabase.from("cafe_ratings").select("team_member_id, stars, comment, created_at").in("team_member_id", teamIds).order("created_at", { ascending: false }).limit(20),
      supabase.from("ratings").select("team_member_id").in("team_member_id", teamIds),
    ]);
    cafeRatings = visibleCafeRatings(or ?? [], cr ?? []);
    ownerCount = (or ?? []).length;
  }
  const avg = avgStars(cafeRatings);

  const { data: cafes } = await supabase
    .from("cafes")
    .select("id, name, location, photo_urls")
    .eq("owner_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(20);

  // Form untuk barista yang sudah selesai bekerja di sini
  let myTeam = null;
  let myRating = null;
  if (isBarista) {
    const { data: mine } = await supabase
      .from("team_members")
      .select("id, status")
      .eq("owner_id", id)
      .eq("barista_id", user.id)
      .eq("status", "terminated")
      .order("hired_at", { ascending: false })
      .limit(1);
    myTeam = mine?.[0] ?? null;
    if (myTeam) {
      const { data: r } = await supabase
        .from("cafe_ratings")
        .select("id, stars, comment, updated_at")
        .eq("team_member_id", myTeam.id)
        .maybeSingle();
      myRating = r ?? null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl card-dark shadow-sm">
        <div className="h-24 bg-gradient-to-r from-latte/70 via-cream-dark to-caramel/30 sm:h-28" />
        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar src={o.avatar_url} name={o.business_name} size="xl" className="border-4 border-white shadow-md" />
              <div className="pb-1">
                <h1 className="text-2xl font-extrabold text-espresso">{o.business_name}</h1>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-espresso-soft">
                  <MapPin size={13} className="text-caramel" />
                  {o.location}
                </p>
                {avg && (
                  <p className="mt-1.5 flex items-center gap-2">
                    <Stars value={Math.round(avg)} size={16} />
                    <span className="text-sm font-black text-espresso">{avg}/5</span>
                    <span className="text-xs text-espresso-soft">({cafeRatings.length} ulasan)</span>
                  </p>
                )}
              </div>
            </div>
            {isBarista && (
              <div className="w-full sm:w-auto">
                <StartChatButton ownerId={id} baristaId={user.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-4 rounded-2xl card-dark p-6">
        <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">
          Cabang ({cafes?.length ?? 0})
        </h2>
        {(cafes ?? []).length === 0 && (
          <p className="mt-2 text-sm text-espresso-soft">Belum ada cafe terdaftar.</p>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(cafes ?? []).map((c) => (
            <Link key={c.id} href={`/cafes/${c.id}`} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2.5 hover:bg-cream-dark">
              {c.photo_urls?.[0] ? (
                <img src={c.photo_urls[0]} alt={c.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cream-dark text-caramel">
                  <Store size={20} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-espresso">{c.name}</span>
                <span className="block truncate text-xs text-espresso-soft">{c.location || "-"}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl card-dark p-6">
        <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">
          Rating dari barista ({cafeRatings.length})
        </h2>
        {isBarista && myTeam && (
          <div className="mt-3">
            <CafeRatingForm
              teamMemberId={myTeam.id}
              ownerId={id}
              baristaId={user.id}
              isTerminated
              existing={myRating}
            />
          </div>
        )}
        {isBarista && !myTeam && (
          <p className="mt-2 text-sm text-espresso-soft">
            Kamu bisa menilai cafe ini setelah selesai bekerja di sini.
          </p>
        )}
        {cafeRatings.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {cafeRatings.filter((r) => r.comment).slice(0, 10).map((r, i) => (
              <li key={i} className="rounded-xl bg-cream px-4 py-3">
                <Stars value={r.stars} size={12} />
                <p className="mt-1 text-sm text-espresso italic">“{r.comment}”</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-espresso-soft">
            Belum ada ulasan publik. Ulasan tampil setelah kedua pihak saling menilai.
          </p>
        )}
      </section>

      <div className="mt-4">
        <Link href="/jobs" className="text-sm font-bold text-caramel hover:underline">
          ← Lihat lowongan
        </Link>
      </div>
    </div>
  );
}
