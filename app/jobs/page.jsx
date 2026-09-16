import Link from "next/link";
import { Suspense } from "react";
import { Search, MapPin } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { CITIES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { avgStars } from "@/lib/ratings";
import { EmptyState } from "@/components/ui/EmptyState";
import JobsProfileCard from "@/components/jobs/JobsProfileCard";
import JobListRow from "@/components/jobs/JobListRow";
import JobDetailPanel from "@/components/jobs/JobDetailPanel";
import SortSelect from "@/components/jobs/SortSelect";

export const metadata = { title: "Jobs" };

const ROLE_PILLS = [
  { label: "All", href: "/jobs" },
  { label: "Barista", href: "/jobs?q=Barista" },
  { label: "Head Barista", href: "/jobs?q=Head" },
  { label: "Full-time", href: "/jobs?type=full_time" },
  { label: "Part-time", href: "/jobs?type=part_time" },
  { label: "Casual", href: "/jobs?type=casual" },
];

export default async function JobsPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q ?? "").toString().trim();
  const loc = (params?.loc ?? "").toString().trim();
  const type = (params?.type ?? "").toString().trim();
  const jobParam = (params?.job ?? "").toString().trim();
  const savedOnly = params?.saved === "1";
  const sort = ["oldest", "name"].includes(params?.sort) ? params.sort : "newest";

  const { user, profile } = await getSessionSafe();
  const isBarista = profile?.role === "barista";
  const isOwner = profile?.role === "owner";

  let jobs = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const orderOpt = sort === "oldest"
        ? { column: "created_at", ascending: true }
        : sort === "name"
          ? { column: "title", ascending: true }
          : { column: "created_at", ascending: false };
      let req = supabase
        .from("job_posts")
        .select("*, owners(business_name, is_verified), cafes(id, name)")
        .eq("is_active", true)
        .order(orderOpt.column, { ascending: orderOpt.ascending });
      if (q) req = req.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (loc) req = req.ilike("location", `%${loc}%`);
      if (type && EMPLOYMENT_TYPES.some((t) => t.value === type)) req = req.overlaps("employment_types", [type]);
      const { data } = await req;
      jobs = data ?? [];
    } catch {
      jobs = [];
    }
  }

  const selectedId = jobParam || "__first__";

  // Detail selected: rating cafe + ulasan + status lamaran/simpanan.
  let cafeAvg = null;
  let cafeCount = 0;
  let cafeReviews = [];
  let appliedIds = new Set();
  let savedIds = new Set();
  let barista = null;
  let appliedCount = 0;
  let savedCount = 0;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      if (isBarista && user) {
        const [{ data: bp }, { data: apps }, { data: saved }] = await Promise.all([
          supabase.from("barista_profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("applications").select("job_post_id").eq("barista_id", user.id),
          supabase.from("saved_jobs").select("job_post_id").eq("barista_id", user.id),
        ]);
        barista = bp ?? null;
        appliedIds = new Set((apps ?? []).map((a) => a.job_post_id));
        savedIds = new Set((saved ?? []).map((s) => s.job_post_id));
        appliedCount = appliedIds.size;
        savedCount = savedIds.size;
      }
    } catch {
      // diam: halaman tetap render dengan data parsial
    }
  }

  if (savedOnly) {
    jobs = isBarista ? jobs.filter((j) => savedIds.has(j.id)) : [];
  }
  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0] ?? null;
  const appliedSelected = selected ? appliedIds.has(selected.id) : false;
  const savedSelected = selected ? savedIds.has(selected.id) : false;

  if (selected && isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      {
        const { data: teams } = await supabase.from("team_members").select("id").eq("owner_id", selected.owner_id);
        const tids = (teams ?? []).map((t) => t.id);
        if (tids.length) {
          const { data: cr } = await supabase
            .from("cafe_ratings")
            .select("stars, comment, created_at")
            .in("team_member_id", tids)
            .order("created_at", { ascending: false })
            .limit(10);
          cafeCount = (cr ?? []).length;
          cafeAvg = avgStars(cr ?? []);
          cafeReviews = (cr ?? []).filter((r) => r.comment);
        }
      }
    } catch {
      // diam: panel tetap render tanpa rating
    }
  }

  const selTypes = selected
    ? selected.employment_types?.length
      ? selected.employment_types
      : selected.employment_type
        ? [selected.employment_type]
        : []
    : [];
  const selCafeName = selected ? (selected.cafes?.name ?? selected.owners?.business_name ?? "-") : "";

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2b2118] lg:flex lg:h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:min-h-0 lg:flex-1">
        <div className="grid items-start gap-4 lg:h-full lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_360px]">
          {/* Tengah: hero + filter + list */}
          <div className="order-1 min-w-0 space-y-3 lg:order-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
            <div className="relative overflow-hidden rounded-2xl bg-[#2b1c11] px-5 py-5 text-white sm:px-6">
              <h1 className="font-display max-w-xl text-balance text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                Find a career brewing with purpose.
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-white/70">
                Jobs for people who live and breathe coffee.
              </p>
              <form action="/jobs" method="GET" role="search" className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#ffffff] px-4 py-2">
                  <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
                  <label htmlFor="jobs-q" className="sr-only">Cari lowongan</label>
                  <input
                    id="jobs-q"
                    name="q"
                    defaultValue={q}
                    placeholder="Search job title, café, or keyword..."
                    autoComplete="off"
                    className="h-6 w-full bg-transparent text-xs text-[#2b2118] placeholder:text-[#b6a98f] focus:outline-none"
                  />
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#ffffff] px-4 py-2 sm:flex-none">
                    <MapPin size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
                    <label htmlFor="jobs-loc" className="sr-only">Lokasi</label>
                    <select
                      id="jobs-loc"
                      name="loc"
                      defaultValue={loc}
                      className="h-6 w-full cursor-pointer bg-transparent text-xs font-bold text-[#2b2118] outline-none sm:w-32"
                    >
                      <option value="">Semua lokasi</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {type && <input type="hidden" name="type" value={type} />}
                  <button
                    type="submit"
                    className="inline-flex min-h-[36px] shrink-0 items-center rounded-full bg-[#c98a2b] px-5 text-xs font-bold text-white hover:brightness-95"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {ROLE_PILLS.map((p) => {
                const activePill =
                  (p.label === "All" && !q && !type) ||
                  (p.href.includes("?q=") && q === decodeURIComponent(p.href.split("?q=")[1])) ||
                  (p.href.includes("?type=") && type === p.href.split("?type=")[1]);
                return (
                  <Link
                    key={p.label}
                    href={p.href}
                    aria-current={activePill ? "page" : undefined}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                      activePill
                        ? "border-[#3d2c1e] bg-[#3d2c1e] text-white"
                        : "border-[#e0d5bd] bg-[#ffffff] text-[#6f6252] hover:border-[#3d2c1e] hover:text-[#3d2c1e]"
                    }`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[#857768]" role="status">
                {savedOnly ? `${jobs.length} saved job${jobs.length === 1 ? "" : "s"}` : `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`}
                {(q || loc || type || savedOnly) && (
                  <Link href="/jobs" className="ml-2 font-bold text-[#2b6cb0] hover:underline">
                    Reset filter
                  </Link>
                )}
              </p>
              <Suspense>
                <SortSelect value={sort} />
              </Suspense>
            </div>

            {!jobs.length ? (
              <EmptyState
                icon={<Search size={20} />}
                title={savedOnly ? "No saved jobs" : "No matching jobs"}
                subtitle={savedOnly ? "Tap the bookmark on any job to keep it here." : "Try different keywords or clear the filters."}
                actionLabel="View all"
                actionHref="/jobs"
              />
            ) : (
              <ul className="space-y-2.5">
                {jobs.map((job) => (
                  <JobListRow
                    key={job.id}
                    job={job}
                    active={job.id === selected?.id}
                    applied={appliedIds.has(job.id)}
                    saved={savedIds.has(job.id)}
                    showApply={isBarista}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Kanan: panel detail */}
          <div className="order-2 min-w-0 lg:order-3 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
            {selected ? (
              <JobDetailPanel
                job={selected}
                cafeName={selCafeName}
                cafeHref={selected.cafe_id ? `/cafes/${selected.cafe_id}` : null}
                types={selTypes}
                avg={cafeAvg}
                count={cafeCount}
                reviews={cafeReviews}
                applied={appliedSelected}
                saved={savedSelected}
                canApply={!isOwner}
              />
            ) : (
              <EmptyState
                icon={<Search size={20} />}
                title="Select a job"
                subtitle="Click any job to see its details here."
              />
            )}
          </div>

          {/* Kiri: profil */}
          <div className="order-3 min-w-0 lg:order-1 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
            <JobsProfileCard barista={barista} appliedCount={appliedCount} savedCount={savedCount} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}
