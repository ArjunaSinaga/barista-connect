import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { EMPLOYMENT_TYPES } from "@/lib/constants";
import { avgStars } from "@/lib/ratings";
import { matchPayBand, matchShift, recoScore } from "@/lib/jobFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import JobsProfileCard from "@/components/jobs/JobsProfileCard";
import JobDetailPanel from "@/components/jobs/JobDetailPanel";
import JobsSearchForm from "@/components/jobs/JobsSearchForm";
import JobsFilterBar from "@/components/jobs/JobsFilterBar";
import JobsResults from "@/components/jobs/JobsResults";

export const metadata = { title: "Loker" };
export const revalidate = 60; // tanpa filter: static 60s; ada searchParams/sesi: dynamic otomatis

// Pills akumulatif: klik pill tak me-reset filter lain (loc/q ikut dibawa).
function pillHref(base, patch) {
  const p = new URLSearchParams();
  const cur = { q: base.q, loc: base.loc, type: base.type };
  const next = { ...cur, ...patch };
  for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/jobs?${s}` : "/jobs";
}

const ROLE_PILLS = [
  { label: "Semua", patch: { q: "", type: "" }, active: (f) => !f.q && !f.type },
  { label: "Barista", patch: { q: "Barista" }, active: (f) => f.q === "Barista" },
  { label: "Front Office", patch: { q: "Front Office" }, active: (f) => f.q === "Front Office" },
  { label: "Server", patch: { q: "Server" }, active: (f) => f.q === "Server" },
  { label: "Penuh Waktu", patch: { type: "full_time" }, active: (f) => f.type === "full_time" },
  { label: "Paruh Waktu", patch: { type: "part_time" }, active: (f) => f.type === "part_time" },
  { label: "Harian", patch: { type: "casual" }, active: (f) => f.type === "casual" },
];

const PAGE_SIZE = 20;

export default async function JobsPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q ?? "").toString().trim();
  const loc = (params?.location ?? params?.loc ?? "").toString().trim();
  const type = (params?.type ?? "").toString().trim();
  const jobParam = (params?.job ?? "").toString().trim();
  const savedOnly = params?.saved === "1";
  const reco = params?.reco === "1";
  const pay = (params?.pay ?? "").toString().trim();
  const shift = (params?.shift ?? "").toString().trim();
  const verifiedOnly = params?.verified === "1";
  const hasSalaryOnly = params?.hasSalary === "1";
  const limit = Math.min(Math.max(Number(params?.limit) || PAGE_SIZE, PAGE_SIZE), 100);
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
        .select("*, cafes(id, name)")
        .eq("is_active", true)
        .order(orderOpt.column, { ascending: orderOpt.ascending });
      if (q) req = req.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (loc) req = req.ilike("location", `%${loc}%`);
      if (type && EMPLOYMENT_TYPES.some((t) => t.value === type)) req = req.overlaps("employment_types", [type]);
      const { data } = await req.limit(100);
      const { attachOwners } = await import("@/lib/publicProfiles");
      jobs = await attachOwners(data ?? [], supabase);
    } catch {
      jobs = [];
    }
  }

  // Detail selected: rating kafe + ulasan + status lamaran/simpanan.
  let cafeAvg = null;
  let cafeCount = 0;
  let cafeReviews = [];
  let appliedIds = new Set();
  let savedIds = new Set();
  let barista = null;
  let appliedCount = 0;
  let savedCount = 0;
  let unreadCount = 0;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      if (isBarista && user) {
        const [{ data: bp }, { data: apps }, { data: saved }, { data: notifs }] = await Promise.all([
          supabase.from("barista_profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("applications").select("job_post_id").eq("barista_id", user.id),
          supabase.from("saved_jobs").select("job_post_id").eq("barista_id", user.id),
          supabase.from("notifications").select("id").eq("user_id", user.id).eq("is_read", false).limit(100),
        ]);
        barista = bp ?? null;
        appliedIds = new Set((apps ?? []).map((a) => a.job_post_id));
        savedIds = new Set((saved ?? []).map((s) => s.job_post_id));
        appliedCount = appliedIds.size;
        savedCount = savedIds.size;
        unreadCount = (notifs ?? []).length;
      }
    } catch {
      // diam: halaman tetap render dengan data parsial
    }
  }

  // Filter sisi-JS (kolom DB tak tersedia): gaji, shift, verifikasi, ada-gaji, rekomendasi skill.
  if (pay) jobs = jobs.filter((j) => matchPayBand(j.salary_text, pay));
  if (shift) jobs = jobs.filter((j) => matchShift(j, shift));
  if (verifiedOnly) jobs = jobs.filter((j) => j.owners?.is_verified);
  if (hasSalaryOnly) jobs = jobs.filter((j) => !!j.salary_text);
  if (reco && barista?.skills?.length) {
    jobs = [...jobs].sort((a, b) => recoScore(b, barista.skills) - recoScore(a, barista.skills));
  }
  if (savedOnly) {
    jobs = isBarista ? jobs.filter((j) => savedIds.has(j.id)) : [];
  }

  const total = jobs.length;
  const visible = jobs.slice(0, limit);
  const selected = jobs.find((j) => j.id === jobParam) ?? visible[0] ?? null;
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

  // Query string filter aktif — dibawa di link kartu agar state pencarian tak hilang (H-02).
  const qsParams = new URLSearchParams();
  if (q) qsParams.set("q", q);
  if (loc) qsParams.set("loc", loc);
  if (type) qsParams.set("type", type);
  if (sort !== "newest") qsParams.set("sort", sort);
  if (pay) qsParams.set("pay", pay);
  if (shift) qsParams.set("shift", shift);
  if (verifiedOnly) qsParams.set("verified", "1");
  if (hasSalaryOnly) qsParams.set("hasSalary", "1");
  if (reco) qsParams.set("reco", "1");
  if (savedOnly) qsParams.set("saved", "1");
  const qs = qsParams.toString();
  const moreParams = new URLSearchParams(qsParams.toString());
  moreParams.set("limit", String(limit + PAGE_SIZE));

  return (
    <div className="min-h-screen bg-paper text-espresso lg:flex lg:h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:min-h-0 lg:flex-1">
        <div className="grid items-start gap-4 lg:h-full lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_360px]">
          {/* Tengah: hero + filter + list */}
          <div className="order-1 min-w-0 space-y-3 lg:order-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
            <div className="relative grid overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#faf6ec] md:grid-cols-[1fr_220px]">
              <div className="px-5 py-5 sm:px-6">
                <h1 className="font-display max-w-xl text-balance text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                  Temukan pekerjaan yang sesuai dengan keahlianmu.
                </h1>
                <p className="mt-1 max-w-xl text-xs leading-5 text-espresso-soft">
                  Loker kopi, front office, dan hospitality dari bisnis terpercaya di seluruh Indonesia.
                </p>
                <JobsSearchForm q={q} loc={loc} type={type} />
              </div>
              <div className="relative hidden min-h-44 md:block">
                <Image
                  src="/images/landing/barista-2.jpg"
                  alt="Barista menuang kopi"
                  fill
                  className="object-cover object-top"
                  sizes="220px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#faf6ec] via-transparent to-transparent" />
              </div>
            </div>

            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              {ROLE_PILLS.map((p) => {
                const f = { q, loc, type };
                const activePill = p.active(f);
                return (
                  <Link
                    key={p.label}
                    href={pillHref(f, p.patch)}
                    aria-current={activePill ? "page" : undefined}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${
                      activePill
                        ? "border-coffee bg-coffee text-white"
                        : "border-[#e0d5bd] bg-white text-espresso-soft hover:border-coffee hover:text-espresso"
                    }`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>

            <Suspense>
              <JobsFilterBar sort={sort} type={type} pay={pay} loc={loc} shift={shift} verified={verifiedOnly} hasSalary={hasSalaryOnly} />
            </Suspense>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-espresso-soft" role="status">
                {reco ? `${total} rekomendasi untukmu` : savedOnly ? `${total} loker tersimpan` : `${total} lowongan ditemukan`}
                {(q || loc || type || pay || shift || verifiedOnly || hasSalaryOnly || reco || savedOnly) && (
                  <Link href="/jobs" className="ml-2 font-bold text-link hover:underline">
                    Hapus filter
                  </Link>
                )}
              </p>
            </div>

            {!visible.length ? (
              <EmptyState
                icon={<Search size={20} />}
                title={savedOnly ? "Belum ada loker tersimpan" : "Tidak ada loker cocok"}
                subtitle={savedOnly ? "Ketuk bookmark di loker mana pun untuk menyimpannya di sini." : "Coba kata kunci lain atau hapus filter."}
                actionLabel="Lihat semua"
                actionHref="/jobs"
              />
            ) : (
              <>
                <Suspense>
                  <JobsResults
                    jobs={visible}
                    selectedId={selected?.id}
                    appliedIds={[...appliedIds]}
                    savedIds={[...savedIds]}
                    showApply={isBarista}
                    qs={qs}
                  />
                </Suspense>
                {total > visible.length && (
                  <div className="pt-1 text-center">
                    <Link
                      href={`/jobs?${moreParams.toString()}`}
                      scroll={false}
                      className="inline-flex min-h-[40px] items-center rounded-full border border-[#e0d5bd] bg-white px-6 text-xs font-bold text-espresso hover:border-coffee"
                    >
                      Muat lebih ({visible.length} dari {total})
                    </Link>
                  </div>
                )}
              </>
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
                title="Pilih loker"
                subtitle="Klik loker mana pun untuk melihat detailnya di sini."
              />
            )}
          </div>

          {/* Kiri: profil */}
          <div className="order-3 min-w-0 lg:order-1 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
            <JobsProfileCard barista={barista} appliedCount={appliedCount} savedCount={savedCount} isOwner={isOwner} unreadCount={unreadCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
