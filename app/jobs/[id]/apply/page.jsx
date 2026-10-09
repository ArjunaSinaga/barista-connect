import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import BackButton from "@/components/jobs/BackButton";
import ApplyForm from "@/components/jobs/ApplyForm";
import { CafeLogo, skillTags } from "@/components/landing/LatestJobs";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { MapPin } from "lucide-react";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: "Ajukan Lamaran" };
}

// UI-07: halaman form lamaran penuh (bukan modal). Guest -> login, owner -> ditolak,
// sudah melamar -> status, loker tutup -> sembunyikan form.
export default async function ApplyPage({ params }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { user, profile } = await getSessionSafe();
  if (!user) redirect(`/login?next=/jobs/${id}/apply`);

  const supabase = await createClient();
  const { data: jobRow } = await supabase
    .from("job_posts")
    .select("*, cafes(id, name, location, address, photo_urls)")
    .eq("id", id)
    .maybeSingle();
  const { attachOwners } = await import("@/lib/publicProfiles");
  const [job] = await attachOwners(jobRow ? [jobRow] : [], supabase);
  if (!job || (!job.is_active && job.owner_id !== user.id)) notFound();

  if (profile?.role !== "barista") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-lg font-extrabold text-espresso">Hanya akun barista yang bisa melamar</h1>
        <p className="mt-1 text-sm text-espresso-soft">Kamu masuk sebagai pemilik usaha.</p>
        <Link href={`/jobs/${id}`} className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-sm font-bold text-white">
          Kembali ke Lowongan
        </Link>
      </div>
    );
  }

  const [{ data: bp }, { data: portfolio }, { data: existing }] = await Promise.all([
    supabase.from("barista_profiles").select("full_name, profile_picture_url, location_place, skills, cv_url, experience_months, years_of_experience").eq("id", user.id).maybeSingle(),
    supabase.from("barista_portfolio").select("id, image_url, caption").eq("barista_id", user.id).order("created_at", { ascending: false }).limit(9),
    supabase.from("applications").select("id, created_at").eq("job_post_id", job.id).eq("barista_id", user.id).maybeSingle(),
  ]);

  const types = job.employment_types?.length ? job.employment_types : job.employment_type ? [job.employment_type] : [];
  const cafeName = job.cafes?.name ?? job.owners?.business_name ?? "-";
  const tags = skillTags(job);

  return (
    <div className="min-h-screen bg-paper text-espresso">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <BackButton />
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Ajukan Lamaran</h1>
        <p className="mt-0.5 text-sm text-espresso-soft">Lengkapi informasi berikut untuk melamar posisi ini.</p>

        <div className="mt-4 grid items-start gap-5 lg:grid-cols-[1fr_300px]">
          <ApplyForm
            jobId={job.id}
            jobTypes={types}
            profile={bp}
            portfolio={portfolio ?? []}
            existingApp={existing}
            jobActive={job.is_active}
          />

          {/* Kanan: ringkasan loker */}
          <aside className="space-y-3 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
              <div className="flex gap-3">
                <CafeLogo job={job} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-espresso">{job.title}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-espresso-soft">
                    {cafeName}{job.owners?.is_verified && <VerifiedBadge size={12} />}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-espresso-soft">
                    <MapPin size={11} />{job.location}
                  </p>
                </div>
              </div>
              {job.salary_text && <p className="mt-2 text-sm font-extrabold text-espresso">{job.salary_text}</p>}
              <p className="mt-0.5 text-[11px] text-[#b6a98f]">
                {types.map((t) => EMPLOYMENT_LABELS[t] ?? t).join(" • ")} • {relativeTime(job.created_at)}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
              <h2 className="text-sm font-extrabold text-espresso">Tentang Pekerjaan</h2>
              <p className="mt-1.5 line-clamp-4 text-[13px] leading-6 text-espresso-soft">{job.description || "Belum ada deskripsi."}</p>
              <Link href={`/jobs/${job.id}`} className="mt-1.5 inline-block text-xs font-bold text-link hover:underline">
                Lihat detail lengkap →
              </Link>
            </div>

            {tags.length > 0 && (
              <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
                <h2 className="text-sm font-extrabold text-espresso">Keahlian yang Dibutuhkan</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.slice(0, 6).map((t) => (
                    <span key={t} className="rounded-full bg-[#efe9d9] px-2.5 py-1 text-[11px] font-semibold text-espresso-soft">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-[#fff8e8] p-5 text-xs">
              <p className="text-sm font-extrabold text-espresso">Tips agar lamaran dilirik</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 leading-relaxed text-espresso-soft">
                <li>Tulis cover note yang personal, bukan template.</li>
                <li>Pastikan profil dan CV sudah lengkap.</li>
                <li>Jawab pertanyaan seleksi dengan jujur.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
