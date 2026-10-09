"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, LayoutList, MapPin } from "lucide-react";
import JobListRow from "@/components/jobs/JobListRow";
import SaveButton from "@/components/jobs/SaveButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { CafeLogo } from "@/components/landing/LatestJobs";
import { relativeTime } from "@/lib/time";

// Toggle List/Grid (H-20): pilihan tersimpan di sessionStorage, tidak hilang pindah halaman sesi ini.
export default function JobsResults({ jobs, selectedId, appliedIds, savedIds, showApply, qs }) {
  const [view, setView] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem("jobs-view") === "grid" ? "grid" : "list";
    } catch {
      return "list";
    }
  });
  function pick(v) {
    setView(v);
    try { sessionStorage.setItem("jobs-view", v); } catch { /* abaikan */ }
  }

  return (
    <div>
      <div className="mb-2 flex justify-end" role="group" aria-label="Tampilan hasil">
        <button
          type="button" onClick={() => pick("list")} aria-pressed={view === "list"} title="Tampilan daftar"
          className={`flex h-8 w-8 items-center justify-center rounded-l-full border ${view === "list" ? "border-coffee bg-coffee text-white" : "border-[#e0d5bd] bg-white text-espresso-soft"}`}
        >
          <LayoutList size={14} />
        </button>
        <button
          type="button" onClick={() => pick("grid")} aria-pressed={view === "grid"} title="Tampilan grid"
          className={`flex h-8 w-8 items-center justify-center rounded-r-full border border-l-0 ${view === "grid" ? "border-coffee bg-coffee text-white" : "border-[#e0d5bd] bg-white text-espresso-soft"}`}
        >
          <LayoutGrid size={14} />
        </button>
      </div>

      {view === "list" ? (
        <ul className="space-y-2.5">
          {jobs.map((job) => (
            <JobListRow
              key={job.id} job={job} active={job.id === selectedId}
              applied={appliedIds.includes(job.id)} saved={savedIds.includes(job.id)}
              showApply={showApply} qs={qs}
            />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {jobs.map((job) => {
            const cafeName = job.cafes?.name ?? job.owners?.business_name ?? "-";
            const href = qs ? `/jobs?${qs}&job=${job.id}` : `/jobs?job=${job.id}`;
            return (
              <li key={job.id} className={`rounded-2xl border bg-white p-4 ${job.id === selectedId ? "border-coffee" : "border-[#e8e0cf]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <CafeLogo job={job} />
                  <SaveButton jobId={job.id} initialSaved={savedIds.includes(job.id)} />
                </div>
                <Link href={href} scroll={false} className="mt-2 block truncate text-sm font-extrabold text-espresso hover:text-matcha">
                  {job.title}
                </Link>
                <p className="flex items-center gap-1 truncate text-xs text-espresso-soft">
                  {cafeName}{job.owners?.is_verified && <VerifiedBadge size={12} />}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-espresso-soft">
                  <MapPin size={11} aria-hidden="true" />{job.location}
                </p>
                {job.salary_text && <p className="mt-0.5 text-[11px] font-bold text-espresso">{job.salary_text}</p>}
                <p className="mt-1 text-[10px] text-[#b6a98f]">{relativeTime(job.created_at)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
