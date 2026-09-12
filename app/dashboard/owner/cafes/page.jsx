import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Cafe Saya" };

export default async function CafesPage() {
  if (!isSupabaseConfigured()) return null;
  const { user } = await getSessionSafe();
  if (!user) return null;
  const supabase = await createClient();

  const { data: cafes } = await supabase
    .from("cafes")
    .select("id, name, location, photo_urls, is_active, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Hitung lowongan aktif per cafe
  let countByCafe = {};
  if (cafes?.length) {
    const { data: jobs } = await supabase
      .from("job_posts")
      .select("cafe_id")
      .in("cafe_id", cafes.map((c) => c.id))
      .eq("is_active", true);
    (jobs ?? []).forEach((j) => { countByCafe[j.cafe_id] = (countByCafe[j.cafe_id] || 0) + 1; });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-caramel uppercase">Owner</p>
          <h1 className="mt-1 text-2xl font-extrabold text-espresso">
            Cafe Saya ({cafes?.length ?? 0})
          </h1>
          <p className="mt-1 text-sm text-espresso-soft">
            Daftarkan semua cabangmu. Lowongan dipasang per cafe.
          </p>
        </div>
        <Link href="/dashboard/owner/cafes/new" className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-3 text-sm font-bold text-white hover:bg-black transition">
          <Plus size={16} /> Tambah Cafe
        </Link>
      </div>

      {(!cafes || !cafes.length) && (
        <EmptyState
          icon={<Store size={22} />}
          title="Belum ada cafe"
          subtitle="Daftarkan cafe pertamamu dulu sebelum pasang lowongan."
          actionLabel="Daftarkan Cafe"
          actionHref="/dashboard/owner/cafes/new"
        />
      )}

      <div className="space-y-3 pb-8">
        {(cafes ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/owner/cafes/${c.id}/edit`}
            className="flex items-center gap-4 rounded-2xl card-dark p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {c.photo_urls?.[0] ? (
              <img src={c.photo_urls[0]} alt={c.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cream-dark text-caramel">
                <Store size={24} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-espresso">{c.name}</p>
              <p className="truncate text-xs text-espresso-soft">
                {c.location || "-"} • {countByCafe[c.id] || 0} lowongan aktif
                {c.photo_urls?.length > 1 && ` • ${c.photo_urls.length} foto`}
              </p>
            </div>
            {!c.is_active && (
              <span className="shrink-0 text-xs bg-latte text-espresso-soft px-2 py-1 rounded-full font-bold">Nonaktif</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
