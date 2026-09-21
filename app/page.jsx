import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight, Coffee, Store } from "lucide-react";
import { createClient, isSupabaseConfigured, getSessionSafe } from "@/lib/supabase/server";
import LatestJobs from "@/components/landing/LatestJobs";
import FeaturedBarista from "@/components/landing/FeaturedBarista";
import ReviewsCard from "@/components/landing/ReviewsCard";
import { EcosystemCard, AcademyCard, SmarterOpsCard } from "@/components/landing/SidebarKerja";
import { avgStars } from "@/lib/ratings";
import { attachOwners, attachBaristaNames, attachRatings } from "@/lib/publicProfiles";
import { STR } from "@/lib/strings";

async function getLatestJobs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("*, cafes(name, photo_urls)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
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
    ];
  } catch {
    return fallback;
  }
}

async function getFeaturedBarista() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("baristas_public")
      .select("*")
      .eq("is_open_to_work", true)
      .order("experience_months", { ascending: false })
      .limit(10);
    const rows = await attachRatings(data ?? [], supabase);
    if (!rows.length) return null;
    const ranked = [...rows].sort((a, b) => {
      const aa = parseFloat(avgStars(a.ratings) ?? "-1");
      const bb = parseFloat(avgStars(b.ratings) ?? "-1");
      if (bb !== aa) return bb - aa;
      return (b.ratings?.length ?? 0) - (a.ratings?.length ?? 0);
    });
    return ranked[0];
  } catch {
    return null;
  }
}

async function getRecentReviews() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ratings")
      .select("stars,comment,created_at,barista_id,owner_id")
      .order("created_at", { ascending: false });
    return attachBaristaNames(data ?? [], supabase);
  } catch {
    return [];
  }
}

