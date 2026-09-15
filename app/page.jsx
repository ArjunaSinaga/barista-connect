import Link from "next/link";
import { ArrowRight, Search, Coffee, Store, MapPin, Star, Bookmark } from "lucide-react";
import { createClient, isSupabaseConfigured, getSessionSafe } from "@/lib/supabase/server";
import JobCard from "@/components/cards/JobCard";
import ApplyButton from "@/components/jobs/ApplyButton";
import HeroPhoto from "@/components/landing/HeroPhoto";
import FeaturedBarista from "@/components/landing/FeaturedBarista";
import SidebarKerja from "@/components/landing/SidebarKerja";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import Button from "@/components/ui/Button";
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

async function getTopCities() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cafes")
      .select("location")
      .eq("is_active", true)
      .limit(200);
    const count = {};
    (data ?? []).forEach((c) => {
      const city = (c.location || "").trim();
      if (city) count[city] = (count[city] || 0) + 1;
    });
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city);
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

export default async function LandingPage() {
  const { user } = await getSessionSafe();
  const [jobs, stats, topCities, featured, reviews] = await Promise.all([
    getLatestJobs(),
    getLiveStats(),
    getTopCities(),
    getFeaturedBarista(),
    getRecentReviews(),
  ]);
  const seen = new Set();
  const heroPhotos = [];
  for (const j of jobs) {
    const cafe = j.cafes?.name ?? null;
    for (const url of j.cafes?.photo_urls ?? []) {
      if (url && !seen.has(url)) {
        seen.add(url);
        heroPhotos.push({ url, cafe });
      }
    }
  }
  return (
    <div className="paper min-h-screen text-[#2f2721]">
      {/* Hero */}
      <section className="border-b-2 border-dashed border-[#2f2721]/15">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <p className="text-center text-[11px] font-bold tracking-[0.2em] text-[#2f2721]/50 uppercase lg:text-left">
            A stronger coffee community
          </p>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="text-center lg:text-left">
              <p className="font-chalk mt-2 text-xl text-[#5f4c37] sm:text-2xl">good people, better coffee</p>
              <h1 className="font-display mt-2 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
                Hire better baristas.<br />Find better cafe jobs.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#2f2721]/70 sm:text-[15px] lg:mx-0">
                BaristaConnect connects passionate baristas and cafe owners with verified
                experience, ratings, and reviews. More than a job board — the coffee hiring ecosystem.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button href="/jobs" size="lg">
                  <Search size={16} /> Find Jobs
                </Button>
                <Button href="/find-baristas" variant="secondary" size="lg">
                  <Store size={16} /> Hire Baristas
                </Button>
              </div>
              <form action="/jobs" method="GET" className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border-2 border-[#2f2721]/15 bg-[#bdb29b] p-1.5 lg:mx-0">
                <div className="flex min-h-[44px] flex-1 items-center gap-2 pl-4">
                  <Search size={16} className="shrink-0 text-[#2f2721]/50" />
                  <input name="q" placeholder="Search jobs, baristas, or cafes..." aria-label="Search jobs" className="h-9 w-full bg-transparent text-sm text-[#2f2721] placeholder:text-[#2f2721]/40 focus:outline-none" />
                </div>
                <button type="submit" className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#1e3932] px-6 text-sm font-bold text-white transition-all hover:brightness-125 active:scale-[0.95]">Search <ArrowRight size={16} /></button>
              </form>
              {topCities.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#2f2721]/60 lg:justify-start">
                  <MapPin size={13} className="text-[#6f5a3e]" />
                  {topCities.join(" • ")}
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              {heroPhotos.length > 0 ? (
                <HeroPhoto photos={heroPhotos} />
              ) : (
              <figure className="rotate-2 rounded-sm bg-[#c6bba2] p-3 pb-4 shadow-[0_10px_30px_rgba(26,15,10,0.18)]">
                <div className="flex aspect-[4/3] items-center justify-center rounded-[2px] border-2 border-dashed border-[#2f2721]/20 bg-[#a2977f] px-6 text-center">
                  <p className="text-sm leading-6 text-[#2f2721]/55">
                    Real cafe photos appear here.<br />Not AI images.
                  </p>
                </div>
                <figcaption className="font-chalk mt-2 text-center text-lg text-[#2f2721]/70">
                  — morning shift, robusta aroma —
                </figcaption>
              </figure>
              )}
            </div>
          </div>

          {/* stats */}
          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-center">
            {stats.map(([v, l]) => (
              <div key={l} className="flex flex-col border-t-2 border-[#2f2721]/15 pt-3">
                <dd className="font-display order-1 text-2xl font-semibold sm:text-3xl">{v}</dd>
                <dt className="order-2 mt-1 text-[11px] tracking-wide text-[#2f2721]/60">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* For Baristas / For Cafe Owners */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/signup" className="group flex items-center gap-4 rounded-xl border border-[#2f2721]/12 bg-[#bdb29b] p-6 shadow-[0_2px_10px_rgba(26,15,10,0.06)] hover:border-[#6f5a3e]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#a2977f]"><Coffee size={22} className="text-[#2f2721]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold tracking-tight">For Baristas</span>
              <span className="mt-0.5 block text-sm leading-6 text-[#2f2721]/65">Find jobs, grow your skills, build your reputation.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-[#2f2721]/40 group-hover:text-[#6f5a3e]" />
          </Link>
          <Link href="/find-baristas" className="group flex items-center gap-4 rounded-xl border border-[#2f2721]/12 bg-[#bdb29b] p-6 shadow-[0_2px_10px_rgba(26,15,10,0.06)] hover:border-[#6f5a3e]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#a2977f]"><Store size={22} className="text-[#2f2721]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold tracking-tight">For Cafe Owners</span>
              <span className="mt-0.5 block text-sm leading-6 text-[#2f2721]/65">Discover talented baristas, hire with confidence.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-[#2f2721]/40 group-hover:text-[#6f5a3e]" />
          </Link>
        </div>
      </section>

      {/* Main + sidebar */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            {/* Latest jobs */}
            <div>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Latest Barista Jobs</h2>
                  <p className="mt-1 text-sm text-[#2f2721]/60">Great cafes. Real opportunities. Find your next role in coffee.</p>
                </div>
                <Link href="/jobs" className="font-chalk inline-flex min-h-[44px] items-center gap-1.5 text-lg text-[#6f5a3e] hover:underline">
                  View all jobs <ArrowRight size={16} />
                </Link>
              </div>
              {jobs.length === 0 ? (
                <div className="mt-4 rounded-xl border-2 border-dashed border-[#2f2721]/20 p-10 text-center">
                  <p className="font-chalk text-xl text-[#2f2721]/70">No jobs pinned yet.</p>
                  <p className="mt-1 text-sm text-[#2f2721]/60">Be the first cafe to post today.</p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {jobs.map((job) => (
                    <div key={job.id} className="relative">
                      <JobCard
                        job={job}
                        ownerName={job.cafes?.name ?? job.owners?.business_name}
                        ownerVerified={job.owners?.is_verified}
                        actions={
                          <div className="flex w-full items-center gap-2">
                            <div className="flex-1">
                              <ApplyButton jobId={job.id} size="sm" full jobTypes={job.employment_types?.length ? job.employment_types : (job.employment_type ? [job.employment_type] : [])} />
                            </div>
                            <button
                              type="button"
                              disabled
                              title="Saved jobs coming soon"
                              aria-label="Save job (coming soon)"
                              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-[#2f2721]/15 text-[#2f2721]/40"
                            >
                              <Bookmark size={15} />
                            </button>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured barista */}
            <FeaturedBarista barista={featured} isAnon={!user} />

            {/* Recent reviews */}
            {reviews.length > 0 && (
              <div className="rounded-2xl border border-[#2f2721]/12 bg-[#bdb29b] p-6 shadow-[0_2px_10px_rgba(26,15,10,0.06)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold tracking-tight">Recent Reviews from Cafe Owners</h3>
                  <Link href="/find-baristas" className="font-chalk inline-flex items-center gap-1 text-base text-[#6f5a3e] hover:underline">
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                <ul className="mt-4 space-y-4">
                  {reviews.map((r, i) => (
                    <li key={i} className="rounded-xl bg-[#ece5d3] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-sm font-bold">
                          <Store size={13} className="text-[#6f5a3e]" />
                          {r.owner?.business_name ?? "Cafe owner"}
                        </p>
                        <span className="flex items-center gap-0.5" aria-label={`${r.stars} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={12} className={s < r.stars ? "fill-[#6f5a3e] text-[#6f5a3e]" : "text-[#2f2721]/25"} />
                          ))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#2f2721]/70 italic">&ldquo;{r.comment}&rdquo;</p>
                      <p className="mt-1 text-[11px] text-[#2f2721]/50">for {r.barista?.full_name ?? "a barista"}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="min-w-0">
            <SidebarKerja />
          </aside>
        </div>
      </section>
    </div>
  );
}
