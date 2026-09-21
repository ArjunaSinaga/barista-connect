"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, X } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import ApplyButton from "@/components/jobs/ApplyButton";
import SaveButton from "@/components/jobs/SaveButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

const TABS = ["Ringkasan", "Tentang", "Ulasan"];

// Panel detail kanan ala board G1: galeri + info + tabs + Apply.
// Props plain (serializable) dari server.
export default function JobDetailPanel({ job, cafeName, cafeHref, types, avg, count, reviews, applied, saved, canApply }) {
  const [tab, setTab] = useState("Ringkasan");
  const photos = job.cafes?.photo_urls?.filter(Boolean).slice(0, 4) ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e0cf] bg-white shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      {photos.length > 0 && (
        <div className={`grid gap-0.5 ${photos.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
          {photos.map((src, i) => (
            <Image
              key={`${src}-${i}`}
              src={src}
              alt={i === 0 ? cafeName : `Foto ${cafeName} ${i + 1}`}
              width={400}
              height={144}
              className={photos.length > 1 && i === 0 ? "col-span-2 h-36 w-full object-cover" : "h-36 w-full object-cover"}
            />
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coffee text-lg font-bold text-white" aria-hidden="true">
            {(cafeName ?? "C").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-extrabold tracking-tight text-espresso">{job.title}</h2>
            <p className="truncate text-xs text-espresso-soft">{cafeName}</p>
          </div>
          <Link
            href="/jobs"
            scroll={false}
            aria-label="Close detail panel"
            title="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e0d5bd] text-espresso-soft hover:border-coffee hover:text-espresso"
          >
            <X size={14} />
          </Link>
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-espresso-soft">
          <span className="inline-flex items-center gap-1"><MapPin size={12} aria-hidden="true" />{job.location}</span>
          {types.map((t) => (
            <span key={t}>{EMPLOYMENT_LABELS[t] ?? t}</span>
          ))}
        </p>
        {job.salary_text && (
          <p className="mt-1 text-sm font-extrabold text-espresso">{job.salary_text}</p>
        )}
        <p className="mt-0.5 text-[11px] text-[#b6a98f]">{relativeTime(job.created_at)}</p>

        <div className="mt-3 flex gap-2">
          {canApply ? (
            <>
              <SaveButton jobId={job.id} initialSaved={saved} variant="full" />
              <ApplyButton jobId={job.id} applied={applied} jobTypes={types} size="md" full variant="coffee" label={applied ? "Sudah dilamar" : "Lamar"} />
            </>
          ) : (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-full bg-coffee px-4 text-sm font-bold text-white hover:bg-[#2e2015]"
            >
              Lihat & Lamar
            </Link>
          )}
        </div>
        {!canApply && (
          <p className="mt-1.5 text-center text-[11px] text-espresso-soft">
            Buka halaman loker untuk melamar. <Link href={`/jobs/${job.id}`} className="font-bold text-link hover:underline">Buka →</Link>
          </p>
        )}

        <div role="tablist" aria-label="Job details" className="mt-3 flex gap-4 border-b border-[#efe9d9]">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`pb-2 text-xs font-bold ${
                tab === t ? "border-b-2 border-coffee text-espresso" : "text-espresso-soft hover:text-espresso"
              }`}
            >
              {t}
              {t === "Ulasan" && count > 0 && <span className="ml-1 text-[#b6a98f]">({count})</span>}
            </button>
          ))}
        </div>

        <div className="py-3">
          {tab === "Ringkasan" && (
            <div>
              <h3 className="text-sm font-extrabold text-espresso">Deskripsi Loker</h3>
              <p className="mt-1.5 text-[13px] leading-6 whitespace-pre-line text-espresso-soft">
                {job.description || "Belum ada deskripsi."}
              </p>
              {types.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {types.map((t) => (
                    <span key={t} className="rounded-full bg-[#efe9d9] px-2.5 py-0.5 text-[11px] font-semibold text-espresso-soft">
                      {EMPLOYMENT_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "Tentang" && (
            <div>
              <h3 className="text-sm font-extrabold text-espresso">Tentang {cafeName}</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-espresso-soft">
                {cafeHref ? (
                  <Link href={cafeHref} className="font-bold text-link hover:underline">{cafeName}</Link>
                ) : (
                  <span className="font-bold text-espresso">{cafeName}</span>
                )}
                {job.owners?.is_verified && <VerifiedBadge size={13} />}
                {avg && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-espresso">
                    <Star size={11} className="fill-[#c98a2b] text-[#c98a2b]" aria-hidden="true" />{avg} ({count})
                  </span>
                )}
              </p>
              <p className="mt-1 text-[13px] text-espresso-soft">
                {job.cafes?.address || job.cafes?.location || job.owners?.location || "-"}
              </p>
              {cafeHref && (
                <Link href={cafeHref} className="mt-2 inline-block text-xs font-bold text-link hover:underline">
                  Kunjungi Kafe →
                </Link>
              )}
            </div>
          )}
          {tab === "Ulasan" && (
            <div>
              <h3 className="text-sm font-extrabold text-espresso">Ulasan Kafe</h3>
              {!reviews?.length ? (
                <div className="mt-2">
                  <EmptyState
                    compact
                    icon={<Star size={18} />}
                    title="Belum ada ulasan"
                    subtitle="Kafe ini belum punya ulasan dari barista."
                  />
                </div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {reviews.map((r, i) => (
                    <li key={`${r.created_at}-${i}`} className="rounded-xl bg-[#faf7ef] p-3">
                      <p className="flex items-center gap-0.5" aria-label={`${r.stars} dari 5`}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} size={11} className={s < (r.stars ?? 0) ? "fill-[#c98a2b] text-[#c98a2b]" : "text-[#e0d5bd]"} aria-hidden="true" />
                        ))}
                        {r.created_at && <span className="ml-1.5 text-[10px] text-[#b6a98f]">{relativeTime(r.created_at)}</span>}
                      </p>
                      {r.comment && <p className="mt-1 text-xs leading-5 text-espresso-soft italic">&ldquo;{r.comment}&rdquo;</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
