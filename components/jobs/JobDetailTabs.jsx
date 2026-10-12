"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { relativeTime } from "@/lib/time";
import { splitSections } from "@/lib/jobSections";

const TABS = ["Deskripsi Pekerjaan", "Perusahaan", "Ulasan"];

// T-13/T-15/T-16: tab Deskripsi / Perusahaan / Ulasan. Tanggung Jawab +
// Persyaratan diurai dari marker di description (format JobPostForm) dan
// tampil di dalam tab Deskripsi Pekerjaan seperti mockup UI-06.
export default function JobDetailTabs({ job, cafeName, cafeHref, avg, count, reviews, saved, showSave }) {
  const [tab, setTab] = useState("Deskripsi Pekerjaan");
  const sections = splitSections(job.description);

  return (
    <div>
      <div role="tablist" aria-label="Detail lowongan" className="flex gap-5 border-b border-[#efe9d9]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`pb-2 text-[13px] font-bold ${
              tab === t ? "border-b-2 border-coffee text-espresso" : "text-espresso-soft hover:text-espresso"
            }`}
          >
            {t}
            {t === "Ulasan" && count > 0 && <span className="ml-1 text-[#b6a98f]">({count})</span>}
          </button>
        ))}
      </div>

      <div className="py-4">
        {tab === "Deskripsi Pekerjaan" && (
          <div>
            <p className="text-sm leading-7 whitespace-pre-line text-espresso-soft">
              {sections.base || "Belum ada deskripsi."}
            </p>
            {sections.resp.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-extrabold text-espresso">Tanggung Jawab</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-espresso-soft">
                  {sections.resp.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {sections.req.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-extrabold text-espresso">Persyaratan</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-espresso-soft">
                  {sections.req.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {sections.sched && (
              <p className="mt-4 text-sm text-espresso-soft">
                <span className="font-extrabold text-espresso">Jadwal: </span>{sections.sched}
              </p>
            )}
          </div>
        )}
        {tab === "Perusahaan" && (
          <div>
            <p className="flex items-center gap-1.5 text-sm">
              {cafeHref ? (
                <Link href={cafeHref} className="font-bold text-link hover:underline">{cafeName}</Link>
              ) : (
                <span className="font-bold text-espresso">{cafeName}</span>
              )}
              {job.owners?.is_verified && <VerifiedBadge size={14} />}
              {avg && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-espresso">
                  <Star size={11} className="fill-[#c98a2b] text-[#c98a2b]" aria-hidden="true" />{avg} ({count})
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-espresso-soft">
              {job.cafes?.address || job.cafes?.location || job.owners?.location || "-"}
            </p>
            {cafeHref && (
              <Link href={cafeHref} className="mt-2 inline-block text-xs font-bold text-link hover:underline">
                Lihat Profil →
              </Link>
            )}
          </div>
        )}
        {tab === "Ulasan" && (
          <div>
            {!reviews?.length ? (
              <EmptyState compact icon={<Star size={18} />} title="Belum ada ulasan" subtitle="Kafe ini belum punya ulasan dari barista." />
            ) : (
              <ul className="space-y-2">
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
  );
}
