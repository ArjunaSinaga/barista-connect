import Link from "next/link";
import { Star, Store } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stars } from "@/components/ratings/RatingForm";
import Avatar from "@/components/ui/Avatar";
import { relativeTime } from "@/lib/time";

// Kolom tengah mode reviews: ulasan yang owner beri ke barista.
export default function ReviewsView({ reviews, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Reviews Given</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Ulasan Saya</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#6f6252]">
            {reviews?.length ? `${reviews.length} ulasan untuk barista tim Anda.` : "Penilaian jujur membangun reputasi tim."}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
        >
          <Store size={14} /> Dashboard
        </button>
      </div>

      {!reviews?.length ? (
        <EmptyState
          icon={<Star size={22} />}
          title="Belum ada ulasan"
          subtitle="Nilai barista setelah mereka bekerja agar profil mereka terverifikasi."
          actionLabel="Lihat Tim Saya"
          actionHref="/dashboard/owner?tab=team"
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r, i) => (
            <li key={i} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4">
              <div className="flex items-center gap-3">
                <Avatar src={r.barista?.profile_picture_url} name={r.barista?.full_name ?? "?"} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#2b2118]">{r.barista?.full_name ?? "Barista"}</p>
                  <p className="text-[11px] text-[#857768]">{r.created_at ? relativeTime(r.created_at) : ""}</p>
                </div>
                <Stars value={r.stars} />
              </div>
              {r.comment && <p className="mt-2 text-[13px] leading-5 text-[#6f6252] italic">&ldquo;{r.comment}&rdquo;</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
