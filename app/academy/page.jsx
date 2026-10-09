import Link from "next/link";
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
        Komunitas kopi yang kuat
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-espresso sm:text-3xl">
        Belajar dari <span className="text-matcha">akademi terbaik.</span>
      </h1>
      <p className="mt-1 max-w-xl text-sm leading-6 text-espresso-soft">
        Training tatap muka, sertifikat tercatat permanen dan bisa diverifikasi.
      </p>

      <form action="/academy" method="GET" role="search" className="mt-4 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2">
          <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
          <label htmlFor="academy-q" className="sr-only">Cari akademi</label>
          <input
            id="academy-q"
            name="q"
            defaultValue={q}
            placeholder="Cari nama akademi..."
            autoComplete="off"
            className="h-6 w-full bg-transparent text-sm text-espresso placeholder:text-[#b6a98f] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[36px] shrink-0 items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Cari
        </button>
      </form>

      {academies.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<GraduationCap size={20} />}
            title={q ? "Tidak ketemu" : "Belum ada akademi"}
            subtitle={q ? "Coba kata kunci lain." : "Jadilah yang pertama daftar sebagai akademi."}
            actionLabel={q ? undefined : "Daftar sebagai akademi"}
            actionHref={q ? undefined : "/register?role=academy"}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {academies.map((a) => (
            <Link
              key={a.id}
              href={`/academy/${a.id}`}
              className="flex flex-col rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee"
            >
              <div className="flex items-center gap-3">
                <Avatar src={a.logo_url} name={a.name} size="md" />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-extrabold tracking-tight text-espresso">{a.name}</h2>
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
  );
}
