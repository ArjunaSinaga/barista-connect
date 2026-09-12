import Link from "next/link";
import { UsersRound } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { Stars } from "@/components/ratings/RatingForm";

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
      `id, status, job_title, job_post_id, application_id, hired_at,
       barista_profiles ( id, full_name, profile_picture_url, location_place, years_of_experience )`
    )
    .eq("owner_id", user.id)
    .order("hired_at", { ascending: false });

  const appIds = (members ?? []).map((m) => m.application_id).filter(Boolean);
  let ratingMap = {};
  if (appIds.length) {
    const { data: ratings } = await supabase
      .from("ratings")
      .select("application_id, stars, comment")
      .in("application_id", appIds);
    (ratings ?? []).forEach((r) => { ratingMap[r.application_id] = r; });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-bold tracking-widest text-caramel uppercase">Owner</p>
      <h1 className="mt-1 text-2xl font-extrabold text-espresso">
        Tim Saya ({members?.length ?? 0})
      </h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Pekerja yang kamu terima otomatis tercatat di sini — tetap ada walau lowongannya dihapus.
      </p>

      <div className="mt-5 space-y-3 pb-8">
        {(!members || !members.length) && (
          <EmptyState
            icon={<UsersRound size={22} />}
            title="Belum ada pekerja"
            subtitle="Belum ada pelamar yang diterima."
            actionLabel="Lihat Lowongan"
            actionHref="/dashboard/owner"
          />
        )}
        {(members ?? []).map((m) => {
          const b = m.barista_profiles;
          const r = m.application_id ? ratingMap[m.application_id] : null;
          const meta = TEAM_META[m.status] ?? TEAM_META.active;
          return (
            <div key={m.id} className="rounded-2xl card-dark p-4 flex items-center gap-4">
              <Avatar src={b?.profile_picture_url} name={b?.full_name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="truncate font-bold text-espresso">
                    {b?.full_name ?? "Barista"}
                  </span>
                  <Badge classes={meta.classes}>{meta.label}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-espresso-soft">
                  {m.job_title || "Lowongan"} • {b?.location_place ?? "-"} • {b?.years_of_experience ?? 0} th pengalaman
                </p>
                <div className="mt-1">
                  {r ? (
                    <span className="inline-flex items-center gap-2">
                      <Stars value={r.stars} size={14} />
                      {r.comment && (
                        <span className="truncate text-xs text-espresso-soft italic">“{r.comment}”</span>
                      )}
                    </span>
                  ) : m.application_id && m.job_post_id ? (
                    <Link
                      href={`/dashboard/owner/jobs/${m.job_post_id}/applicants`}
                      className="text-xs font-bold text-caramel hover:underline"
                    >
                      Belum dirating — kasih rating →
                    </Link>
                  ) : (
                    <span className="text-xs text-espresso-soft italic">Riwayat lamaran sudah diarsip</span>
                  )}
                </div>
              </div>
              <Link
                href={`/barista/${b?.id}`}
                className="shrink-0 text-xs font-bold text-espresso-soft hover:text-caramel"
              >
                Profil →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
