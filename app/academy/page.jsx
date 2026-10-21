import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Search, Award, Store } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";

export const metadata = { title: "Akademi" };

// ponytail: direktori academy — daftar + cari nama. Tanpa tabel baru.
export default async function AcademyIndexPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q ?? "").toString().trim();

  let academies = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("academy_profiles")
        .select("id, name, description, logo_url, partner_cafe_ids")
        .order("created_at", { ascending: false })
        .limit(30);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data } = await query;
      academies = data ?? [];
    } catch { /* diam: tampil kosong */ }
  }

  return (
    <div className="min-h-screen bg-paper text-espresso">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
        <div className="relative grid overflow-hidden rounded-3xl border border-[#e8e0cf] bg-[#faf6ec] md:grid-cols-[1fr_220px]">
          <div className="px-5 py-5 sm:px-6">
            <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
              Komunitas kopi yang kuat
            </p>
            <h1 className="font-serif mt-1 max-w-xl text-balance text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
              Belajar dari <span className="text-matcha">akademi terbaik.</span>
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-espresso-soft">
              Training tatap muka, sertifikat tercatat permanen dan bisa diverifikasi.
            </p>
            <form action="/academy" method="GET" role="search" className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e8e0cf] bg-white px-4 py-2 shadow-sm">
                <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
                <label htmlFor="academy-q" className="sr-only">Cari akademi</label>
                <input
                  id="academy-q"
                  name="q"
                  defaultValue={q}
                  placeholder="Cari nama akademi..."
                  autoComplete="off"
                  className="h-6 w-full bg-transparent text-xs text-espresso placeholder:text-[#b6a98f] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#c98a2b] px-5 text-xs font-bold text-white hover:brightness-95"
              >
                Cari
              </button>
            </form>
          </div>
          <div className="relative hidden min-h-44 md:block">
            <Image
              src="/images/landing/barista-3.jpg"
              alt="Barista berlatih"
              fill
              className="object-cover object-top"
              sizes="220px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf6ec] via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-espresso-soft" role="status">
            {academies.length} akademi ditemukan
            {q && (
              <Link href="/academy" className="ml-2 font-bold text-link hover:underline">
                Hapus filter
              </Link>
            )}

          </p>
        </div>

        {academies.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<GraduationCap size={20} />}
              title={q ? "Tidak ketemu" : "Belum ada akademi"}
              subtitle={q ? "Coba kata kunci lain." : "Jadilah yang pertama daftar sebagai akademi."}
              actionLabel={q ? "Lihat semua" : "Daftar sebagai akademi"}
              actionHref={q ? "/academy" : "/register?role=academy"}
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {academies.map((a, i) => (
              <Link
                key={a.id}
                href={`/academy/${a.id}`}
                className="flex flex-col overflow-hidden rounded-3xl border border-[#e8e0cf] bg-white shadow-[0_1px_3px_rgba(43,33,24,0.08)] transition hover:-translate-y-0.5 hover:border-coffee"
              >
                <div className="relative h-28 w-full overflow-hidden bg-[#ece2cd]">
                  <Image
                    src={a.logo_url || `/images/landing/barista-${(i % 3) + 1}.jpg`}
                    alt={a.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={a.logo_url} name={a.name} size="md" />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-extrabold tracking-tight text-espresso">{a.name}</h2>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-espresso-soft">
                        <span className="inline-flex items-center gap-1"><Award size={11} /> Sertifikat terverifikasi</span>
                        {(a.partner_cafe_ids ?? []).length > 0 && (
                          <span className="inline-flex items-center gap-1"><Store size={11} /> {(a.partner_cafe_ids ?? []).length} kafe partner</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {a.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-espresso-soft">{a.description}</p>}
                  <span className="mt-auto pt-3 text-xs font-bold text-caramel">Lihat profil</span>
                </div>
              </Link>
            ))}
          </div>


        )}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold text-espresso">Kelas yang paling dicari</h2>
              <p className="mt-1 text-xs text-espresso-soft">
                Kurikulum singkat, tutor praktis, dan sertifikat yang bisa dicantumkan di profil.
              </p>
            </div>
            <Link href="/training" className="text-xs font-bold text-link hover:underline">
              Lihat semua pelatihan
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Espresso & Milk Art",
                level: "Pemula",
                photo: "/images/landing/barista-2.jpg",
                points: ["Dial-in mesin 2 grinder", "Pouring 6 pola dasar", "1 sesi praktik"],
              },
              {
                title: "Manual Brewing Cupping",
                level: "Menengah",
                photo: "/images/landing/cafe-3.jpg",
                points: ["Rasio, suhu, dan waktu seduh", "Mencup 3 batch latihan", "Catatan flavour"],
              },
              {
                title: "Layanan Tamu & Housekeeping",
                level: "Pemula",
                photo: "/images/landing/cafe-5.jpg",
                points: ["Sapaan dan alur order", "Checklist opening shift", "Etika kerja tim"],
              },
            ].map((k) => (
              <article
                key={k.title}
                className="flex flex-col overflow-hidden rounded-3xl border border-[#e8e0cf] bg-white shadow-[0_1px_3px_rgba(43,33,24,0.08)] transition hover:-translate-y-0.5 hover:border-coffee"
              >
                <div className="relative h-32 w-full overflow-hidden bg-[#ece2cd]">
                  <Image src={k.photo} alt={k.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-caramel uppercase shadow-sm">
                    {k.level}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base leading-tight font-extrabold text-espresso">{k.title}</h3>
                  <ul className="mt-2 space-y-1 text-xs text-espresso-soft">
                    {k.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-matcha" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register?role=academy"
                    className="mt-auto inline-flex min-h-[40px] items-center justify-center rounded-full bg-coffee px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#2e2015]"
                  >
                    Daftar kelas
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
