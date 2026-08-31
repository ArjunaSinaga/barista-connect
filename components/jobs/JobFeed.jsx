"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import JobCard from "@/components/cards/JobCard";
import ApplyButton from "@/components/jobs/ApplyButton";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { EMPLOYMENT_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function JobFeed({ myRole }) {
  const [query, setQuery] = useState("");
  const [loc, setLoc] = useState("");
  const [types, setTypes] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [jobs, setJobs] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [activeCount, setActiveCount] = useState(0);
  const debounceRef = useRef(null);

  // applied badges (barista sessions only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "barista" || cancelled) return;
      const { data } = await supabase
        .from("applications")
        .select("job_post_id")
        .eq("barista_id", user.id);
      if (!cancelled && data) {
        setAppliedIds(new Set(data.map((a) => a.job_post_id)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchJobs = useCallback(async () => {
    const supabase = createClient();
    let req = supabase
      .from("job_posts")
      .select("*, owners(business_name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (query.trim()) {
      req = req.or(
        `title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%`
      );
    }
    if (loc.trim()) req = req.ilike("location", `%${loc.trim()}%`);
    if (types.length > 0) req = req.in("employment_type", types);

    const { data } = await req;
    setJobs(data ?? []);
  }, [query, loc, types]);

  // debounced refetch on filter change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs();
    }, query ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [fetchJobs, query]);

  function toggleType(v) {
    setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }

  const activeFilters =
    (loc ? 1 : 0) +
    types.length +
    (query ? 1 : 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">
        Lowongan Barista
      </h1>
      <p className="mt-1 text-sm text-espresso-soft">
        {jobs === null
          ? "Memuat lowongan..."
          : `${jobs.length} lowongan aktif ditemukan`}
      </p>

      {/* Search + filter trigger */}
      <div className="sticky top-14 z-30 -mx-4 mt-4 bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-espresso-soft"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari posisi, cth. barista shift pagi"
              className="w-full rounded-xl border border-latte bg-white py-2.5 pr-9 pl-10 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-espresso-soft hover:text-espresso"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex items-center gap-2 rounded-xl border border-latte bg-white px-4 text-sm font-bold text-espresso hover:border-caramel hover:text-caramel"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filter</span>
            {activeFilters > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-extrabold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5 space-y-4 pb-20">
        {jobs === null &&
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {jobs !== null && jobs.length === 0 && (
          <EmptyState
            icon={<Search size={22} />}
            title="Tidak ada lowongan cocok"
            subtitle="Coba ubah kata kunci atau hapus beberapa filter."
          />
        )}

        {jobs !== null &&
          jobs.map((job) =>
            myRole === "barista" ? (
              <JobCard
                key={job.id}
                job={job}
                ownerName={job.owners?.business_name}
                actions={
                  <ApplyButton
                    jobId={job.id}
                    applied={appliedIds.has(job.id)}
                    size="sm"
                  />
                }
              />
            ) : (
              <JobCard
                key={job.id}
                job={job}
                ownerName={job.owners?.business_name}
              />
            )
          )}
      </div>

      {/* Filter sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-bold text-espresso">Lokasi</p>
            <input
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="cth. Bandung"
              className="w-full rounded-xl border border-latte bg-white px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-espresso">Tipe kerja</p>
            <div className="space-y-2">
              {EMPLOYMENT_TYPES.map((t) => (
                <label
                  key={t.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-latte bg-white px-4 py-3 text-sm font-semibold has-checked:border-caramel has-checked:bg-caramel/5"
                >
                  <input
                    type="checkbox"
                    checked={types.includes(t.value)}
                    onChange={() => toggleType(t.value)}
                    className="h-4 w-4 accent-[#c4622d]"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              full
              onClick={() => {
                setLoc("");
                setTypes([]);
              }}
            >
              Reset
            </Button>
            <Button full onClick={() => setSheetOpen(false)}>
              Terapkan ({jobs?.length ?? 0})
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
