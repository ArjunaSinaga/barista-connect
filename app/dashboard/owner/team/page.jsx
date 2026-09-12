import Link from "next/link";
import { UsersRound } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { STATUS_META } from "@/lib/constants";
import { Stars } from "@/components/ratings/RatingForm";

export const metadata = { title: "Tim Saya" };

export default async function TeamPage() {
  if (!isSupabaseConfigured()) return null;
  const { user } = await getSessionSafe();
  if (!user) return null;
  const supabase = await createClient();

  // Semua lowongan owner ini
  const { data: jobs } = await supabase
    .from("job_posts")
    .select("id, title")
    .eq("owner_id", user.id);
  const jobMap = {};
  (jobs ?? []).forEach((j) => { jobMap[j.id] = j.title; });
  const jobIds = Object.keys(jobMap);
  if (!jobIds.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={<UsersRound size={22} />}
          title="Belum ada tim"
          subtitle="Terima pelamar di lowonganmu, mereka akan tercatat di sini."
          actionLabel="Ke Dashboard"
          actionHref="/dashboard/owner"
        />
      </div>
    );
  }

  // Pekerja yang diterima / pernah bekerja (termasuk yang dikeluarkan)
  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, status, job_post_id, created_at,
       barista_profiles ( id, full_name, profile_picture_url, location_place, years_of_experience )`
    )
    .in("job_post_id", jobIds)
    .in("status", ["accepted", "terminated"])
    .order("created_at", { ascending: false });

  const appIds = (apps ?? []).map((a) => a.id);
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
        Tim Saya ({apps?.length ?? 0})
      </h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Pekerja yang kamu terima. Klik nama untuk kasih/ubah rating di halaman pelamar.
      </p>

      <div className="mt-5 space-y-3 pb-8">
        {(!apps || !apps.length) && (
          <EmptyState
            icon={<UsersRound size={22} />}
            title="Belum ada pekerja"
            subtitle="Belum ada pelamar yang diterima."
            actionLabel="Lihat Lowongan"
            actionHref="/dashboard/owner"
          />
        )}
        {(apps ?? []).map((app) => {
          const b = app.barista_profiles;
          const r = ratingMap[app.id];
          const meta = STATUS_META[app.status];
          return (
            <div key={app.id} className="rounded-2xl card-dark p-4 flex items-center gap-4">
              <Avatar src={b?.profile_picture_url} name={b?.full_name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/dashboard/owner/jobs/${app.job_post_id}/applicants`}
                    className="truncate font-bold text-espresso hover:text-caramel"
                  >
                    {b?.full_name ?? "Barista"}
                  </Link>
                  <Badge classes={meta.classes}>{meta.label}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-espresso-soft">
                  {jobMap[app.job_post_id] ?? "Lowongan"} • {b?.location_place ?? "-"} • {b?.years_of_experience ?? 0} th pengalaman
                </p>
                <div className="mt-1">
                  {r ? (
                    <span className="inline-flex items-center gap-2">
                      <Stars value={r.stars} size={14} />
                      {r.comment && (
                        <span className="truncate text-xs text-espresso-soft italic">“{r.comment}”</span>
                      )}
                    </span>
                  ) : (
                    <Link
                      href={`/dashboard/owner/jobs/${app.job_post_id}/applicants`}
                      className="text-xs font-bold text-caramel hover:underline"
                    >
                      Belum dirating — kasih rating →
                    </Link>
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
