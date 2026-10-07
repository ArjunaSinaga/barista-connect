"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

// Satu search bar global di header. Sembunyi otomatis di halaman
// yang sudah punya search sendiri (loker, talenta, dst) agar tidak dobel.
const OWN_SEARCH_PREFIXES = ["/jobs", "/find-baristas", "/barista", "/training", "/academy", "/cafes"];

export default function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("jobs");

  if (OWN_SEARCH_PREFIXES.some((p) => pathname === p || pathname?.startsWith(p + "/"))) {
    return null;
  }

  function onSubmit(e) {
    e.preventDefault();
    const needle = q.trim();
    if (!needle) return;
    router.push(`${scope === "talenta" ? "/find-baristas" : "/jobs"}?q=${encodeURIComponent(needle)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="hidden min-w-0 items-center gap-1 rounded-full bg-white px-2 py-1 md:flex">
      <label htmlFor="header-scope" className="sr-only">Target pencarian</label>
      <select
        id="header-scope"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="cursor-pointer bg-transparent text-xs font-bold text-espresso outline-none"
      >
        <option value="jobs">Loker</option>
        <option value="talenta">Talenta</option>
      </select>
      <label htmlFor="header-q" className="sr-only">Cari</label>
      <input
        id="header-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari..."
        autoComplete="off"
        className="h-6 w-24 bg-transparent text-xs text-espresso placeholder:text-[#b6a98f] focus:outline-none lg:w-36"
      />
      <button
        type="submit"
        aria-label="Cari"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#2f2721]/60 hover:bg-paper hover:text-[#6f5a3e]"
      >
        <Search size={14} />
      </button>
    </form>
  );
}
