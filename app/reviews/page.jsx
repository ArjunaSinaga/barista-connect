import Link from "next/link";
import { Star } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/time";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  if (!isSupabaseConfigured()) {
    return <div className="p-8 text-center text-sm text-espresso-soft">Supabase belum dikonfigurasi.</div>;
  }
  let reviews = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ratings")
      .select("stars,comment,created_at, barista:barista_profiles!ratings_barista_id_fkey(full_name), owner:owners!ratings_owner_id_fkey(business_name)")
      .order("created_at", { ascending: false })
      .limit(50);
    reviews = data ?? [];
  } catch {
    reviews = [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Ulasan komunitas</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">Reviews</h1>
      <p className="mt-1 text-sm text-[#6f6252]">Penilaian real dari pemilik cafe untuk barista.</p>

      {!reviews.length ? (
        <div className="mt-6">
          <EmptyState
            icon={<Star size={20} />}
            title="Belum ada ulasan"
            subtitle="Ulasan muncul setelah owner menilai barista yang selesai bekerja."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r, i) => (
            <li key={`${r.created_at}-${i}`} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4">
              <p className="flex items-center gap-1" aria-label={`${r.stars} dari 5 bintang`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={13}
                    className={s < (r.stars ?? 0) ? "fill-[#c98a2b] text-[#c98a2b]" : "text-[#e0d5bd]"}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-1 text-xs font-bold text-[#2b2118]">{r.stars}/5</span>
              </p>
              {r.comment && <p className="mt-1.5 text-sm leading-6 text-[#2b2118]">&ldquo;{r.comment}&rdquo;</p>}
              <p className="mt-1.5 text-xs text-[#857768]">
                {r.barista?.full_name ?? "Barista"} • dinilai oleh {r.owner?.business_name ?? "Cafe"} • {relativeTime(r.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-[#857768]">
        Ingin dinilai juga? <Link href="/jobs" className="font-bold text-[#2b6cb0] hover:underline">Lamar lowongan</Link> dan selesaikan pekerjaanmu.
      </p>
    </div>
  );
}
