import Link from "next/link";
import { UsersRound } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { Stars } from "@/components/ratings/RatingForm";
import TeamRemoveButton from "@/components/owner/TeamRemoveButton";

export const metadata = { title: "Tim Saya" };

const TEAM_META = {
  active: { label: "Aktif", classes: "bg-green-100 text-green-700" },
  terminated: { label: "Keluar", classes: "bg-gray-200 text-gray-600" },
};

export default async function TeamPage() {
  if (!isSupabaseConfigured()) return null;
  const { user } = await getSessionSafe();
  if (!user) return null;
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("team_members")
    .select(
      `id, status, job_title, job_post_id, application_id, hired_at, barista_id,
       barista_profiles ( id, full_name, profile_picture_url, location_place, years_of_experience )`
    )
    .eq("owner_id", user.id)
    .in("status", ["active", "terminated"])
    .order("hired_at", { ascending: false });

  const teamIds = (members ?? []).map((m) => m.id);
  let ratingMap = {};
  let pairedSet = new Set();
  if (teamIds.length) {
    const { data: ratings } = await supabase
      .from("ratings")
      .select("team_member_id, stars, comment")
      .in("team_member_id", teamIds);
    (ratings ?? []).forEach((r) => { ratingMap[r.team_member_id] = r; });
    // Blind review: rating owner tampil setelah barista menilai balik
    const { data: pairs } = await supabase
      .from("cafe_ratings")
      .select("team_member_id")
      .in("team_member_id", teamIds);
    pairedSet = new Set((pairs ?? []).map((r) => r.team_member_id));
  }

  // Grup: 1 baris per barista, tiap lowongan jadi sub-baris
  const grouped = [];
  const byBarista = new Map();
  for (const m of members ?? []) {
    if (!byBarista.has(m.barista_id)) {
      const g = { baristaId: m.barista_id, profile: m.barista_profiles, jobs: [] };
      byBarista.set(m.barista_id, g);
      grouped.push(g);
    }
    byBarista.get(m.barista_id).jobs.push(m);
  }
  for (const g of grouped) {
    g.isActive = g.jobs.some((j) => j.status === "active");
    g.memberIds = g.jobs.map((j) => j.id);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-bold tracking-widest text-caramel uppercase">Owner</p>
      <h1 className="mt-1 text-2xl font-extrabold text-espresso">
        Tim Saya ({grouped.length})
      </h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Satu baris per orang. Riwayat cafe tempat ia bekerja tampil di profilnya.
      </p>

      <div className="mt-5 space-y-3 pb-8">
        {grouped.length === 0 && (
          <EmptyState
            icon={<UsersRound size={22} />}
            title="Belum ada pekerja"
            subtitle="Belum ada pelamar yang diterima."
            actionLabel="Lihat Lowongan"
            actionHref="/dashboard/owner"
          />
        )}
        {grouped.map((g) => {
          const b = g.profile;
          const meta = g.isActive ? TEAM_META.active : TEAM_META.terminated;
          return (
            <div key={g.baristaId} className="rounded-2xl card-dark p-4">
              <div className="flex items-center gap-4">
                <Avatar src={b?.profile_picture_url} name={b?.full_name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="truncate font-bold text-espresso">
                      {b?.full_name ?? "Barista"}
                    </span>
                    <Badge classes={meta.classes}>{meta.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-espresso-soft">
                    {b?.location_place ?? "-"} • {b?.years_of_experience ?? 0} th pengalaman • {g.jobs.length} lowongan
                  </p>
                </div>
                <Link
                  href={`/barista/${b?.id}`}
                  className="shrink-0 text-xs font-bold text-espresso-soft hover:text-caramel"
                >
                  Profil →
                </Link>
                <TeamRemoveButton memberIds={g.memberIds} name={b?.full_name ?? "Barista"} />
              </div>
              <ul className="mt-3 space-y-2 border-t border-latte/60 pt-3">
                {g.jobs.map((m) => {
                  const r = ratingMap[m.id] ?? null;
                  const jm = TEAM_META[m.status] ?? TEAM_META.active;
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-espresso-soft">
                        <span className="font-bold text-espresso">{m.job_title || "Lowongan"}</span>
                        {" "}· <Badge classes={jm.classes}>{jm.label}</Badge>
                      </span>
                      {r ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5">
                          <Stars value={r.stars} size={12} />
                          {!pairedSet.has(m.id) && (
                            <span className="text-[11px] text-espresso-soft">· menunggu balasan</span>
                          )}
                        </span>
                      ) : m.application_id && m.job_post_id ? (
                        <Link
                          href={`/dashboard/owner/jobs/${m.job_post_id}/applicants`}
                          className="shrink-0 font-bold text-caramel hover:underline"
                        >
                          Kasih rating →
                        </Link>
                      ) : (
                        <Link
                          href={`/barista/${b?.id}`}
                          className="shrink-0 font-bold text-caramel hover:underline"
                        >
                          Nilai di profil →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
