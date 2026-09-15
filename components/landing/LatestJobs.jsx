import Link from "next/link";
import { MapPin, Bookmark, ChevronRight, Banknote, Briefcase } from "lucide-react";
import ApplyButton from "@/components/jobs/ApplyButton";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

function CafeLogo({ job }) {
  const photo = job.cafes?.photo_urls?.[0];
  const name = job.cafes?.name ?? job.owners?.business_name ?? "C";
  if (photo) {
    return <img src={photo} alt={name} loading="lazy" className="h-12 w-12 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3d2c1e] text-lg font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

// Blok mandiri: daftar lowongan terbaru, langsung di canvas (tanpa kartu pembungkus).
export default function LatestJobs({ jobs }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-[#2b2118]">Latest Barista Jobs</h2>
          <p className="mt-0.5 text-[11px] text-[#857768]">Great cafes. Real opportunities. Find your next role in coffee.</p>
        </div>
        <Link href="/jobs" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
          View all jobs <ChevronRight size={13} />
        </Link>
      </div>
      {jobs.length === 0 ? (
        <div className="mt-3 rounded-xl border-2 border-dashed border-[#e0d5bd] p-8 text-center">
          <p className="text-sm font-bold text-[#2b2118]">No jobs posted yet.</p>
          <p className="mt-1 text-xs text-[#857768]">Be the first cafe to post today.</p>
        </div>
      ) : (
        <ul className="mt-1 divide-y divide-[#e7ddc8]">
          {jobs.map((job) => {
            const types = job.employment_types?.length ? job.employment_types : (job.employment_type ? [job.employment_type] : []);
            return (
              <li key={job.id} className="flex gap-3 py-3.5">
                <CafeLogo job={job} />
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${job.id}`} className="block truncate text-sm font-bold text-[#2b2118] hover:text-[#1f6b4a]">
                    {job.title}
                  </Link>
                  <p className="flex items-center gap-1 truncate text-xs text-[#857768]">
                    {job.cafes?.name ?? job.owners?.business_name}
                    {job.owners?.is_verified && <VerifiedBadge size={12} />}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#857768]">
                    <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    {job.salary_text && <span className="inline-flex items-center gap-1"><Banknote size={11} />{job.salary_text}</span>}
                    {types.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1"><Briefcase size={11} />{EMPLOYMENT_LABELS[t] ?? t}</span>
                    ))}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {types.map((t) => (
                      <span key={t} className="rounded-full bg-[#efe9d9] px-2.5 py-0.5 text-[11px] font-semibold text-[#6f6252]">{EMPLOYMENT_LABELS[t] ?? t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-2 py-0.5">
                  <span className="flex items-center gap-2 text-[11px] text-[#b6a98f]">
                    {relativeTime(job.created_at)}
                    <button type="button" disabled title="Saved jobs coming soon" aria-label="Save job (coming soon)" className="text-[#2b2118]">
                      <Bookmark size={15} />
                    </button>
                  </span>
                  <ApplyButton jobId={job.id} size="sm" variant="coffee" label="Quick Apply" jobTypes={types} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
