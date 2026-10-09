import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Store,
  CalendarClock,
  Banknote,
  Briefcase,
  AlarmClock,
  Tag,
} from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import SaveButton from "@/components/jobs/SaveButton";
import BackButton from "@/components/jobs/BackButton";
import JobGallery from "@/components/jobs/JobGallery";
import JobShareButton from "@/components/jobs/JobShareButton";
import JobDetailTabs from "@/components/jobs/JobDetailTabs";
import { CafeLogo } from "@/components/landing/LatestJobs";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { avgStars } from "@/lib/ratings";
import { thumb } from "@/lib/img";

const TYPE_CLASSES = {
  full_time: "bg-caramel/10 text-caramel",
  part_time: "bg-blue-100 text-blue-700",
  casual: "bg-purple-100 text-purple-700",
};

const SHIFT_LABEL = { pagi: "Pagi", siang: "Siang", malam: "Malam", fleksibel: "Fleksibel" };
function detectShifts(job) {
  const hay = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  return Object.keys(SHIFT_LABEL).filter((k) => {
    const words = { pagi: ["pagi", "morning"], siang: ["siang", "sore"], malam: ["malam", "night"], fleksibel: ["fleksibel", "flexible", "bergilir"] }[k];
    return words.some((w) => hay.includes(w));
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Lowongan" };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("title, location")
      .eq("id", id)
      .maybeSingle();
    return {
      title: data ? `${data.title} — ${data.location}` : "Lowongan",
    };
  } catch {
    return { title: "Lowongan" };
  }
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;

  const { user, profile } = await getSessionSafe();
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: jobRow } = await supabase
    .from("job_posts")
    .select("*, cafes(id, name, location, address, photo_urls)")
    .eq("id", id)
    .maybeSingle();
  const { attachOwners } = await import("@/lib/publicProfiles");
  const [job] = await attachOwners(jobRow ? [jobRow] : [], supabase);

  // T-33: loker tak ada / nonaktif milik orang lain -> halaman "tidak ditemukan", bukan error generik.
  if (!job || (!job.is_active && job.owner_id !== user?.id)) notFound();

  const types = job.employment_types?.length
    ? job.employment_types
    : job.employment_type
      ? [job.employment_type]
      : [];
  const cafeName = job.cafes?.name ?? job.owners?.business_name ?? "-";
  const cafeHref = job.cafe_id ? `/cafes/${job.cafe_id}` : null;
  const photos = job.cafes?.photo_urls?.filter(Boolean) ?? [];
  const shifts = detectShifts(job);

  // Badge rating kafe: tampil segera setelah ada yang menilai
  let cafeAvg = null;
  let cafeCount = 0;
  let cafeReviews = [];
  {
    const { data: teams } = await supabase
      .from("team_members")
      .select("id")
      .eq("owner_id", job.owner_id);
    const tids = (teams ?? []).map((t) => t.id);
    if (tids.length) {
      const { data: cr } = await supabase.from("cafe_ratings").select("team_member_id, stars, comment, created_at").in("team_member_id", tids).order("created_at", { ascending: false }).limit(10);
      cafeCount = (cr ?? []).length;
      cafeAvg = avgStars(cr ?? []);
      cafeReviews = (cr ?? []).filter((r) => r.comment);
    }
  }

  let applied = false;
  let saved = false;
  let profileIncomplete = false;
  if (profile?.role === "barista") {
    const [{ data: app }, { data: sv }, { data: bp }] = await Promise.all([
      supabase.from("applications").select("id").eq("job_post_id", job.id).eq("barista_id", user.id).maybeSingle(),
      supabase.from("saved_jobs").select("job_post_id").eq("job_post_id", job.id).eq("barista_id", user.id).maybeSingle(),
      supabase.from("barista_profiles").select("full_name, profile_picture_url").eq("id", user.id).maybeSingle(),
    ]);
    applied = Boolean(app);
    saved = Boolean(sv);
    profileIncomplete = !bp?.full_name || !bp?.profile_picture_url;
  }

  // T-27/T-28: loker serupa — tipe sama, aktif, bukan loker ini.
  let similar = [];
  try {
    let sim = supabase.from("job_posts").select("id, title, location, salary_text, employment_types, employment_type, created_at, cafe_id, cafes(id, name)").eq("is_active", true).neq("id", job.id).order("created_at", { ascending: false }).limit(4);
    if (types.length) sim = sim.overlaps("employment_types", types);
    const { data } = await sim;
    const withOwners = await attachOwners(data ?? [], supabase);
    similar = withOwners;
  } catch { similar = []; }
  let similarSaved = new Set();
  if (profile?.role === "barista" && similar.length) {
    const { data: svAll } = await supabase.from("saved_jobs").select("job_post_id").eq("barista_id", user.id).in("job_post_id", similar.map((j) => j.id));
    similarSaved = new Set((svAll ?? []).map((s) => s.job_post_id));
  }
  const seeAllHref = `/jobs?q=${encodeURIComponent((job.title ?? "").split(" ")[0] ?? "")}`;

  const summaryRows = [
    { icon: Banknote, label: "Gaji", value: job.salary_text || "Lihat deskripsi" },
    { icon: Briefcase, label: "Jenis", value: types.map((t) => EMPLOYMENT_LABELS[t] ?? t).join(", ") || "-" },
    { icon: AlarmClock, label: "Shift", value: shifts.length ? shifts.map((s) => SHIFT_LABEL[s]).join(", ") : "Lihat deskripsi" },
    { icon: MapPin, label: "Lokasi", value: job.location || "-" },
    { icon: CalendarClock, label: "Diposting", value: relativeTime(job.created_at) },
    { icon: Clock, label: "Diperbarui", value: relativeTime(job.updated_at ?? job.created_at) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <BackButton />

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Kiri: galeri + judul + tabs */}
        <div className="min-w-0">
          <JobGallery photos={photos} cafeName={cafeName} />

          <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {job.owners?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                  <VerifiedBadge size={12} /> Perusahaan Terverifikasi
                </span>
              )}
              <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-espresso">{job.title}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-espresso-soft">
                {cafeHref ? (
                  <Link href={cafeHref} className="font-bold text-link hover:underline">{cafeName}</Link>
                ) : (
                  <span className="font-bold text-espresso">{cafeName}</span>
                )}
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1"><MapPin size={13} />{job.location}</span>
                <span aria-hidden="true">•</span>
                <span>{relativeTime(job.created_at)}</span>
              </p>
            </div>
            <JobShareButton jobId={job.id} title={job.title} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {types.map((t) => (
              <Badge key={t} classes={TYPE_CLASSES[t]}>{EMPLOYMENT_LABELS[t]}</Badge>
            ))}
          </div>

          {!job.is_active && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">
              Lowongan ini sudah ditutup — lamaran tidak lagi diterima. Lihat Lowongan Serupa di bawah.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            {profile?.role === "barista" ? (
              job.is_active && !applied && (
                <>
                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-coffee px-4 text-sm font-bold text-white hover:bg-[#2e2015]"
                  >
                    Lamar Sekarang
                  </Link>
                  <SaveButton jobId={job.id} initialSaved={saved} variant="full" />
                </>
              )
            ) : user ? (
              <p className="w-full rounded-xl bg-cream-dark px-4 py-3 text-xs font-semibold text-espresso-soft">
                Kamu masuk sebagai pemilik usaha. Hanya akun barista yang bisa melamar.
              </p>
            ) : (
              <Link
                href={`/jobs/${job.id}/apply`}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-coffee px-4 text-sm font-bold text-white hover:bg-[#2e2015]"
              >
                Lamar Sekarang
              </Link>
            )}
          </div>
          {profile?.role === "barista" && applied && (
            <Link href="/dashboard/barista/applications" className="mt-2 block text-center text-xs font-bold text-caramel hover:underline">
              Sudah dilamar — Lihat status lamaran →
            </Link>
          )}
          {profile?.role === "barista" && profileIncomplete && !applied && job.is_active && (
            <p className="mt-2 rounded-xl bg-caramel/10 px-4 py-2.5 text-xs font-bold text-caramel">
              Profilmu belum lengkap — pemilik kafe lebih melirik profil berfoto.{" "}
              <Link href="/dashboard/barista/profile" className="underline">Lengkapi dulu →</Link>
            </p>
          )}

          <div className="mt-6">
            <JobDetailTabs job={job} cafeName={cafeName} cafeHref={cafeHref} avg={cafeAvg} count={cafeCount} reviews={cafeReviews} />
          </div>

          {/* T-27..T-30: Lowongan Serupa */}
          {similar.length > 0 && (
            <section className="mt-8" aria-label="Lowongan serupa">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-espresso">Lowongan Serupa</h2>
                <Link href={seeAllHref} className="text-xs font-bold text-link hover:underline">Lihat semua →</Link>
              </div>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {similar.map((s) => {
                  const sName = s.cafes?.name ?? s.owners?.business_name ?? "-";
                  return (
                    <li key={s.id} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <CafeLogo job={s} />
                        <SaveButton jobId={s.id} initialSaved={similarSaved.has(s.id)} />
                      </div>
                      <Link href={`/jobs/${s.id}`} className="mt-2 block truncate text-sm font-extrabold text-espresso hover:text-matcha">
                        {s.title}
                      </Link>
                      <p className="truncate text-xs text-espresso-soft">{sName}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-espresso-soft">
                        <MapPin size={11} aria-hidden="true" />{s.location}
                      </p>
                      {s.salary_text && <p className="mt-0.5 text-[11px] font-bold text-espresso">{s.salary_text}</p>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Kanan: Ringkasan Lowongan (T-24) */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
              <Tag size={14} /> Ringkasan Lowongan
            </h2>
            <dl className="mt-3 space-y-2.5">
              {summaryRows.map((r) => (
                <div key={r.label} className="flex items-start gap-2.5 text-[13px]">
                  <r.icon size={15} className="mt-0.5 shrink-0 text-caramel" aria-hidden="true" />
                  <dt className="w-20 shrink-0 text-espresso-soft">{r.label}</dt>
                  <dd className="min-w-0 flex-1 font-bold text-espresso">{r.value}</dd>
                </div>
              ))}
            </dl>
            {job.cafes?.photo_urls?.[0] && (
              <Image src={thumb(job.cafes.photo_urls[0], { w: 400 })} alt={cafeName} width={400} height={120} className="mt-4 h-28 w-full rounded-xl object-cover" />
            )}
            {cafeHref && (
              <Link href={cafeHref} className="mt-3 block rounded-full border border-[#e0d5bd] px-4 py-2 text-center text-xs font-bold text-espresso hover:border-coffee">
                Lihat Profil Perusahaan
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
