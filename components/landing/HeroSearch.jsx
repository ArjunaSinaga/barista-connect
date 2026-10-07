"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { CITIES } from "@/lib/constants";

// Search hero mockup UI-01: toggle Cari Loker / Rekrut Barista,
// input keyword + dropdown lokasi + tombol Find Jobs.
export default function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState("jobs");
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    const needle = q.trim();
    if (needle) params.set("q", needle);
    if (loc) params.set("loc", loc);
    if (!params.toString()) return;
    router.push(`${mode === "talenta" ? "/find-baristas" : "/jobs"}?${params.toString()}`);
  }

  return (
    <div className="mt-4">
      <div role="tablist" aria-label="Mode pencarian" className="flex w-fit items-center gap-1 rounded-full bg-[#e4d9c2] p-1">
        {[
          ["jobs", "Looking to Hire?"],
          ["talenta", "Hire Workers"],
        ].map(([v, label]) => (
          <button
            key={v}
            role="tab"
            aria-selected={mode === v}
            type="button"
            onClick={() => setMode(v)}
            className={`min-h-[36px] rounded-full px-4 text-xs font-bold transition-colors ${
              mode === v ? "bg-white text-espresso shadow" : "text-espresso-soft hover:text-espresso"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        onSubmit={onSubmit}
        role="search"
        className="mt-2 flex flex-col gap-2 rounded-2xl border border-[#e8e0cf] bg-white p-2 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:flex-row sm:items-center"
      >
        <label className="flex min-h-[44px] flex-1 items-center gap-2 rounded-xl px-3">
          <Search size={16} className="shrink-0 text-[#b6a98f]" />
          <span className="sr-only">Kata kunci</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={mode === "talenta" ? "Skill, nama, atau peran..." : "Judul loker, skill, atau kafe..."}
            autoComplete="off"
            className="h-full w-full bg-transparent text-sm text-espresso placeholder:text-[#b6a98f] focus:outline-none"
          />
        </label>
        <label className="flex min-h-[44px] items-center gap-2 rounded-xl border-t border-[#eee5d2] px-3 sm:w-48 sm:border-t-0 sm:border-l">
          <MapPin size={16} className="shrink-0 text-[#b6a98f]" />
          <span className="sr-only">Lokasi</span>
          <select
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="h-full w-full cursor-pointer bg-transparent text-sm font-semibold text-espresso outline-none"
          >
            <option value="">Semua lokasi</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-coffee px-6 text-sm font-bold text-white hover:bg-[#2e2015]"
        >
          Find Jobs
        </button>
      </form>
    </div>
  );
}
