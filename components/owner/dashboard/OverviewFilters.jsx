"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, CalendarDays } from "lucide-react";

// Filter hero overview: outlet + rentang tanggal -> ?outlet=&range= (server render ulang).
const RANGES = [
  { value: "7", label: "7 hari terakhir" },
  { value: "30", label: "30 hari terakhir" },
  { value: "90", label: "90 hari terakhir" },
  { value: "all", label: "Semua waktu" },
];

export default function OverviewFilters({ cafes, outlet, range }) {
  const router = useRouter();
  const params = useSearchParams();

  function set(key, v) {
    const next = new URLSearchParams(params.toString());
    next.set("tab", "dashboard");
    if (v) next.set(key, v);
    else next.delete(key);
    router.push(`/dashboard/owner?${next.toString()}`, { scroll: false });
  }

  const sel = "flex cursor-pointer items-center gap-1.5 rounded-full border border-[#e0d5bd] bg-white px-3 py-1.5 text-[11px] font-bold text-espresso outline-none";

  return (
    <div className="flex flex-wrap gap-2">
      <label className="sr-only" htmlFor="ov-outlet">Outlet</label>
      <span className={sel}>
        <MapPin size={12} className="text-espresso-soft" />
        <select id="ov-outlet" value={outlet} onChange={(e) => set("outlet", e.target.value)} className="cursor-pointer bg-transparent outline-none" aria-label="Filter outlet">
          <option value="">Semua Outlet{cavesLen(cafes)}</option>
          {cafes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </span>
      <label className="sr-only" htmlFor="ov-range">Rentang tanggal</label>
      <span className={sel}>
        <CalendarDays size={12} className="text-espresso-soft" />
        <select id="ov-range" value={range} onChange={(e) => set("range", e.target.value)} className="cursor-pointer bg-transparent outline-none" aria-label="Rentang tanggal">
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </span>
    </div>
  );
}

function cavesLen(cafes) {
  return cafes?.length ? ` (${cafes.length})` : "";
}
