import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Store, Briefcase } from "lucide-react";
import { createClient, getSessionSafe } from "@/lib/supabase/server";
import { Stars, avgStars, visibleCafeRatings } from "@/components/ratings/RatingForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: "Profil Cafe" };
}

export default async function CafePublicPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cafe } = await supabase
    .from("cafes")
    .select("*, owners ( id, business_name, avatar_url )")
    .eq("id", id)
    .maybeSingle();
  if (!cafe) notFound();

  await getSessionSafe();

  // Rating level cafe (blind): tim di cafe ini yang sudah saling menilai
  const { data: teams } = await supabase
    .from("team_members")
    .select("id")
    .eq("cafe_id", id);
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

  const { data: jobs } = await supabase
    .from("job_posts")
    .select("id, title, location, salary_text, employment_type, employment_types, created_at")
    .eq("cafe_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl card-dark shadow-sm">
        {(cafe.photo_urls ?? []).length > 0 && (
          <div className="grid grid-cols-2 gap-1 p-1">
            {cafe.photo_urls.slice(0, 4).map((url) => (
              <img key={url} src={url} alt={cafe.name} className="h-40 w-full object-cover rounded-xl" />
            ))}
          </div>
        )}
        <div className="px-6 pb-6 pt-4">
          <p className="text-xs font-bold tracking-widest text-caramel uppercase">
            {cafe.owners?.business_name}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-espresso">{cafe.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-espresso-soft">
            <MapPin size={13} className="text-caramel" />
            {cafe.address || cafe.location || "-"}
          </p>
          {avg && (
            <p className="mt-1.5 flex items-center gap-2">
              <Stars value={Math.round(avg)} size={16} />
              <span className="text-sm font-black text-espresso">{avg}/5</span>
              <span className="text-xs text-espresso-soft">({cafeRatings.length} ulasan)</span>
            </p>
          )}
          <p className="mt-2 text-sm">
            <Link href={`/owner/${cafe.owner_id}`} className="font-bold text-caramel hover:underline">
              Lihat pemilik & semua cabangnya →
            </Link>
          </p>
        </div>
      </div>

      <section className="mt-4 rounded-2xl card-dark p-6">
        <h2 className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-espresso uppercase">
          <Briefcase size={14} /> Lowongan aktif ({jobs?.length ?? 0})
        </h2>
        {(jobs ?? []).length === 0 && (
          <p className="mt-2 text-sm text-espresso-soft">Belum ada lowongan aktif di cafe ini.</p>
        )}
        <ul className="mt-3 space-y-2">
          {(jobs ?? []).map((j) => (
            <li key={j.id}>
              <Link href={`/jobs/${j.id}`} className="block rounded-xl bg-cream px-4 py-3 hover:bg-cream-dark">
                <p className="text-sm font-bold text-espresso">{j.title}</p>
                <p className="text-xs text-espresso-soft">{j.location} • {j.salary_text || "-"}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl card-dark p-6">
        <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">
          Ulasan barista ({cafeRatings.length})
        </h2>
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
            Belum ada ulasan. Ulasan tampil setelah kedua pihak saling menilai.
          </p>
        )}
      </section>
    </div>
  );
}
