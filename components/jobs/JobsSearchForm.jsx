"use client";

import { MapPin, Search } from "lucide-react";
import { CITIES } from "@/lib/constants";

// ponytail: native form GET, loc auto-submit on change so users never get lost
export default function JobsSearchForm({ q, loc, type }) {
  return (
    <form action="/jobs" method="GET" role="search" className="mt-3 flex flex-col gap-2 sm:flex-row">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#ffffff] px-4 py-2">
        <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
        <label htmlFor="jobs-q" className="sr-only">Cari lowongan</label>
        <input
          id="jobs-q"
          name="q"
          defaultValue={q}
          placeholder="Cari judul, kafe, atau kata kunci..."
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
            onChange={(e) => e.target.form.requestSubmit()}
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
          Cari
        </button>
      </div>
    </form>
  );
}
