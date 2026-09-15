import Link from "next/link";
import { Users, Eye, Store, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

// Kolom tengah mode pelamar: tiap lowongan + pelamarnya, fokus ke Kelola.
export default function PelamarView({ jobs, appCountByJob, statusByJob, totals, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Pelamar</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Pelamar Masuk</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#6f6252]">Klik Kelola untuk review dan terima barista per lowongan.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
        >
          <Store size={14} /> Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#857768] uppercase"><Users size={12} />Total</p>
          <p className="mt-1 text-2xl font-black text-[#2b2118]">{totals.total}</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#857768] uppercase"><Clock3 size={12} />Menunggu</p>
          <p className="mt-1 text-2xl font-black text-[#9a6a2f]">{totals.pending}</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#857768] uppercase"><CheckCircle2 size={12} />Diterima</p>
          <p className="mt-1 text-2xl font-black text-[#1f6b4a]">{totals.accepted}</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#857768] uppercase"><XCircle size={12} />Ditolak</p>
          <p className="mt-1 text-2xl font-black text-[#6f6252]">{totals.rejected}</p>
        </div>
      </div>

      {!jobs?.length ? (
        <EmptyState
          icon={<Users size={22} />}
          title="Belum ada lowongan"
          subtitle="Buat lowongan dulu, pelamar akan muncul di sini."
          actionLabel="Buat Lowongan"
          actionHref="/dashboard/owner/jobs/new"
        />
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const sb = statusByJob[job.id] ?? { pending: 0 };
            return (
              <li key={job.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-bold text-[#2b2118]">
                    {job.title}
                    {!job.is_active && (
                      <span className="shrink-0 rounded-full bg-[#efe9d9] px-2 py-0.5 text-[10px] font-bold text-[#857768]">Nonaktif</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#857768]">
                    {job.cafes?.name ?? "-"} • <b className="text-[#3d2c1e]">{appCountByJob[job.id] || 0} pelamar</b>
                    {sb.pending > 0 && <span className="font-bold text-[#9a6a2f]"> • {sb.pending} menunggu</span>}
                  </p>
                </div>
                <Link
                  href={`/dashboard/owner/jobs/${job.id}/applicants`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]"
                >
                  <Eye size={13} /> Kelola
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
