import Link from "next/link";
import { Search, Star, Clock3, Signal, GraduationCap, BadgeCheck, HeartHandshake, Award } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import WaitlistButton from "@/components/training/WaitlistButton";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = { title: "Pelatihan" };

// F5 ringan: katalog kursus statis (seed jelas, bukan data palsu) + waitlist.
// Di-upgrade ke data real bila tabel courses/enrollments sudah ada.
const SEED_COURSES = [
  {
    id: "latte-art-fundamentals",
    title: "Latte Art Fundamentals",
    by: "Indonesia Coffee Academy",
    rating: "4.8",
    reviews: "128 ulasan",
    meta: "4 jam • Beginner • Offline • Jakarta",
    price: "Rp 850.000 / orang",
    desc: "Teknik dasar latte art, milk steaming, dan konsistensi di setiap cangkir.",
    tags: ["Latte Art", "Beginner"],
  },
  {
    id: "manual-brew-masterclass",
    title: "Manual Brew Masterclass",
    by: "Tanamera Coffee",
    rating: "4.7",
    reviews: "96 ulasan",
    meta: "6 jam • Intermediate • Offline • Yogyakarta",
    price: "Rp 1.200.000 / orang",
    desc: "Metode seduh manual dengan berbagai metode seduh dan profiling rasa.",
    tags: ["Manual Brew", "Intermediate"],
  },
  {
    id: "customer-service-excellence",
    title: "Customer Service Excellence",
    by: "Common Man Coffee Roasters",
    rating: "4.7",
    reviews: "74 ulasan",
    meta: "4 jam • All Levels • Online",
    price: "Rp 650.000 / orang",
    desc: "Komunikasi, pelayanan, dan kafe experience yang membuat pelanggan kembali.",
    tags: ["Service", "Online"],
  },
];

export default async function TrainingPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q ?? "").toString().trim().toLowerCase();
  const courses = q
    ? SEED_COURSES.filter((c) =>
        `${c.title} ${c.by} ${c.tags.join(" ")}`.toLowerCase().includes(q)
      )
    : SEED_COURSES;

  // Statistik sertifikasi real: 1 query, normalisasi lower+trim (ejaan beda = entri beda).
  // ponytail: tanpa tabel master/trigger; hitung live, tanpa cache.
  let certStats = { total: 0, members: 0, top: null };
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("baristas_public").select("certificates");
      const counts = new Map();
      let members = 0;
      for (const row of data ?? []) {
        const clean = [...new Set((row.certificates ?? []).map((c) => (c ?? "").trim()).filter(Boolean))];
        if (clean.length) members += 1;
        for (const c of clean) {
          const key = c.toLowerCase();
          const hit = counts.get(key);
          if (hit) hit.n += 1;
          else counts.set(key, { label: c, n: 1 });
        }
      }
      const top = [...counts.values()].sort((a, b) => b.n - a.n)[0] ?? null;
      certStats = { total: [...counts.values()].reduce((s, x) => s + x.n, 0), members, top };
    } catch { /* diam: kartu tetap render nol */ }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
        Komunitas kopi yang kuat
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-espresso sm:text-3xl">
        Bangun tim kuat <span className="text-matcha">lewat pelatihan.</span>
      </h1>
      <p className="mt-1 max-w-xl text-sm leading-6 text-espresso-soft">
        Katalog kursus barista — dari dasar sampai mahir. Pendaftaran dibuka bertahap,
        gabung waitlist agar tidak ketinggalan batch pertama.
      </p>

      <form action="/training" method="GET" role="search" className="mt-4 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2">
          <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
          <label htmlFor="training-q" className="sr-only">Cari kursus</label>
          <input
            id="training-q"
            name="q"
            defaultValue={params?.q ?? ""}
            placeholder="Cari kursus, skill, atau sertifikat..."
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

      {!courses.length ? (
        <div className="mt-6">
          <EmptyState
            icon={<Search size={20} />}
            title="Tidak ada kursus cocok"
            subtitle="Coba kata kunci lain, mis. latte, brew, atau service."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <article key={c.id} className="flex flex-col rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
              <p className="inline-flex w-fit items-center gap-1 rounded-full bg-[#e3f0e8] px-2.5 py-0.5 text-[10px] font-bold text-matcha">
                <BadgeCheck size={11} aria-hidden="true" /> Contoh kurikulum
              </p>
              <h2 className="mt-2 text-base font-extrabold tracking-tight text-espresso">{c.title}</h2>
              <p className="text-xs text-espresso-soft">By {c.by}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-espresso-soft">
                <Clock3 size={11} aria-hidden="true" /> {c.meta}
              </p>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-espresso-soft">{c.desc}</p>
              <p className="mt-1.5 text-xs font-bold text-espresso-soft">Harga & jadwal menyusul</p>
              <div className="mt-auto flex gap-1.5 pt-3">
                <WaitlistButton topic={`course-${c.id}`} label="Ikut waitlist" />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-4 text-center">
          <p className="text-2xl font-black text-espresso">{certStats.total}</p>
          <p className="mt-0.5 text-xs text-espresso-soft">Sertifikat terdaftar</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-4 text-center">
          <p className="text-2xl font-black text-espresso">{certStats.members}</p>
          <p className="mt-0.5 text-xs text-espresso-soft">Member bersertifikat</p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-base font-extrabold text-espresso">
            <Award size={16} className="text-[#9a6a2f]" aria-hidden="true" />
            {certStats.top ? `${certStats.top.label} (${certStats.top.n})` : "—"}
          </p>
          <p className="mt-0.5 text-xs text-espresso-soft">Paling banyak diambil</p>
        </div>
      </div>
      {!certStats.total && (
        <p className="mt-3 text-center text-xs text-espresso-soft">
          Belum ada sertifikat. <Link href="/dashboard/barista/profile" className="font-bold text-matcha hover:underline">Lengkapi profilmu</Link> untuk tampil di sini.
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: GraduationCap, title: "Konsistensi Lebih Baik", desc: "Standar kualitas yang sama di seluruh tim." },
          { icon: Star, title: "Kualitas Layanan Naik", desc: "Pelanggan lebih puas, lebih sering kembali." },
          { icon: HeartHandshake, title: "Retensi Tim Kuat", desc: "Tim merasa dihargai dan lebih loyal." },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-[#e8e0cf] bg-white p-4 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#efe9d9] text-espresso">
              <b.icon size={16} aria-hidden="true" />
            </span>
            <p className="mt-2 text-sm font-extrabold text-espresso">{b.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-espresso-soft">{b.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-center text-[11px] text-espresso-soft">
        <Signal size={11} aria-hidden="true" />
        Katalog contoh — jadwal resmi dan pendaftaran online menyusul. Progress tim & sertifikasi masuk fase berikutnya.
      </p>
    </div>
  );
}
