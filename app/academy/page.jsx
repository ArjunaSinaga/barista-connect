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
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
        <div className="relative grid overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#faf6ec] md:grid-cols-[1fr_220px]">
          <div className="px-5 py-5 sm:px-6">
            <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
              Komunitas kopi yang kuat
            </p>
            <h1 className="font-display mt-1 max-w-xl text-balance text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
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
            {academies.map((a) => (
              <Link
                key={a.id}
                href={`/academy/${a.id}`}
                className="flex flex-col rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee"
              >
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
                <span className="mt-auto pt-3 text-xs font-bold text-caramel">Lihat profil →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
