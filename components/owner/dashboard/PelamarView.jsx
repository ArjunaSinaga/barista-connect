import Link from "next/link";
import { Users, Eye, Store, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";

// Kolom tengah mode pelamar: tiap lowongan + pelamarnya, fokus ke Kelola.
export default function PelamarView({ jobs, appCountByJob, statusByJob, totals, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">Pelamar</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Pelamar Masuk</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-espresso-soft">Klik Kelola untuk review dan terima barista per lowongan.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2 text-xs font-bold text-espresso hover:border-coffee"
        >
          <Store size={14} /> Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={Users} label="Total" value={totals.total} circled={false} />
        <StatCard icon={Clock3} label="Menunggu" value={totals.pending} valueClass="text-[#9a6a2f]" circled={false} />
        <StatCard icon={CheckCircle2} label="Diterima" value={totals.accepted} valueClass="text-matcha" circled={false} />
        <StatCard icon={XCircle} label="Ditolak" value={totals.rejected} valueClass="text-espresso-soft" circled={false} />
      </div>

      {!jobs?.length ? (
        <EmptyState
          compact
          icon={<Users size={18} />}
          title="Belum ada lowongan"
          subtitle="Buat lowongan dulu, pelamar akan muncul di sini."
          actionLabel="Buat Lowongan"
          actionHref="/dashboard/owner/jobs/new"
        />
      ) : (
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#faf7ef] p-3">
          <ul className="max-h-[300px] space-y-3 overflow-y-auto no-scrollbar">
          {jobs.map((job) => {
            const sb = statusByJob[job.id] ?? { pending: 0 };
            return (
              <li key={job.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e0cf] bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-bold text-espresso">
                    {job.title}
                    {!job.is_active && (
                      <span className="shrink-0 rounded-full bg-[#efe9d9] px-2 py-0.5 text-[10px] font-bold text-espresso-soft">Nonaktif</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-espresso-soft">
                    {job.cafes?.name ?? "-"} • <b className="text-espresso">{appCountByJob[job.id] || 0} pelamar</b>
                    {sb.pending > 0 && <span className="font-bold text-[#9a6a2f]"> • {sb.pending} menunggu</span>}
                  </p>
                </div>
                <Link
                  href={`/dashboard/owner/jobs/${job.id}/applicants`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]"
                >
                  <Eye size={13} /> Kelola
                </Link>
              </li>
            );
          })}
          </ul>
        </div>
      )}
    </>
  );
}
