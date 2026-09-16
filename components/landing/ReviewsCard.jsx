import Link from "next/link";
import { Star, Store, ChevronRight } from "lucide-react";
import { relativeTime } from "@/lib/time";

// Blok mandiri: review terbaru dari cafe owners (data asli tabel ratings).
export default function ReviewsCard({ reviews }) {
  if (!reviews?.length) return null;
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-[#2b2118]">Recent Reviews from Cafe Owners <span className="ml-1 rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-[#6f6252]">{reviews.length}</span></h3>
        <Link href="/reviews" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
          View all <ChevronRight size={13} />
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {reviews.map((r, i) => (
          <li key={i} className="rounded-xl bg-[#faf7ef] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 truncate text-[13px] font-bold text-[#2b2118]">
                <Store size={13} className="shrink-0 text-[#857768]" />
                <span className="truncate">{r.owner?.business_name ?? "Cafe owner"}</span>
              </p>
              <span className="flex shrink-0 items-center gap-1.5" aria-label={`${r.stars} out of 5 stars`}>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={12} className={s < r.stars ? "fill-[#c98a2b] text-[#c98a2b]" : "text-[#d8cdae]"} />
                  ))}
                </span>
                {r.created_at && <span className="text-[10px] font-semibold text-[#b6a98f]">{relativeTime(r.created_at)}</span>}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-5 text-[#6f6252] italic">&ldquo;{r.comment}&rdquo;</p>
            <p className="mt-1 text-[11px] text-[#b6a98f]">for {r.barista?.full_name ?? "a barista"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
