import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { thumb } from "@/lib/img";

export const metadata = { title: "Daftar Kafe" };
export const revalidate = 60;

export default async function CafesPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q ?? "").toString().trim();
  const supabase = await createClient();

  let req = supabase
    .from("cafes")
    .select("id, name, address, location, photo_urls, owners ( business_name )")
    .order("created_at", { ascending: false })
    .limit(50);
  if (q) req = req.or(`name.ilike.%${q}%,address.ilike.%${q}%,location.ilike.%${q}%`);
  const { data } = await req;
  const list = data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-espresso">
        <Store size={22} className="text-caramel" /> Daftar Kafe
      </h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Jelajahi kafe yang terdaftar di kerja.inc.
      </p>

      <form method="get" action="/cafes" role="search" className="mt-4 flex items-center gap-2 rounded-2xl card-dark p-2 pl-4">
        <Search size={16} className="shrink-0 text-espresso-soft" />
        <label htmlFor="cafe-q" className="sr-only">Cari kafe</label>
        <input
          id="cafe-q"
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau kota..."
          autoComplete="off"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-espresso placeholder:text-[#b6a98f] focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-coffee px-4 py-2 text-sm font-bold text-white hover:bg-[#2e2015]"
        >
          Cari
        </button>
      </form>

      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl card-dark p-6 text-center text-sm text-espresso-soft">
          {q ? `Tidak ada kafe yang cocok dengan "${q}".` : "Belum ada kafe terdaftar."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cafes/${c.id}`}
                className="flex items-center gap-4 rounded-2xl card-dark p-4 hover:ring-2 hover:ring-caramel"
              >
                {(c.photo_urls ?? []).length > 0 ? (
                  <Image
                    src={thumb(c.photo_urls[0], { w: 320 })}
                    alt={c.name}
                    width={160}
                    height={160}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cream-dark text-caramel">
                    <Store size={24} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-base font-extrabold text-espresso">{c.name}</span>
                  {c.owners?.business_name && (
                    <span className="block truncate text-xs font-bold tracking-wide text-caramel uppercase">
                      {c.owners.business_name}
                    </span>
                  )}
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-espresso-soft">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{c.address || c.location || "-"}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
