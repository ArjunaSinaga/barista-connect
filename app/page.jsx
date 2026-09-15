import Link from "next/link";
import { ArrowRight, Search, MapPin, Star, Bookmark, ChevronRight, Coffee, Store } from "lucide-react";
import { createClient, isSupabaseConfigured, getSessionSafe } from "@/lib/supabase/server";
import ApplyButton from "@/components/jobs/ApplyButton";
import FeaturedBarista from "@/components/landing/FeaturedBarista";
import SidebarKerja from "@/components/landing/SidebarKerja";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { avgStars } from "@/lib/ratings";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

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

function CafeLogo({ job }) {
  const photo = job.cafes?.photo_urls?.[0];
  const name = job.cafes?.name ?? job.owners?.business_name ?? "C";
  if (photo) {
    return <img src={photo} alt={name} loading="lazy" className="h-11 w-11 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3d2c1e] text-base font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

// Homepage = 1 layar tanpa scroll halaman (desktop): hero atas, 2 kartu peran,
// 3 kolom (kiri lowongan, tengah talenta, kanan ekosistem) + strip bawah melebar.
// Tiap kolom scroll di dalam kotaknya sendiri. Mobile tetap scroll normal.
export default async function LandingPage() {
  const { user } = await getSessionSafe();
  const [jobs, stats, topCities, featured, reviews] = await Promise.all([
    getLatestJobs(),
    getLiveStats(),
    getTopCities(),
    getFeaturedBarista(),
    getRecentReviews(),
  ]);
  const heroPhoto = (() => {
    for (const j of jobs) {
      const url = j.cafes?.photo_urls?.[0];
      if (url) return { url, cafe: j.cafes?.name ?? null };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2b2118] lg:flex lg:h-[calc(100dvh-3.5rem)] lg:flex-col lg:overflow-hidden">
      {/* Hero banner — teks kiri menyatu foto kanan */}
      <section className="mx-auto w-full max-w-[1400px] shrink-0 px-4 sm:px-6 pt-4 pb-3 sm:px-6">
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
            <form action="/jobs" method="GET" className="mt-3 flex max-w-xl items-center gap-2 rounded-full border border-[#d8cdae] bg-[#ffffff] p-1 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
              <div className="flex min-h-[36px] flex-1 items-center gap-2 pl-4">
                <Search size={14} className="shrink-0 text-[#b6a98f]" />
                <input name="q" placeholder="Search jobs, baristas, or cafes..." aria-label="Search jobs" className="h-8 w-full bg-transparent text-[13px] text-[#2b2118] placeholder:text-[#b6a98f] focus:outline-none" />
              </div>
              {topCities.length > 0 && (
                <span className="hidden items-center gap-1 text-xs font-semibold text-[#857768] md:inline-flex">
                  <MapPin size={12} /> {topCities[0]}
                </span>
              )}
              <button type="submit" className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full bg-[#3d2c1e] px-4 text-xs font-bold text-white hover:bg-[#2e2015]">
                Search <ArrowRight size={13} />
              </button>
            </form>
          </div>

          <div className="relative hidden min-h-[300px] lg:block">
            {heroPhoto ? (
              <>
                <img src={heroPhoto.url} alt={heroPhoto.cafe ? `Photo of ${heroPhoto.cafe}` : "Cafe photo"} className="absolute inset-0 h-full w-full object-cover" />
                <span className="font-chalk absolute top-5 left-1/2 -translate-x-1/2 -rotate-3 text-center text-2xl leading-6 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                  Good People<br />Better Coffee
                </span>
                <span className="absolute right-4 bottom-4 rounded-xl bg-[#f5f1e8]/95 px-4 py-2 text-right shadow">
                  <span className="font-chalk block text-base leading-5 text-[#3d2c1e]">Same Passion<br />More Opportunities</span>
                  {heroPhoto.cafe && <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-[#857768]">— {heroPhoto.cafe} —</span>}
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
      <section className="mx-auto w-full max-w-[1400px] shrink-0 px-4 sm:px-6 pb-3">
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

      {/* 3 kolom: kiri lowongan, tengah talenta, kanan ekosistem */}
      <section className="mx-auto w-full max-w-[1400px] flex-1 px-4 sm:px-6 lg:min-h-0">
        <div className="grid items-start gap-4 lg:h-full lg:grid-cols-[1.05fr_1fr_0.95fr]">
          {/* KIRI — Latest jobs */}
          <div className="min-w-0 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-bold tracking-tight">Latest Barista Jobs</h2>
                <p className="mt-0.5 text-[11px] text-[#857768]">Great cafes. Real opportunities.</p>
              </div>
              <Link href="/jobs" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
                View all jobs <ChevronRight size={13} />
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className="mt-3 rounded-xl border-2 border-dashed border-[#e0d5bd] p-8 text-center">
                <p className="text-sm font-bold">No jobs posted yet.</p>
                <p className="mt-1 text-xs text-[#857768]">Be the first cafe to post today.</p>
              </div>
            ) : (
              <ul className="mt-1 divide-y divide-[#f0e9d8]">
                {jobs.map((job) => {
                  const types = job.employment_types?.length ? job.employment_types : (job.employment_type ? [job.employment_type] : []);
                  return (
                    <li key={job.id} className="flex items-center gap-3 py-3">
                      <CafeLogo job={job} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/jobs/${job.id}`} className="block truncate text-sm font-bold hover:text-[#1f6b4a]">
                          {job.title}
                        </Link>
                        <p className="flex items-center gap-1 truncate text-xs text-[#857768]">
                          {job.cafes?.name ?? job.owners?.business_name}
                          {job.owners?.is_verified && <VerifiedBadge size={12} />}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#857768]">
                          <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                          {job.salary_text && <span className="font-bold text-[#2b2118]">{job.salary_text}</span>}
                          {types.map((t) => (
                            <span key={t} className="rounded-full bg-[#f2ecdf] px-2 py-0.5 font-semibold text-[#6f6252]">{EMPLOYMENT_LABELS[t] ?? t}</span>
                          ))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="flex items-center gap-2 text-[11px] text-[#b6a98f]">
                          {relativeTime(job.created_at)}
                          <button type="button" disabled title="Saved jobs coming soon" aria-label="Save job (coming soon)" className="text-[#b6a98f]">
                            <Bookmark size={15} />
                          </button>
                        </span>
                        <ApplyButton jobId={job.id} size="sm" variant="coffee" label="Quick Apply" jobTypes={types} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* TENGAH — Featured + reviews */}
          <div className="min-w-0 space-y-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1">
            <FeaturedBarista barista={featured} isAnon={!user} />
            {reviews.length > 0 && (
              <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Recent Reviews from Cafe Owners</h3>
                  <Link href="/find-baristas" className="inline-flex items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
                    View all <ChevronRight size={13} />
                  </Link>
                </div>
                <ul className="mt-3 space-y-3">
                  {reviews.map((r, i) => (
                    <li key={i} className="rounded-xl bg-[#faf7ef] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[13px] font-bold">
                          <Store size={13} className="text-[#857768]" />
                          {r.owner?.business_name ?? "Cafe owner"}
                        </p>
                        <span className="flex items-center gap-0.5" aria-label={`${r.stars} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={12} className={s < r.stars ? "fill-[#c98a2b] text-[#c98a2b]" : "text-[#d8cdae]"} />
                          ))}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-5 text-[#6f6252] italic">&ldquo;{r.comment}&rdquo;</p>
                      <p className="mt-1 text-[11px] text-[#b6a98f]">for {r.barista?.full_name ?? "a barista"}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* KANAN — ekosistem */}
          <aside className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1">
            <SidebarKerja />
          </aside>
        </div>
      </section>

      {/* Strip bawah melebar */}
      <section className="mt-3 w-full shrink-0 bg-[#2b1c11]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 sm:px-6 py-3">
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
        </div>
      </section>
    </div>
  );
}
