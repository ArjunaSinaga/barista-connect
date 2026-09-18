import Link from "next/link";
import { Briefcase, FileText, CheckCheck, FlagOff, MessagesSquare, ArrowRight } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { STATUS_META } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import BaristaShell from "@/components/barista/BaristaShell";
import ApplicationsList from "@/components/barista/ApplicationsList";
import JobListRow from "@/components/jobs/JobListRow";

export const metadata = { title: "Dashboard Barista" };

export default async function BaristaDashboardPage({ searchParams }) {
  const params = await searchParams;
  const tab = (params?.tab ?? "ringkasan").toString();
  if (!isSupabaseConfigured()) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-bold text-espresso">Koneksi database belum siap.</p>
        <p className="mt-1 text-sm text-espresso-soft">Coba muat ulang halaman ini.</p>
      </div>
    );
  }
  const { user, profile } = await getSessionSafe();
  if (!user) {
    return (
      <div className="p-8 text-center">
        Silakan login di <a href="/login" className="text-caramel underline">/login</a>.
      </div>
    );
  }
  const supabase = await createClient();
  const { data: bp } = await supabase.from("barista_profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: apps } = await supabase
    .from("applications")
    .select("id, status, created_at, job_post_id, job_posts ( id, title )")
    .eq("barista_id", user.id)
    .order("created_at", { ascending: false });
  const jobOwnerIds = [...new Set((apps ?? []).map((a) => a.job_posts?.id).filter(Boolean))];
  const { data: jobs } = jobOwnerIds.length
    ? await supabase.from("job_posts").select("id, owner_id").in("id", jobOwnerIds)
    : { data: [] };
  const jobMap = new Map((jobs ?? []).map((j) => [j.id, j.owner_id]));
  const oIds = [...new Set([...jobMap.values()].filter(Boolean))];
  const { data: owners } = oIds.length
    ? await supabase.from("owners_public").select("id, business_name").in("id", oIds)
    : { data: [] };
  const oMap = new Map((owners ?? []).map((o) => [o.id, o.business_name]));
  const ownerMap = new Map((apps ?? []).map((a) => [a.id, oMap.get(jobMap.get(a.job_post_id)) ?? null]));

  const list = apps ?? [];
  const count = (s) => list.filter((a) => a.status === s).length;
  const total = list.length;
  const waiting = count("pending") + count("viewed");
  const accepted = count("accepted");
  const done = count("terminated");
  const recent = list.slice(0, 3);
  const appliedIds = new Set(list.map((a) => a.job_post_id));

  // Loker tersimpan + terbaru (rail kanan + tab tersimpan)
  const { data: saved } = await supabase.from("saved_jobs").select("job_post_id").eq("barista_id", user.id);
  const savedIds = new Set((saved ?? []).map((s) => s.job_post_id));
  let savedJobs = [];
  if (savedIds.size) {
    const { data: sj } = await supabase
      .from("job_posts")
      .select("*, cafes(id, name)")
      .in("id", [...savedIds])
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const { attachOwners } = await import("@/lib/publicProfiles");
    savedJobs = await attachOwners(sj ?? [], supabase);
  }
  const { data: latestJobs } = await supabase
    .from("job_posts")
    .select("id, title, location")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // Rating yang kuterima (via tim)
  let ratingAvg = null;
  let ratingCount = 0;
  try {
    const { data: teams } = await supabase.from("team_members").select("id").eq("barista_id", user.id);
    const tids = (teams ?? []).map((t) => t.id);
    if (tids.length) {
      const { data: rs } = await supabase.from("ratings").select("stars").in("team_member_id", tids);
      const stars = (rs ?? []).map((r) => r.stars).filter((s) => typeof s === "number");
      if (stars.length) {
        ratingCount = stars.length;
        ratingAvg = (stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1);
      }
    }
  } catch {
    // diam: rail tetap render tanpa rating
  }

  const profileItems = [
    [Boolean(bp?.profile_picture_url), "Foto profil", "/dashboard/barista/profile"],
    [(bp?.skills ?? []).length > 0, "Minimal 1 skill", "/dashboard/barista/profile"],
    [Boolean(bp?.cv_url), "CV PDF", "/dashboard/barista/profile"],
    [(bp?.experience_months ?? 0) > 0, "Pengalaman", "/dashboard/barista/profile"],
  ];
  const profileDone = profileItems.filter(([ok]) => ok).length;

  const ringkasan = (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-xs font-bold tracking-widest text-caramel uppercase">Dasbor Barista</p>
        <h1 className="mt-1 text-2xl leading-none font-black text-espresso">Halo, {bp?.full_name?.split(" ")[0] ?? "Barista"}! 👋</h1>
        <p className="mt-2 max-w-xl text-sm text-espresso-soft">
          Pantau lamaran, lanjutkan yang diterima, dan nilai cafe tempatmu selesai bekerja.
        </p>
      </div>

      {total === 0 && (
        <div className="rounded-2xl border border-caramel/40 bg-caramel/10 p-5">
          <h2 className="text-sm font-black text-espresso">3 langkah mulai kerja 🚀</h2>
          <ol className="mt-3 space-y-2">
            {[
              ["1", "Lengkapi profil + foto + CV", "/dashboard/barista/profile"],
              ["2", "Lamar 1 lowongan pertama", "/jobs"],
              ["3", "Cek kabar di Pesan", "/messages"],
            ].map(([n, label, href]) => (
              <li key={n}>
                <Link href={href} className="flex items-center gap-3 text-sm font-bold text-espresso hover:text-caramel">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-caramel text-xs font-black text-white">{n}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-caramel/40 bg-caramel/10 p-4">
          <p className="text-xs font-bold tracking-widest text-caramel uppercase">Total Lamaran</p>
          <p className="mt-1 text-3xl font-black text-espresso">{total}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-espresso-soft"><Briefcase size={12} />terkirim</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">Menunggu</p>
          <p className="mt-1 text-3xl font-black text-espresso">{waiting}</p>
          <p className="mt-1 text-xs text-espresso-soft">terkirim + dilihat</p>
        </div>
        <div className="rounded-2xl border border-matcha/40 bg-matcha/10 p-4">
          <p className="text-xs font-bold tracking-widest text-matcha uppercase">Diterima</p>
          <p className="mt-1 text-3xl font-black text-espresso">{accepted}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-espresso-soft"><CheckCheck size={12} />sedang bekerja</p>
        </div>
        <div className="rounded-2xl border border-[#3d2c1e] bg-[#3d2c1e] p-4 text-white">
          <p className="text-xs font-bold tracking-widest text-latte uppercase">Selesai</p>
          <p className="mt-1 text-3xl font-black">{done}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-latte"><FlagOff size={12} />bisa dinilai</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-latte bg-white">
        <div className="flex items-center justify-between border-b border-latte px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black text-espresso"><FileText size={16} className="text-caramel" /> Lamaran Terbaru</h2>
          <Link href="/dashboard/barista?tab=lamaran" className="text-xs font-bold text-caramel hover:underline">Lihat semua</Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-6">
            <p className="text-sm text-espresso-soft">Belum ada lamaran. Cari lowongan di bawah dan kirim lamaran pertamamu.</p>
            <Link href="/jobs" className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-[#3d2c1e] px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
              Cari lowongan
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-latte">
            {recent.map((a) => {
              const meta = STATUS_META[a.status] ?? STATUS_META.pending;
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-espresso">{a.job_posts?.title ?? "Lowongan dihapus"}</p>
                    <p className="truncate text-xs text-espresso-soft">{ownerMap.get(a.id) ?? "-"} • {relativeTime(a.created_at)}</p>
                  </div>
                  <Badge classes={meta.classes}>{meta.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-[#2b2118]">Cari lowongan di job board</h2>
          <p className="mt-0.5 text-xs text-[#857768]">Jelajahi lowongan aktif, simpan favoritmu, dan lamar langsung.</p>
        </div>
        <Link href="/jobs" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3d2c1e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2e2015]">
          Buka Loker <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );

  const lamaran = <ApplicationsList />;

  const tersimpan = savedJobs.length ? (
    <ul className="space-y-2.5">
      {savedJobs.map((job) => (
        <JobListRow key={job.id} job={job} active={false} applied={appliedIds.has(job.id)} saved={savedIds.has(job.id)} showApply />
      ))}
    </ul>
  ) : (
    <EmptyState
      icon={<FileText size={20} />}
      title="Belum ada loker tersimpan"
      subtitle="Ketuk bookmark di loker mana pun untuk menyimpannya di sini."
      actionLabel="Lihat loker"
      actionHref="/jobs"
    />
  );

  const pengaturan = (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <h2 className="text-sm font-extrabold text-[#2b2118]">Kelengkapan Profil ({profileDone}/4)</h2>
      <ul className="mt-3 space-y-2">
        {profileItems.map(([ok, label, href]) => (
          <li key={label}>
            <Link href={href} className="flex items-center gap-3 text-sm font-bold text-espresso hover:text-caramel">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${ok ? "bg-matcha" : "bg-latte"}`}>
                {ok ? "✓" : "•"}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/dashboard/barista/profile" className="mt-4 inline-flex min-h-[40px] items-center rounded-full bg-[#3d2c1e] px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
        Edit Profil
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2b2118] lg:flex lg:h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:min-h-0 lg:flex-1">
        <BaristaShell
          initialView={tab}
          sidebar={{ barista: bp ? { ...bp, id: user.id } : { id: user.id }, counts: { applied: total, saved: savedIds.size } }}
          middle={{ ringkasan, lamaran, tersimpan, pengaturan, waiting }}
          right={{ latestJobs: latestJobs ?? [], ratingAvg, ratingCount }}
        />
      </div>
    </div>
  );
}
