import Link from "next/link";
import { Star } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/time";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Ulasan" };

// ponytail: mask kata kasar di display (ceiling: filter server-side + moderasi saat v2)
const KASAR = ["goblok", "tolol", "bego", "anjing", "bangsat", "bajingan", "idiot", "kampret"];
function maskKasar(text) {
  if (!text) return text;
  let out = text;
  for (const w of KASAR) out = out.replace(new RegExp(w, "gi"), "***");
  return out;
}

function Stars({ value, size = 13 }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} dari 5 bintang`}>
      {Array.from({ length: 5 }).map((_, s) => (
        <Star
          key={s}
          size={size}
          className={s < value ? "fill-[#c98a2b] text-[#c98a2b]" : "text-[#e0d5bd]"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage({ searchParams }) {
  const params = await searchParams;
  const minRating = Number(params?.minRating ?? 0) || 0;
  const sort = params?.sort === "rating" ? "rating" : "newest";

  if (!isSupabaseConfigured()) {
    return <div className="p-8 text-center text-sm text-espresso-soft">Supabase belum dikonfigurasi.</div>;
  }
  let reviews = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ratings")
      .select("stars,comment,created_at,barista_id,owner_id")
      .order("created_at", { ascending: false })
      .limit(100);
    const { attachBaristaNames } = await import("@/lib/publicProfiles");
    reviews = await attachBaristaNames(data ?? [], supabase);
  } catch {
    reviews = [];
  }

  // Group per barista: layer 1 top recommendation, klik baru dropdown review.
  const byBarista = new Map();
  for (const r of reviews) {
    const key = r.barista?.full_name ?? "Barista";
    if (!byBarista.has(key)) byBarista.set(key, { name: key, items: [] });
    byBarista.get(key).items.push(r);
  }
  let groups = [...byBarista.values()].map((g) => ({
    ...g,
    avg: g.items.reduce((a, r) => a + (r.stars ?? 0), 0) / Math.max(g.items.length, 1),
    latest: g.items[0]?.created_at ?? "",
  }));
  if (minRating > 0) groups = groups.filter((g) => Math.round(g.avg) >= minRating);
  groups.sort(sort === "rating" ? (a, b) => b.avg - a.avg : (a, b) => (b.latest < a.latest ? -1 : 1));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Ulasan komunitas</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">Ulasan</h1>
      <p className="mt-1 text-sm text-[#6f6252]">Top barista berdasarkan penilaian real pemilik cafe. Klik untuk lihat ulasannya.</p>

      <form action="/reviews" method="GET" className="mt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="sort" value={sort} />
        <label htmlFor="rev-min" className="sr-only">Filter rating minimal</label>
        <select
          id="rev-min"
          name="minRating"
          defaultValue={minRating ? String(minRating) : ""}
          className="rounded-full border border-[#e0d5bd] bg-[#ffffff] px-3 py-1.5 text-xs font-bold text-[#2b2118] outline-none"
        >
          <option value="">Semua rating</option>
          {[5, 4, 3].map((n) => (
            <option key={n} value={n}>{n}+ bintang</option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-[#3d2c1e] px-4 py-1.5 text-xs font-bold text-white">Filter</button>
        <div className="flex overflow-hidden rounded-full border border-[#e0d5bd] text-xs font-bold">
          <Link href={`/reviews${minRating ? `?minRating=${minRating}` : ""}`} className={`px-3 py-1.5 ${sort === "newest" ? "bg-[#3d2c1e] text-white" : "bg-[#ffffff] text-[#6f6252]"}`}>Terbaru</Link>
          <Link href={`/reviews?sort=rating${minRating ? `&minRating=${minRating}` : ""}`} className={`px-3 py-1.5 ${sort === "rating" ? "bg-[#3d2c1e] text-white" : "bg-[#ffffff] text-[#6f6252]"}`}>Rating tertinggi</Link>
        </div>
      </form>

      {!groups.length ? (
        <div className="mt-6">
          <EmptyState
            icon={<Star size={20} />}
            title="Belum ada ulasan"
            subtitle="Ulasan muncul setelah owner menilai barista yang selesai bekerja."
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {groups.map((g) => (
            <li key={g.name} className="overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ffffff]">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efe8d8] text-sm font-extrabold text-[#3d2c1e]" aria-hidden="true">
                    {g.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#2b2118]">{g.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <Stars value={Math.round(g.avg)} />
                      <span className="text-xs font-bold text-[#2b2118]">{g.avg.toFixed(1)}/5</span>
                      <span className="text-xs text-[#857768]">• {g.items.length} ulasan</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-[#2b6cb0] group-open:hidden">Lihat ulasan</span>
                </summary>
                <ul className="space-y-2 border-t border-[#e8e0cf] bg-[#faf7ef] p-4">
                  {g.items.map((r, i) => (
                    <li key={`${r.created_at}-${i}`} className="rounded-xl bg-[#ffffff] p-3">
                      <Stars value={r.stars ?? 0} />
                      {r.comment && <p className="mt-1.5 text-sm leading-6 text-[#2b2118]">&ldquo;{maskKasar(r.comment)}&rdquo;</p>}
                      <p className="mt-1 text-xs text-[#857768]">
                        dinilai oleh {r.owner?.business_name ?? "Cafe"} • {relativeTime(r.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
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
