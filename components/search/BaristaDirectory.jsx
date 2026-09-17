"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, UsersRound, X } from "lucide-react";
import BaristaCard from "@/components/cards/BaristaCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import Toggle from "@/components/ui/Toggle";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { SKILL_PRESETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function BaristaDirectory({ ownerId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalisasi param URL (dipakai hero dashboard, quick filter, navbar owner).
  // type: "full-time" (URL) -> "full_time" (enum DB).
  const normType = (t) => (t ?? "").toString().trim().toLowerCase().replace(/-/g, "_");
  const initQ = (searchParams.get("q") ?? "").toString();
  const initAvailable = searchParams.get("available");
  const initMinRating = parseFloat(searchParams.get("minRating") ?? "") || 0;
  const initType = normType(searchParams.get("type"));
  const initLoc = (searchParams.get("loc") ?? "").toString();

  const [q, setQ] = useState(initQ);
  const [skills, setSkills] = useState(() => (initQ && SKILL_PRESETS.some((s) => s.toLowerCase() === initQ.trim().toLowerCase()) ? [SKILL_PRESETS.find((s) => s.toLowerCase() === initQ.trim().toLowerCase())] : []));
  const [loc, setLoc] = useState(initLoc);
  const [minExp, setMinExp] = useState(0);
  const [openOnly, setOpenOnly] = useState(initAvailable === null ? true : initAvailable !== "0");
  const [minRating, setMinRating] = useState(initMinRating);
  const [typeFilter, setTypeFilter] = useState(initType);
  const [sort, setSort] = useState("open");

  const [list, setList] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const debounceRef = useRef(null);

  // State diinisialisasi dari URL sekali saat mount; navigasi antar-query me-remount
  // via key={...} dari page (lihat app/find-baristas/page.jsx).

  const fetchList = useCallback(async () => {
    const supabase = createClient();
    let req = supabase.from("baristas_public").select("*");
    if (openOnly) req = req.eq("is_open_to_work", true);
    if (loc.trim()) req = req.ilike("location_place", `%${loc.trim()}%`);
    if (minExp > 0) req = req.gte("years_of_experience", minExp);
    if (skills.length > 0) req = req.overlaps("skills", skills);
    if (typeFilter) req = req.overlaps("open_to_types", [typeFilter]);

    req =
      sort === "exp"
        ? req.order("years_of_experience", { ascending: false })
        : req
            .order("is_open_to_work", { ascending: false })
            .order("years_of_experience", { ascending: false });

    const { data } = await req;
    const { attachRatings } = await import("@/lib/publicProfiles");
    let rows = await attachRatings(data ?? [], supabase);

    // q: cari di nama, lokasi, bio, + skill (client-side, karena array + or_ sekaligus ribet di PostgREST).
    const needle = q.trim().toLowerCase();
    if (needle) {
      rows = rows.filter((b) =>
        [b.full_name, b.location_place, b.ideas_plus, b.cover_letter, (b.skills ?? []).join(" ")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }

    // minRating: rata-rata dari join ratings.
    if (minRating > 0) {
      rows = rows.filter((b) => {
        const rs = (b.ratings ?? []).map((r) => r.stars).filter((s) => typeof s === "number");
        if (!rs.length) return false;
        return rs.reduce((s, v) => s + v, 0) / rs.length >= minRating;
      });
    }

    setList(rows);
  }, [skills, loc, minExp, openOnly, sort, q, minRating, typeFilter]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchList, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchList]);

  async function startChat(baristaId) {
    if (!ownerId) { router.push(`/login?next=/barista/${baristaId}`); return; }
    const supabase = createClient();
    const { data: cid } = await supabase.rpc("get_or_create_conversation", {
      p_owner: ownerId,
      p_barista: baristaId,
    });
    if (cid) router.push(`/messages/${cid}`);
  }

  function toggleSkill(s) {
    setSkills((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    );
  }

  const activeFilters = skills.length + (loc ? 1 : 0) + (minExp > 0 ? 1 : 0) + (minRating > 0 ? 1 : 0) + (typeFilter ? 1 : 0) + (q.trim() ? 1 : 0);
  function resetAll() {
    setSkills([]);
    setLoc("");
    setMinExp(0);
    setOpenOnly(true);
    setMinRating(0);
    setTypeFilter("");
    setQ("");
    router.replace("/find-baristas", { scroll: false });
  }
  const filterPanel = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-bold text-espresso">Skill</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSkill(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                skills.includes(s)
                  ? "bg-caramel text-white"
                  : "border border-latte card-dark text-espresso-soft hover:border-caramel hover:text-caramel"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-espresso">Lokasi</p>
        <input
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="cth. Bandung"
          className="w-full rounded-xl border border-latte card-dark px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-espresso">
          Pengalaman minimal:{" "}
          <span className="text-caramel">{minExp} tahun</span>
        </p>
        <input
          type="range"
          min={0}
          max={8}
          step={1}
          value={minExp}
          onChange={(e) => setMinExp(Number(e.target.value))}
          className="w-full accent-[#c4622d]"
        />
      </div>

      <Toggle
        checked={openOnly}
        onChange={setOpenOnly}
        label="Hanya yang buka kerja"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">Cari Barista</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        {list === null ? "Memuat..." : `${list.length} barista ditemukan`}
      </p>

      {/* toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-latte card-dark px-4 py-2 focus-within:border-caramel sm:max-w-sm">
          <Search size={15} className="shrink-0 text-espresso-soft" aria-hidden="true" />
          <label htmlFor="dir-q" className="sr-only">Cari nama, skill, atau lokasi</label>
          <input
            id="dir-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, skill, atau lokasi..."
            autoComplete="off"
            className="h-6 w-full bg-transparent text-sm text-espresso placeholder:text-espresso-soft/60 focus:outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Hapus pencarian" className="shrink-0 text-espresso-soft hover:text-espresso">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="relative inline-flex items-center gap-2 rounded-xl card-dark px-4 py-2.5 text-sm font-bold text-espresso hover:border-caramel hover:text-caramel md:hidden"
        >
          <SlidersHorizontal size={16} /> Filter
          {activeFilters > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-extrabold text-white">
              {activeFilters}
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="font-semibold text-espresso-soft">Urutkan:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl card-dark px-3 py-2 text-sm font-bold outline-none focus:border-caramel"
          >
            <option value="open">Buka kerja dulu</option>
            <option value="exp">Pengalaman tertinggi</option>
          </select>
        </div>
      </div>

      {/* filter URL aktif dari hero/quick-filter */}
      {(minRating > 0 || typeFilter) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {minRating > 0 && (
            <button type="button" onClick={() => setMinRating(0)} className="inline-flex items-center gap-1 rounded-full bg-caramel px-3 py-1 font-bold text-white">
              Rating {minRating}+ <X size={12} />
            </button>
          )}
          {typeFilter && (
            <button type="button" onClick={() => setTypeFilter("")} className="inline-flex items-center gap-1 rounded-full bg-caramel px-3 py-1 font-bold text-white">
              {typeFilter.replace(/_/g, "-")} <X size={12} />
            </button>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden self-start rounded-2xl card-dark p-5 md:sticky md:top-20 md:block">
          <p className="mb-4 flex items-center justify-between text-sm font-extrabold text-espresso">
            Filter
            {activeFilters > 0 && (
              <button
                onClick={resetAll}
                className="text-[11px] font-bold text-caramel hover:underline"
              >
                reset
              </button>
            )}
          </p>
          {filterPanel}
        </aside>

        {/* grid */}
        <div className="grid gap-4 pb-10 sm:grid-cols-2 xl:grid-cols-3">
          {list === null &&
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

          {list !== null && list.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyState
                icon={<UsersRound size={22} />}
                title="Tidak ada barista cocok"
                subtitle="Longgarkan filter kamu atau matikan opsi 'hanya buka kerja'."
                actionLabel={
                  activeFilters > 0 || openOnly ? "Reset semua filter" : undefined
                }
                actionHref={undefined}
              />
            </div>
          )}

          {list !== null &&
            list.map((b) => (
              <BaristaCard
                key={b.id}
                barista={b}
                actions={
                  <>
                    <Button size="sm" href={`/barista/${b.id}`}>
                      Lihat Profil
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => startChat(b.id)}
                    >
                      Chat
                    </Button>
                  </>
                }
              />
            ))}
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter">
        {filterPanel}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            full
            onClick={() => {
              resetAll();
            }}
          >
            Reset
          </Button>
          <Button full onClick={() => setSheetOpen(false)}>
            Terapkan ({list?.length ?? 0})
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
