import Link from "next/link";
import Image from "next/image";
import { MapPin, Banknote, Briefcase, ChevronRight, Star, ShieldCheck, BadgeCheck, MessageSquareHeart, ThumbsUp, GraduationCap, Users, Store } from "lucide-react";
import { createClient, isSupabaseConfigured, getSessionSafe } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import HeroSearch from "@/components/landing/HeroSearch";
import { CafeLogo, skillTags } from "@/components/landing/LatestJobs";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { avgStars } from "@/lib/ratings";
import { attachOwners, attachRatings } from "@/lib/publicProfiles";

export const revalidate = 60;

const CAFE_FALLBACKS = [
  "/images/landing/cafe-1.jpg",
  "/images/landing/cafe-6.jpg",
  "/images/landing/cafe-2.jpg",
  "/images/landing/cafe-3.jpg",
];

async function getLatestJobs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("*, cafes(name, photo_urls)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    return attachOwners(data ?? [], supabase);
  } catch {
    return [];
  }
}

async function getLiveStats() {
  const fallback = [
    ["0", "Barista di platform"],
    ["0", "Kafe merekrut"],
    ["0", "Loker aktif"],
    ["0", "Kota terjangkau"],
  ];
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const [{ count: baristas }, { count: cafes }, { count: jobs }] = await Promise.all([
      supabase.from("baristas_public").select("id", { count: "exact", head: true }),
      supabase.from("cafes").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("job_posts").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return [
      [`${(baristas ?? 0).toLocaleString()}+`, "Barista di platform"],
      [`${(cafes ?? 0).toLocaleString()}+`, "Kafe merekrut"],
      [`${(jobs ?? 0).toLocaleString()}`, "Loker aktif"],
      ["80+", "Kota terjangkau"],
    ];
  } catch {
    return fallback;
  }
}

async function getFeaturedBaristas() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("baristas_public")
      .select("*")
      .eq("is_open_to_work", true)
      .order("experience_months", { ascending: false })
      .limit(10);
    const rows = await attachRatings(data ?? [], supabase);
    return [...rows]
      .sort((a, b) => {
        const aa = parseFloat(avgStars(a.ratings) ?? "-1");
        const bb = parseFloat(avgStars(b.ratings) ?? "-1");
        if (bb !== aa) return bb - aa;
        return (b.ratings?.length ?? 0) - (a.ratings?.length ?? 0);
      })
      .slice(0, 4);
  } catch {
    return [];
  }
}

const TRUST_STEPS = [
  { icon: BadgeCheck, title: "Identitas Terverifikasi", desc: "Profil barista dan kafe dicek sebelum tampil." },
  { icon: ShieldCheck, title: "Riwayat Terverifikasi", desc: "Pengalaman kerja tercatat dan bisa ditelusur." },
  { icon: MessageSquareHeart, title: "Rating dan Ulasan Asli", desc: "Hanya dari owner yang pernah mempekerjakan." },
  { icon: ThumbsUp, title: "Endorse Rekan", desc: "Satu pengguna satu suara per skill." },
];