function HeroPhotoBlock({ photo, flush }) {
  return (
    <div className={flush
      ? "relative h-48 overflow-hidden sm:h-56 lg:h-full lg:min-h-[228px]"
      : "relative h-48 overflow-hidden rounded-xl shadow-[0_1px_3px_rgba(43,33,24,0.08)] sm:h-56 lg:h-full lg:min-h-[228px]"}>
      {photo ? (
        <>
          <Image src={photo.url} alt={STR.hero.photoAlt(photo.kafe)} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <span className="font-chalk absolute top-4 left-4 -rotate-6 text-xl leading-5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {STR.hero.overlayTop[0]}<br />{STR.hero.overlayTop[1]}
          </span>
          <span className="absolute right-3 bottom-3 rounded-full bg-paper/95 px-4 py-2 text-right shadow">
            <span className="font-chalk block text-sm leading-4 text-espresso">{STR.hero.overlayBadge[0]}<br />{STR.hero.overlayBadge[1]}</span>
            {photo.kafe && <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-espresso-soft">— {photo.kafe} —</span>}
          </span>
          <span className="absolute bottom-1 left-0 right-0 hidden text-center text-[8px] font-bold tracking-[0.22em] text-white/90 lg:block">
            {STR.hero.strip}
          </span>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#ece2cd] px-6 text-center">
          <p className="text-sm leading-6 text-espresso-soft">{STR.hero.fallback[0]}<br />{STR.hero.fallback[1]}</p>
        </div>
      )}
    </div>
  );
}

// Kolom tengah saat DB masih kosong: 3 langkah cara kerja (statis, tanpa data).
// ponytail: tampil hanya bila featured+reviews kosong; hapus bila konten real sudah ramai.
function CaraKerja() {
  const steps = [
    ["1", "Daftar gratis", "Barista / pemilik kafe, 2 menit."],
    ["2", "Lamar / pasang loker", "Profil + rating terverifikasi."],
    ["3", "Chat & kerja", "Interview langsung di platform."],
  ];
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <h3 className="text-[15px] font-extrabold text-espresso">Cara kerja</h3>
      <ol className="mt-3 space-y-3">
        {steps.map(([n, t, d]) => (
          <li key={n} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coffee text-xs font-extrabold text-white">{n}</span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold text-espresso">{t}</span>
              <span className="block text-xs text-espresso-soft">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex gap-2">
        <Link href="/signup?role=barista" className="inline-flex flex-1 min-h-[32px] items-center justify-center rounded-full bg-coffee px-3 text-xs font-bold text-white hover:bg-[#2e2015]">Daftar barista</Link>
        <Link href="/signup?role=owner" className="inline-flex flex-1 min-h-[32px] items-center justify-center rounded-full border border-[#d8cdae] px-3 text-xs font-bold text-espresso hover:border-coffee">Pasang loker</Link>
      </div>
    </div>
  );
}
// di kiri, ekosistem kanan; bawahnya 3 kolom (jobs | featured+reviews | academy+smarter).
// Tiap kolom bawah scroll di dalam kotaknya sendiri tanpa scrollbar kelihatan.
// Mobile tetap scroll normal.
export default async function LandingPage() {
  const { user } = await getSessionSafe();
  const [jobs, stats, featured, reviews] = await Promise.all([
    getLatestJobs(),
    getLiveStats(),
    getFeaturedBarista(),
    getRecentReviews(),
  ]);
  const heroPhoto = (() => {
    const photos = [];
    for (const j of jobs) {
      for (const url of j.cafes?.photo_urls ?? []) {
        if (url && !photos.some((p) => p.url === url)) photos.push({ url, kafe: j.cafes?.name ?? null });
      }
    }
    return photos;
  })();
  const heroMain = heroPhoto[0] ?? null;
  const academyPhoto = heroPhoto[1]?.url ?? heroPhoto[0]?.url ?? null;

  return (
    <div className="min-h-screen bg-paper text-espresso lg:flex lg:h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      {/* Atas: hero (teks+foto) + kartu peran di kiri, ekosistem kanan */}
      <section className="mx-auto w-full max-w-[1400px] shrink-0 px-4 pt-2 pb-2 sm:px-6">
        <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_1fr_0.85fr]">
          <div className="min-w-0 lg:col-span-2">
            <div className="flex gap-0 overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ece2cd] py-2 pr-0 pl-5 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:pl-6">
              <div className="min-w-0 flex-1 pr-5">
                <p className="text-[10px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
                  Komunitas kopi yang kuat
                </p>
                <h1 className="font-display mt-0.5 text-[1.4rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.6rem]">
                  Rekrut barista hebat. <span className="text-matcha">Temukan loker kafe terbaik.</span>
                </h1>
                <p className="mt-1 max-w-xl text-xs leading-5 text-espresso-soft">
                  BaristaConnect menghubungkan barista dan pemilik kafe: pengalaman terverifikasi, rating, dan ulasan real. Lebih dari papan loker — ekosistem rekrutmen kopi.
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Link href="/jobs" className="inline-flex min-h-[32px] items-center gap-2 rounded-full bg-coffee px-4 text-xs font-bold text-white hover:bg-[#2e2015]">
                    <Search size={13} /> Cari Loker
                  </Link>
                  <Link href="/find-baristas" className="inline-flex min-h-[32px] items-center gap-2 rounded-full border border-[#c9b992] bg-white px-4 text-xs font-bold text-espresso hover:border-coffee">
                    <Store size={13} /> Rekrut Barista
                  </Link>
                </div>
                <dl className="mt-1.5 flex items-stretch gap-4">
                  {stats.map(([v, l], i) => (
                    <div key={l} className={i > 0 ? "border-l border-coffee/15 pl-5" : ""}>
                      <dd className="text-lg leading-6 font-extrabold tracking-tight text-espresso">{v}</dd>
                      <dt className="mt-0.5 text-[10px] leading-3 text-espresso-soft">{l}</dt>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="hidden w-60 shrink-0 self-stretch sm:block lg:w-72">
                <HeroPhotoBlock photo={heroMain} flush />
              </div>
            </div>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              <Link href="/signup" className="group flex items-center gap-3 rounded-2xl border border-[#e8e0cf] bg-white px-4 py-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#efe8d8]"><Coffee size={17} className="text-espresso" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold">Untuk Barista</span>
                  <span className="block truncate text-xs text-espresso-soft">Cari loker, asah skill, bangun reputasi.</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#b6a98f] group-hover:text-espresso" />
              </Link>
              <Link href="/signup?role=owner" className="group flex items-center gap-3 rounded-2xl border border-[#e8e0cf] bg-white px-4 py-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#efe8d8]"><Store size={17} className="text-espresso" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold">Untuk Pemilik Kafe</span>
                  <span className="block truncate text-xs text-espresso-soft">Temukan barista berbakat, rekrut dengan yakin.</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#b6a98f] group-hover:text-espresso" />
              </Link>
            </div>
          </div>
          <div className="min-w-0">
            <EcosystemCard />
          </div>
        </div>
      </section>

      {/* Bawah: jobs | featured+reviews | academy+smarter — scroll per kolom */}
      <section className="mx-auto w-full max-w-[1400px] flex-1 px-4 sm:px-6 lg:min-h-0">
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-3">
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
            <LatestJobs jobs={jobs} />
          </div>
          <div className="min-w-0 space-y-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
            {!featured && reviews.length === 0 ? (
              <CaraKerja />
            ) : (
              <>
                <FeaturedBarista barista={featured} isAnon={!user} />
                <ReviewsCard reviews={reviews} />
              </>
            )}
          </div>
          <div className="min-w-0 space-y-4 sm:col-span-2 lg:col-span-1 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
            <AcademyCard image={academyPhoto} />
            <SmarterOpsCard />
          </div>
        </div>
      </section>
    </div>
  );
}
