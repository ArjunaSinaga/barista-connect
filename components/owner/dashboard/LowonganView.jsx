import Link from "next/link";
import { Plus, Briefcase, Users, Eye, Megaphone, TrendingUp, Store } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";

// Kolom tengah mode lowongan: tabel kelola (pindahan dashboard lama).
export default function LowonganView({ jobs, appCountByJob, totalJobs, activeJobs, totalApplicants, avgPerJob, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Business Manager View</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Lowongan Saya</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#6f6252]">Semua lowongan dan pelamar tercatat rapi, siap dipresentasikan ke manager.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
          >
            <Store size={14} /> Dashboard
          </button>
          <Link href="/dashboard/owner/jobs/new" className="inline-flex items-center gap-2 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]">
            <Plus size={14} /> Buat Lowongan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="text-[11px] font-bold tracking-widest text-[#857768] uppercase">Total Lowongan</p>
          <p className="mt-1 text-2xl font-black text-[#2b2118]">{totalJobs}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#857768]"><Briefcase size={12} />{activeJobs} aktif</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="text-[11px] font-bold tracking-widest text-[#857768] uppercase">Pelamar Masuk</p>
          <p className="mt-1 text-2xl font-black text-[#2b2118]">{totalApplicants}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#857768]"><Users size={12} />{avgPerJob} / lowongan</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="text-[11px] font-bold tracking-widest text-[#857768] uppercase">Rasio Aktif</p>
          <p className="mt-1 text-2xl font-black text-[#9a6a2f]">{totalJobs ? Math.round(activeJobs / totalJobs * 100) : 0}%</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#857768]"><TrendingUp size={12} />kesehatan rekrutmen</p>
        </div>
        <div className="rounded-2xl bg-[#3d2c1e] p-3 text-white">
          <p className="text-[11px] font-bold tracking-widest text-[#f5f1e8]/70 uppercase">Butuh Aksi</p>
          <p className="mt-1 text-2xl font-black">{jobs?.filter(j => !j.is_active).length || 0}</p>
          <p className="mt-0.5 text-[11px] text-[#f5f1e8]/70">lowongan nonaktif</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ffffff]">
        <div className="flex items-center justify-between border-b border-[#efe9d9] px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#2b2118]"><Megaphone size={15} className="text-[#9a6a2f]" /> Daftar Lowongan</h3>
          <span className="rounded-full bg-[#efe9d9] px-3 py-1 text-[11px] font-bold text-[#6f6252]">{totalJobs} data</span>
        </div>
        {!jobs || jobs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Megaphone size={22} />}
              title="Belum ada lowongan"
              subtitle="Buat lowongan pertama. Manager akan menilai dari kelengkapan data: lokasi, gaji, dan deskripsi yang jelas."
              actionLabel="Buat Lowongan"
              actionHref="/dashboard/owner/jobs/new"
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#efe9d9]">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#2b2118]">{job.title}</p>
                  <p className="truncate text-[11px] text-[#857768]">
                    {job.cafes?.name ?? "-"} • {job.location} • {appCountByJob[job.id] || 0} pelamar • {job.is_active ? "Aktif" : "Nonaktif"}
                  </p>
                </div>
                <Link href={`/dashboard/owner/jobs/${job.id}/applicants`} className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#3d2c1e] hover:underline"><Eye size={13} />Kelola</Link>
                <Link href={`/dashboard/owner/jobs/${job.id}/edit`} className="shrink-0 text-[11px] font-bold text-[#6f6252] hover:text-[#3d2c1e]">Edit</Link>
                <Link href={`/jobs/${job.id}`} className="shrink-0 text-[11px] font-bold text-[#2b6cb0] hover:underline">Lihat</Link>
                <JobDeleteButton jobId={job.id} jobTitle={job.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