export default async function LandingPage() {
  const { user } = await getSessionSafe();
  const [jobs, stats, talents] = await Promise.all([
    getLatestJobs(),
    getLiveStats(),
    getFeaturedBaristas(),
  ]);

  return (
    <div className="min-h-screen bg-paper text-espresso">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6">
        <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#f3ecdd] via-[#efe4cf] to-[#e7d6b8] p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-matcha">
              <ShieldCheck size={13} /> Dipercaya talenta dan kafe di seluruh Indonesia
            </p>
            <h1 className="font-display mt-3 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
              Frontline talent for a brighter Indonesia
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-espresso-soft">
              kerja.inc adalah marketplace tepercaya untuk talenta frontline dan hospitality —
              dari barista sampai F and B staff, front office, dan hospitality.
            </p>
            <HeroSearch />
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map(([v, l], i) => {
                const Icon = [Users, Store, Briefcase, MapPin][i % 4];
                return (
                  <div key={l} className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-coffee">
                      <Icon size={16} />
                    </span>
                    <div>
                      <dd className="text-xl font-extrabold tracking-tight">{v}</dd>
                      <dt className="text-[11px] leading-4 text-espresso-soft">{l}</dt>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
          <div className="relative h-72 overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(43,33,24,0.18)] sm:h-96 lg:h-[460px]">
            <Image
              src="/images/landing/barista-1.jpg"
              alt="Barista kerja.inc sedang menyeduh kopi"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <span className="absolute top-4 right-4 max-w-[180px] rounded-xl bg-white/95 px-3 py-2 text-right shadow">
              <span className="font-chalk block text-sm leading-4">Kerja ikut pengalaman, bukan kenalan</span>
            </span>
          </div>
        </div>
      </section>

      {/* Lapis 2 — panel krem gelap pembungkus konten */}
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="mt-6 rounded-3xl bg-[#ece2cc] px-4 pt-2 pb-10 sm:px-6">
      {/* Featured Jobs */}
      <section className="pt-8">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Featured Jobs</h2>
            <p className="mt-0.5 text-xs text-espresso-soft">Pekerjaan pilihan dari kafe terverifikasi di seluruh Indonesia.</p>
          </div>
          <Link href="/jobs" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-link hover:underline">
            See all jobs <ChevronRight size={13} />
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-[#e0d5bd] bg-white p-8 text-center">
            <p className="text-sm font-bold">Belum ada loker — jadilah kafe pertama.</p>
            <Link href="/signup?role=owner" className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]">
              Pasang loker gratis
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {jobs.map((job, i) => {
              const types = job.employment_types?.length ? job.employment_types : (job.employment_type ? [job.employment_type] : []);
              const tags = skillTags(job);
              const cover = job.cafes?.photo_urls?.[0] ?? CAFE_FALLBACKS[i % CAFE_FALLBACKS.length];
              return (
                <li key={job.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#e8e0cf] bg-white shadow-[0_1px_3px_rgba(43,33,24,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(43,33,24,0.12)]">
                  <div className="relative h-28 w-full">
                    <Image src={cover} alt={job.cafes?.name ?? "Kafe"} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <div className="flex items-center gap-2">
                      <CafeLogo job={job} />
                      <div className="min-w-0">
                        <Link href={`/jobs/${job.id}`} className="block truncate text-sm font-bold hover:text-matcha">
                          {job.title}
                        </Link>
                        <p className="flex items-center gap-1 truncate text-xs text-espresso-soft">
                          {job.cafes?.name ?? job.owners?.business_name}
                          {job.owners?.is_verified && <VerifiedBadge size={12} />}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-espresso-soft">
                      <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                      {job.salary_text && <span className="inline-flex items-center gap-1"><Banknote size={11} />{job.salary_text}</span>}
                      {types.slice(0, 1).map((t) => (
                        <span key={t} className="inline-flex items-center gap-1"><Briefcase size={11} />{EMPLOYMENT_LABELS[t] ?? t}</span>
                      ))}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-[#f2ecdf] px-2 py-0.5 text-[10px] font-semibold text-espresso-soft">{t}</span>
                        ))}
                      </div>
                    )}
                    <Link href={`/jobs/${job.id}`} className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#d8cdae] text-xs font-bold hover:border-coffee">
                      Detail
                    </Link>
                  </div>
                </li>
              );
            })}
            {jobs.length > 0 && jobs.length < 4 && (
              <li className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8cdae] bg-white/60 p-4 text-center">
                <Store size={24} className="text-coffee" />
                <p className="mt-2 text-sm font-bold">Punya kafe? Pasang loker gratis</p>
                <p className="mt-1 text-xs text-espresso-soft">Jangkau barista siap kerja di kotamu.</p>
                <Link href="/signup?role=owner" className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]">
                  Pasang Loker
                </Link>
              </li>
            )}
          </ul>
        )}
      </section>

      {/* How Trust Works */}
      <section className="pt-8">
        <h2 className="text-xl font-extrabold tracking-tight">How Trust Works</h2>
        <p className="mt-0.5 text-xs text-espresso-soft">Empat mekanisme yang menjaga kualitas setiap profil dan loker.</p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe8d8] text-xs font-extrabold">{i + 1}</span>
              <s.icon size={20} className="mt-3 text-matcha" />
              <p className="mt-1 text-sm font-bold">{s.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-espresso-soft">{s.desc}</p>
            </li>
          ))}
        </ol>
        <Link href="/trust" className="mt-3 inline-flex min-h-[44px] items-center gap-1 rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]">
          See how it works <ChevronRight size={14} />
        </Link>
      </section>

      {/* Featured Talent */}
      <section className="pt-8">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Featured Talent</h2>
            <p className="mt-0.5 text-xs text-espresso-soft">Barista siap kerja dengan rating dan pengalaman terverifikasi.</p>
          </div>
          <Link href="/find-baristas" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-link hover:underline">
            Lihat semua talenta <ChevronRight size={13} />
          </Link>
        </div>
        {talents.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-[#e8e0cf] bg-white p-6 text-center text-sm text-espresso-soft">
            Talenta unggulan segera tampil di sini.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {talents.map((b) => {
              const avg = avgStars(b.ratings);
              const count = b.ratings?.length ?? 0;
              return (
                <li key={b.id} className="rounded-2xl border border-[#e8e0cf] bg-white p-4 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(43,33,24,0.12)]">
                  <Avatar src={b.profile_picture_url} name={b.full_name} size="lg" />
                  <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold">
                    {b.full_name}
                    {b.is_verified && <VerifiedBadge size={14} />}
                  </p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-espresso-soft">
                    <Star size={12} className="fill-[#c98a2b] text-[#c98a2b]" />
                    {avg ? `${avg} (${count} ulasan)` : "Belum ada ulasan"}
                  </p>
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-espresso-soft">
                    <MapPin size={11} />{b.location_place ?? "Indonesia"}
                  </p>
                  <Link
                    href={user ? `/barista/${b.id}` : `/login?next=/barista/${b.id}`}
                    className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-[#d8cdae] text-xs font-bold hover:border-coffee"
                  >
                    View Profile
                  </Link>
                </li>
              );
            })}
            {talents.length > 0 && talents.length < 4 && (
              <li className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8cdae] bg-white/60 p-4 text-center">
                <Users size={24} className="text-coffee" />
                <p className="mt-2 text-sm font-bold">Barista? Tampil di sini</p>
                <p className="mt-1 text-xs text-espresso-soft">Lengkapi profil dan portofoliomu gratis.</p>
                <Link href="/signup?role=barista" className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]">
                  Daftar Gratis
                </Link>
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Academy banner */}
      <section className="pt-8">
        <div className="grid overflow-hidden rounded-2xl border border-[#e8e0cf] bg-white shadow-[0_2px_12px_rgba(43,33,24,0.10)] lg:grid-cols-2">
          <div className="relative h-56 lg:h-auto lg:min-h-[280px]">
            <Image
              src="/images/landing/cafe-1.jpg"
              alt="Suasana pelatihan barista kerja.inc Academy"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e3f0e8] px-3 py-1 text-[11px] font-bold text-matcha">
              <GraduationCap size={13} /> kerja.inc Academy
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Skill hari ini, peluang kerja esok</h2>
            <p className="mt-1 text-sm leading-6 text-espresso-soft">
              Dari pemula sampai mahir, kursus berbasis industri membantu barista membangun skill asli dan kepercayaan diri siap kafe.
            </p>
            <ul className="mt-3 space-y-1.5">
              {["Pemula sampai Mahir", "Belajar dari Praktisi Industri", "Sertifikasi kerja.inc"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-xs font-semibold">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e3f0e8] text-[10px] font-bold text-matcha">✓</span>{t}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link href="/training" className="inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-xs font-bold text-white hover:bg-[#2e2015]">
                Lihat Program Academy
              </Link>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
