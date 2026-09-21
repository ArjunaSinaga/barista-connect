import Link from "next/link";
import { MapPin } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import ApplyButton from "@/components/jobs/ApplyButton";
import SaveButton from "@/components/jobs/SaveButton";
import { CafeLogo, skillTags } from "@/components/landing/LatestJobs";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

// Baris lowongan ala board G1: logo + info + View Job. Klik baris = ganti ?job= (panel kanan).
export default function JobListRow({ job, active, applied, saved, showApply }) {
  const types = job.employment_types?.length
    ? job.employment_types
    : job.employment_type
      ? [job.employment_type]
      : [];
  const tags = skillTags(job);
  const cafeName = job.cafes?.name ?? job.owners?.business_name ?? "-";
  return (
    <li
      className={`rounded-2xl border bg-white p-4 transition-colors ${
        active ? "border-coffee shadow-[0_2px_12px_rgba(43,33,24,0.12)]" : "border-[#e8e0cf] hover:border-[#c9b992]"
      }`}
    >
      <div className="flex gap-3">
        <CafeLogo job={job} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/jobs?job=${job.id}`}
            scroll={false}
            className="block truncate text-sm font-extrabold text-espresso hover:text-matcha"
          >
            {job.title}
          </Link>
          <p className="flex items-center gap-1 truncate text-xs text-espresso-soft">
            {cafeName}
            {job.owners?.is_verified && <VerifiedBadge size={12} />}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-espresso-soft">
            <span className="inline-flex items-center gap-1"><MapPin size={11} aria-hidden="true" />{job.location}</span>
            {types.map((t) => (
              <span key={t}>{EMPLOYMENT_LABELS[t] ?? t}</span>
            ))}
          </p>
          {job.salary_text && (
            <p className="mt-0.5 text-[11px] font-bold text-espresso">{job.salary_text}</p>
          )}
          {tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[10px] font-semibold text-espresso-soft">{t}</span>
              ))}
              {tags.length >= 4 && (
                <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[10px] font-semibold text-espresso-soft">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          <span className="flex items-center gap-2 text-[11px] text-[#b6a98f]">
            {relativeTime(job.created_at)}
            <SaveButton jobId={job.id} initialSaved={saved} />
          </span>
          <Link
            href={`/jobs?job=${job.id}`}
            scroll={false}
            className="inline-flex min-h-[32px] items-center rounded-full bg-coffee px-4 text-[11px] font-bold text-white hover:bg-[#2e2015]"
          >
            Lihat
          </Link>
        </div>
      </div>
      {showApply && (
        <div className="mt-2.5 border-t border-[#efe9d9] pt-2.5">
          <ApplyButton jobId={job.id} applied={applied} jobTypes={types} size="sm" variant="coffee" label="Lamar" />
        </div>
      )}
    </li>
  );
}
