import Link from "next/link";
import { Search, ChevronRight, Coffee, Store } from "lucide-react";
import { createClient, isSupabaseConfigured, getSessionSafe } from "@/lib/supabase/server";
import LatestJobs from "@/components/landing/LatestJobs";
import FeaturedBarista from "@/components/landing/FeaturedBarista";
import ReviewsCard from "@/components/landing/ReviewsCard";
import { EcosystemCard, AcademyCard, SmarterOpsCard } from "@/components/landing/SidebarKerja";
import { avgStars } from "@/lib/ratings";

async function getLatestJobs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("*, owners(business_name,is_verified), cafes(name, photo_urls)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getLiveStats() {
  const fallback = [
    ["0", "Baristas on platform"],
    ["0", "Cafes hiring"],
    ["0", "Active jobs"],
  ];
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const [{ count: baristas }, { count: cafes }, { count: jobs }] = await Promise.all([
      supabase.from("barista_profiles").select("id", { count: "exact", head: true }),
      supabase.from("cafes").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("job_posts").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return [
      [`${(baristas ?? 0).toLocaleString()}+`, "Baristas on platform"],
      [`${(cafes ?? 0).toLocaleString()}+`, "Cafes hiring"],
      [`${(jobs ?? 0).toLocaleString()}`, "Active jobs"],
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
      .from("barista_profiles")
      .select("*, ratings(stars)")
      .eq("is_open_to_work", true)
      .order("years_of_experience", { ascending: false })
      .limit(10);
    if (!data?.length) return null;
    const ranked = [...data].sort((a, b) => {
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
      .select("stars,comment,created_at, barista:barista_profiles!ratings_barista_id_fkey(full_name), owner:owners!ratings_owner_id_fkey(business_name)")
      .order("created_at", { ascending: false })
      .limit(2);
    return data ?? [];
  } catch {
    return [];
  }
}

// Homepage = 1 layar tanpa scroll halaman (desktop): hero atas, 2 kartu peran,
// 6 blok mandiri (3×2: kiri jobs+reviews, tengah featured+academy, kanan
// ekosistem+smarter ops) + strip bawah melebar. Tiap blok scroll sendiri.
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
        if (url && !photos.some((p) => p.url === url)) photos.push({ url, cafe: j.cafes?.name ?? null });
      }
    }
    return photos;
  })();
  const heroMain = heroPhoto[0] ?? null;
  const academyPhoto = heroPhoto[1]?.url ?? heroPhoto[0]?.url ?? null;

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2b2118] lg:flex lg:h-[calc(100dvh-3.5rem)] lg:flex-col lg:overflow-hidden">
      {/* Hero banner — teks kiri menyatu foto kanan */}
      <section className="mx-auto w-full max-w-[1400px] shrink-0 px-4 pt-4 pb-3 sm:px-6">
        <div className="grid overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ece2cd] shadow-[0_2px_12px_rgba(43,33,24,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-5 sm:p-7">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">
              A stronger coffee community
            </p>
            <h1 className="font-display mt-1 text-3xl leading-[1.05] font-semibold tracking-tight sm:text-[2.6rem]">
              Hire better baristas.<br />
              <span className="text-[#1f6b4a]">Find better cafe jobs.</span>
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-[#6f6252]">
              BaristaConnect connects passionate baristas and cafe owners with verified
              experience, ratings, and reviews. More than a job board — the coffee hiring ecosystem.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href="/jobs" className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#3d2c1e] px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
                <Search size={14} /> Find Jobs
              </Link>
              <Link href="/find-baristas" className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#c9b992] bg-[#ffffff] px-5 text-[13px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]">
                <Store size={14} /> Hire Baristas
              </Link>
            </div>
            <dl className="mt-4 flex items-stretch gap-5">
              {stats.map(([v, l], i) => (
                <div key={l} className={i > 0 ? "border-l border-[#3d2c1e]/15 pl-5" : ""}>
                  <dd className="text-xl leading-6 font-extrabold tracking-tight text-[#2b2118]">{v}</dd>
                  <dt className="mt-0.5 text-[10px] leading-3 text-[#857768]">{l}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden min-h-[300px] lg:block">
            {heroMain ? (
              <>
                <img src={heroMain.url} alt={heroMain.cafe ? `Photo of ${heroMain.cafe}` : "Cafe photo"} className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(100deg, #ece2cd 0%, rgba(236,226,205,0.55) 22%, rgba(236,226,205,0) 45%)" }} />
                <span aria-hidden="true" className="absolute -bottom-16 -left-16 h-56 w-72 rounded-[50%] bg-[#ece2cd]" />
                <span className="font-chalk absolute top-8 left-4 -rotate-6 text-2xl leading-6 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                  Good People<br />Better Coffee
                </span>
                <span className="absolute right-4 bottom-4 rounded-full bg-[#f5f1e8]/95 px-5 py-2.5 text-right shadow">
                  <span className="font-chalk block text-base leading-5 text-[#3d2c1e]">Same Passion<br />More Opportunities</span>
                  {heroMain.cafe && <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-[#857768]">— {heroMain.cafe} —</span>}
                </span>
                <span className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-[9px] font-bold tracking-[0.25em] whitespace-nowrap text-[#2b2118]/40 xl:block">
                  JOBS&nbsp;&nbsp;•&nbsp;&nbsp;PEOPLE&nbsp;&nbsp;•&nbsp;&nbsp;TRAINING&nbsp;&nbsp;•&nbsp;&nbsp;STRONGER CAFES
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <p className="text-sm leading-6 text-[#857768]">Real cafe photos appear here.<br />Not AI images.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Kartu peran */}
      <section className="mx-auto w-full max-w-[1400px] shrink-0 px-4 pb-3 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/signup" className="group flex items-center gap-3 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] px-4 py-2.5 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-[#3d2c1e]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#efe8d8]"><Coffee size={17} className="text-[#3d2c1e]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">For Baristas</span>
              <span className="block truncate text-xs text-[#857768]">Find jobs, grow your skills, build your reputation.</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#b6a98f] group-hover:text-[#3d2c1e]" />
          </Link>
          <Link href="/find-baristas" className="group flex items-center gap-3 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] px-4 py-2.5 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-[#3d2c1e]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#efe8d8]"><Store size={17} className="text-[#3d2c1e]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">For Cafe Owners</span>
              <span className="block truncate text-xs text-[#857768]">Discover talented baristas, hire with confidence.</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#b6a98f] group-hover:text-[#3d2c1e]" />
          </Link>
        </div>
      </section>

      {/* 6 blok mandiri */}
      <section className="mx-auto w-full max-w-[1400px] flex-1 px-4 sm:px-6 lg:min-h-0">
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-[1.12fr_1fr_0.82fr] lg:grid-rows-2">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1">
            <LatestJobs jobs={jobs} />
          </div>
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1">
            <FeaturedBarista barista={featured} isAnon={!user} />
          </div>
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1">
            <EcosystemCard />
          </div>
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1">
            <ReviewsCard reviews={reviews} />
          </div>
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1">
            <AcademyCard image={academyPhoto} />
          </div>
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1">
            <SmarterOpsCard />
          </div>
        </div>
      </section>

      {/* Strip bawah melebar */}
      <section className="mt-3 w-full shrink-0 bg-[#2b1c11]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#f5f1e8]">Good people make great coffee.</p>
            <p className="truncate text-[11px] text-[#f5f1e8]/60">Join thousands of baristas and cafe owners building a stronger coffee community.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/signup" className="inline-flex min-h-[36px] items-center rounded-full bg-[#f5f1e8] px-5 text-xs font-bold text-[#2b1c11] hover:bg-white">
              I&apos;m a Barista
            </Link>
            <Link href="/signup?role=owner" className="inline-flex min-h-[36px] items-center rounded-full border border-[#f5f1e8]/40 px-5 text-xs font-bold text-[#f5f1e8] hover:border-[#f5f1e8]">
              I&apos;m a Cafe Owner
            </Link>
          </div>
          <p className="font-chalk hidden text-right text-sm leading-4 text-[#f5f1e8]/70 xl:block">Same People<br />Brighter Tomorrows</p>
        </div>
      </section>
    </div>
  );
}
