import Link from "next/link";
import { Search, Star, Clock3, Signal, GraduationCap, BadgeCheck, HeartHandshake } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Training" };

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
    desc: "Komunikasi, pelayanan, dan cafe experience yang membuat pelanggan kembali.",
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">
        A stronger coffee community
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#2b2118] sm:text-3xl">
        Build a stronger team <span className="text-[#1f6b4a]">through training.</span>
      </h1>
      <p className="mt-1 max-w-xl text-sm leading-6 text-[#6f6252]">
        Katalog kursus barista — dari dasar sampai mahir. Pendaftaran dibuka bertahap,
        gabung waitlist agar tidak ketinggalan batch pertama.
      </p>

      <form action="/training" method="GET" role="search" className="mt-4 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2">
          <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
          <label htmlFor="training-q" className="sr-only">Cari kursus</label>
          <input
            id="training-q"
            name="q"
            defaultValue={params?.q ?? ""}
            placeholder="Search courses, skills, or certifications..."
            autoComplete="off"
            className="h-6 w-full bg-transparent text-sm text-[#2b2118] placeholder:text-[#b6a98f] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[36px] shrink-0 items-center rounded-full bg-[#3d2c1e] px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
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
            <article key={c.id} className="flex flex-col rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
              <p className="inline-flex w-fit items-center gap-1 rounded-full bg-[#e3f0e8] px-2.5 py-0.5 text-[10px] font-bold text-[#1f6b4a]">
                <BadgeCheck size={11} aria-hidden="true" /> Kursus seed
              </p>
              <h2 className="mt-2 text-base font-extrabold tracking-tight text-[#2b2118]">{c.title}</h2>
              <p className="text-xs text-[#857768]">By {c.by}</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#2b2118]">
                <Star size={11} className="fill-[#c98a2b] text-[#c98a2b]" aria-hidden="true" />
                {c.rating} <span className="font-semibold text-[#857768]">({c.reviews})</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#857768]">
                <Clock3 size={11} aria-hidden="true" /> {c.meta}
              </p>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#6f6252]">{c.desc}</p>
              <p className="mt-1.5 text-sm font-extrabold text-[#2b2118]">{c.price}</p>
              <div className="mt-auto flex gap-1.5 pt-3">
                <Link
                  href="/signup"
                  className="inline-flex min-h-[34px] flex-1 items-center justify-center rounded-full border border-[#d8cdae] px-2 text-[11px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
                >
                  Detail
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-[34px] flex-1 items-center justify-center rounded-full bg-[#3d2c1e] px-2 text-[11px] font-bold text-white hover:bg-[#2e2015]"
                >
                  Join Waitlist
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: GraduationCap, title: "Konsistensi Lebih Baik", desc: "Standar kualitas yang sama di seluruh tim." },
          { icon: Star, title: "Kualitas Layanan Naik", desc: "Pelanggan lebih puas, lebih sering kembali." },
          { icon: HeartHandshake, title: "Retensi Tim Kuat", desc: "Tim merasa dihargai dan lebih loyal." },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#efe9d9] text-[#3d2c1e]">
              <b.icon size={16} aria-hidden="true" />
            </span>
            <p className="mt-2 text-sm font-extrabold text-[#2b2118]">{b.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-[#857768]">{b.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-center text-[11px] text-[#857768]">
        <Signal size={11} aria-hidden="true" />
        Katalog contoh — jadwal resmi dan pendaftaran online menyusul. Progress tim & sertifikasi masuk fase berikutnya.
      </p>
    </div>
  );
}
