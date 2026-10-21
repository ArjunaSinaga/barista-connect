import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Search, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { photoLooksReal, thumb } from "@/lib/img";

export const metadata = { title: "Daftar Kafe" };
export const revalidate = 60;

// Foto lokal milik repo (public/images/landing) dipakai sebagai fallback supaya
// kartu kafe tidak pernah tampil sebagai blok warna polos.
const FALLBACK_PHOTOS = [
  "/images/landing/cafe-1.jpg",
  "/images/landing/cafe-2.jpg",
  "/images/landing/cafe-3.jpg",
  "/images/landing/cafe-4.jpg",
  "/images/landing/cafe-5.jpg",
  "/images/landing/cafe-6.jpg",
];

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

  // Foto DB yang cuma placeholder kecil (<15KB) tampil sebagai blok polos,
  // jadi ganti dengan foto lokal repo supaya kartu selalu rapi.
  const cards = await Promise.all(
    list.map(async (c, i) => {
      const photos = c.photo_urls ?? [];
      const dbPhoto = photos.length > 0 ? thumb(photos[0], { w: 640 }) : null;
      const src =
        dbPhoto && (await photoLooksReal(dbPhoto))
          ? dbPhoto
          : FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length];
      return { c, src };
    })
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-espresso">
            <Store size={24} className="text-caramel" /> Daftar Kafe
          </h1>
          <p className="mt-1 max-w-xl text-sm text-espresso-soft">
            Jelajahi kafe yang membuka lowongan di kerja.inc. Semua kafe terverifikasi
            tanggal profil dan lokasinya.
          </p>
        </div>
        <p className="rounded-full border-latte bg-cream px-3 py-1 text-xs font-bold text-espresso-soft">
          {list.length} kafe terdaftar
        </p>
      </header>

      <form
        method="get"
        action="/cafes"
        role="search"
        className="mt-5 flex items-center gap-2 rounded-3xl card-dark p-2 pl-4"
      >
        <Search size={16} className="shrink-0 text-espresso-soft" />
        <label htmlFor="cafe-q" className="sr-only">
          Cari kafe
        </label>
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
          className="shrink-0 rounded-xl bg-coffee px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2e2015]"
        >
          Cari
        </button>
      </form>

      {list.length === 0 ? (
        <p className="mt-6 rounded-3xl card-dark p-8 text-center text-sm text-espresso-soft">
          {q ? `Tidak ada kafe yang cocok dengan "${q}".` : "Belum ada kafe terdaftar."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ c, src }) => (
            <li key={c.id}>
              <Link
                href={`/cafes/${c.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl card-dark transition duration-200 hover:-translate-y-0.5 hover:border-caramel hover:shadow-[0_18px_40px_-28px_rgba(43,33,24,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel"
              >
                <span className="relative block h-44 w-full overflow-hidden bg-cream-dark">
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  {c.owners?.business_name ? (
                    <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-caramel uppercase shadow-sm">
                      {c.owners.business_name}
                    </span>
                  ) : null}
                </span>

                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="block font-display text-lg leading-tight font-extrabold text-espresso">
                    {c.name}
                  </span>
                  <span className="flex items-start gap-1.5 text-sm text-espresso-soft">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-caramel" />
                    <span className="line-clamp-2">{c.address || c.location || "Lokasi belum diisi"}</span>
                  </span>
                  <span className="mt-auto flex items-center justify-between border-t-latte pt-3">
                    <span className="text-xs font-semibold text-espresso-soft">Lihat profil kafe</span>
                    <ChevronRight
                      size={18}
                      className="text-caramel transition group-hover:translate-x-1"
                    />
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
