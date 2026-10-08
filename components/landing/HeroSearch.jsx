"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { CITIES } from "@/lib/constants";

// Search hero mockup UI-01: kolom cari loker + baris "Looking to hire? Hire Workers".
import Link from "next/link";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    const needle = q.trim();
    if (needle) params.set("q", needle);
    if (loc) params.set("location", loc);
    if (!params.toString()) return;
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <div className="mt-4">
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
            placeholder="Judul loker, skill, atau kafe..."
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
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-espresso-soft">
        Looking to hire?
        <Link
          href="/find-baristas"
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-[#d8cdae] bg-white/70 px-4 font-bold text-espresso hover:border-coffee"
        >
          Hire Workers <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
