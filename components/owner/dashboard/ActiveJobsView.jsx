import Link from "next/link";
import { Plus, Briefcase, Megaphone, TrendingUp, Store } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";
import JobActiveToggle from "@/components/jobs/JobActiveToggle";

// Kolom tengah mode active jobs: kelola lowongan murni (edit/lihat/hapus).
export default function ActiveJobsView({ jobs, appCountByJob, totalJobs, activeJobs, onBack }) {
  const inactive = totalJobs - activeJobs;
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">Kelola Lowongan</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Loker Aktif</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-espresso-soft">Pasang, edit, dan tutup lowongan kafe Anda.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2 text-xs font-bold text-espresso hover:border-coffee"
          >
            <Store size={14} /> Dashboard
          </button>
          <Link href="/dashboard/owner/jobs/new" className="inline-flex items-center gap-2 rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]">
            <Plus size={14} /> Buat Lowongan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Total" value={totalJobs} circled={false} />
        <StatCard icon={Megaphone} label="Aktif" value={activeJobs} valueClass="text-matcha" circled={false} />
        <StatCard label="Nonaktif" value={inactive} sub="butuh aksi" dark />
        <StatCard icon={TrendingUp} label="Rasio Aktif" value={`${totalJobs ? Math.round(activeJobs / totalJobs * 100) : 0}%`} valueClass="text-[#9a6a2f]" circled={false} />
      </div>

      {!jobs?.length ? (
        <EmptyState
          compact
          icon={<Megaphone size={20} />}
          title="Belum ada lowongan"
          subtitle="Buat lowongan pertama. Manager akan menilai dari kelengkapan data: lokasi, gaji, dan deskripsi yang jelas."
          actionLabel="Buat Lowongan"
          actionHref="/dashboard/owner/jobs/new"
        />
      ) : (
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#faf7ef] p-3">
          <ul className="max-h-[300px] space-y-3 overflow-y-auto no-scrollbar">
          {jobs.map((job) => (
            <li key={job.id} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-espresso">
                    <span className="truncate">{job.title}</span>
                    {job.is_active ? (
                      <span className="shrink-0 rounded-full bg-[#e3f0e8] px-2 py-0.5 text-[10px] font-bold text-matcha">Aktif</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[#efe9d9] px-2 py-0.5 text-[10px] font-bold text-espresso-soft">Nonaktif</span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-espresso-soft">
                    {job.cafes?.name ?? "-"} • {job.location || "-"} • {job.salary_text || "-"} • {appCountByJob[job.id] || 0} pelamar
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Link href={`/dashboard/owner/jobs/${job.id}/edit`} className="inline-flex items-center rounded-full bg-coffee px-4 py-1.5 text-[11px] font-bold text-white hover:bg-[#2e2015]">
                  Edit
                </Link>
                <JobActiveToggle jobId={job.id} isActive={job.is_active} />
                <Link href={`/jobs/${job.id}`} className="inline-flex items-center rounded-full border border-[#e0d5bd] px-4 py-1.5 text-[11px] font-bold text-espresso hover:border-coffee">
                  Lihat
                </Link>
                <JobDeleteButton jobId={job.id} jobTitle={job.title} />
              </div>
            </li>
          ))}
          </ul>
        </div>
      )}
    </>
  );
}
