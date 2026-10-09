import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, CalendarClock, FileText, MessageCircle, CheckCircle2 } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BackButton from "@/components/jobs/BackButton";
import { CafeLogo } from "@/components/landing/LatestJobs";
import { STATUS_META, EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

const STAGES = ["Lamaran Dikirim", "Lamaran Dilihat", "Lanjut Interview", "Diterima"];

function stageIdx(status) {
  if (status === "pending") return 0;
  if (status === "viewed") return 1;
  if (status === "accepted" || status === "terminated") return 3;
  return -1;
}

// EMAPP-14: detail satu lamaran — timeline rekrutmen penuh + konteks job/employer.
// Waktu tahap selain Dikirim tidak ditampilkan: DB hanya menyimpan created_at,
// jadi stempel tahap lain tidak dikarang (EMAPP-29).
export default async function ApplicationDetailPage({ params }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const { user, profile } = await getSessionSafe();
  if (profile?.role !== "barista" || !user) notFound();

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, status, message, cover_letter, cv_url, employment_types, created_at,
       job_posts ( id, title, location, salary_text, employment_type, employment_types, is_active, owner_id,
                   cafes ( name ), owners ( business_name, is_verified ) )`
    )
    .eq("id", id)
    .eq("barista_id", user.id)
    .maybeSingle();
  if (!app) notFound();

  const job = app.job_posts;
  const meta = STATUS_META[app.status] ?? STATUS_META.pending;
  const cur = stageIdx(app.status);
  const rejected = app.status === "rejected";
  const accepted = app.status === "accepted" || app.status === "terminated";
  const cafeName = job?.cafes?.name ?? job?.owners?.business_name ?? "-";
  const types = app.employment_types?.length ? app.employment_types : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <BackButton />

      <div className="mt-4 rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <CafeLogo job={job ?? {}} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold text-espresso">{job?.title ?? "Lowongan dihapus"}</h1>
            <p className="flex items-center gap-1 truncate text-sm text-espresso-soft">
              {cafeName}{job?.owners?.is_verified && <VerifiedBadge size={13} />}
            </p>
            {job && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso-soft">
                <MapPin size={12} />{job.location}
              </p>
            )}
          </div>
          <Badge classes={meta.classes}>{app.status === "terminated" ? "Selesai" : meta.label}</Badge>
        </div>

        {/* Stepper + tanggal kirim (satu-satunya stempel yang pasti ada) */}
        <ol className="mt-5 flex items-start" aria-label="Timeline lamaran">
          {STAGES.map((s, i) => {
            const reached = cur >= 0 && i <= cur;
            const isCur = i === cur;
            return (
              <li key={s} className="flex flex-1 flex-col items-center gap-1">
                <span className={`h-2 w-full rounded-full ${reached ? "bg-caramel" : rejected && i === 0 ? "bg-red-400" : "bg-latte"}`} aria-hidden="true" />
                <span className={`text-center text-[11px] leading-tight font-bold ${isCur ? "text-espresso" : "text-espresso-soft/70"}`}>{s}</span>
                {i === 0 && (
                  <span className="text-[10px] text-[#b6a98f]">{relativeTime(app.created_at)}</span>
                )}
              </li>
            );
          })}
        </ol>

        {rejected && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">
            Perusahaan tidak melanjutkan lamaranmu. Tahap berhenti di sini.
          </p>
        )}

        {accepted && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-center">
            <CheckCircle2 size={26} className="mx-auto text-green-600" />
            <p className="mt-1.5 text-sm font-extrabold text-espresso">Selamat, Anda Diterima!</p>
            <p className="mt-0.5 text-xs leading-5 text-espresso-soft">
              Perusahaan akan menghubungimu via pesan untuk langkah onboarding berikutnya. Pastikan kontakmu aktif.
            </p>
            {job?.owner_id && (
              <Link href="/messages" className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white">
                <MessageCircle size={13} className="mr-1.5" /> Buka Pesan
              </Link>
            )}
          </div>
        )}

        {/* Jadwal interview: hanya bila ada data — tidak dikarang. Sementara via pesan. */}
        <div className="mt-4 rounded-xl bg-[#faf7ef] p-4">
          <h2 className="text-sm font-extrabold text-espresso">Jadwal Interview</h2>
          <p className="mt-1 text-[13px] leading-6 text-espresso-soft">
            Jadwal dan instruksi interview diatur perusahaan lewat pesan. Belum ada jadwal yang tercatat untuk lamaran ini.
          </p>
          {job?.owner_id && (
            <Link href="/messages" className="mt-2 inline-block text-xs font-bold text-link hover:underline">
              Lihat Pesan →
            </Link>
          )}
        </div>

        {app.cover_letter && (
          <div className="mt-4">
            <h2 className="text-sm font-extrabold text-espresso">Cover Letter Kamu</h2>
            <p className="mt-1.5 rounded-xl bg-cream px-4 py-3 text-sm leading-6 whitespace-pre-line text-espresso-soft">{app.cover_letter}</p>
          </div>
        )}

        <dl className="mt-4 space-y-2 border-t border-[#efe9d9] pt-4 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-espresso-soft">Dilamar</dt>
            <dd className="font-bold text-espresso">{relativeTime(app.created_at)}</dd>
          </div>
          {job?.salary_text && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-espresso-soft">Gaji</dt>
              <dd className="font-bold text-espresso">{job.salary_text}</dd>
            </div>
          )}
          {types.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-espresso-soft">Tipe</dt>
              <dd className="font-bold text-espresso">{types.map((t) => EMPLOYMENT_LABELS[t] ?? t).join(", ")}</dd>
            </div>
          )}
          {app.cv_url && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-espresso-soft">CV terkirim</dt>
              <dd>
                <a href={app.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-link hover:underline">
                  <FileText size={13} /> Lihat CV
                </a>
              </dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-espresso-soft">Lowongan</dt>
            <dd>
              {job?.id ? (
                <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1 font-bold text-link hover:underline">
                  <CalendarClock size={13} /> Lihat halaman loker
                </Link>
              ) : (
                <span className="font-bold text-espresso-soft">Loker sudah dihapus</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
