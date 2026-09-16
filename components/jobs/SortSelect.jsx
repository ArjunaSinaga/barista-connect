"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Dropdown sort untuk board: ganti ?sort= dengan mempertahankan filter lain.
export default function SortSelect({ value }) {
  const router = useRouter();
  const params = useSearchParams();

  function change(v) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", v);
    router.push(`/jobs?${next.toString()}`, { scroll: false });
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-[#857768]">
      <label htmlFor="jobs-sort">Sort by:</label>
      <select
        id="jobs-sort"
        value={value}
        onChange={(e) => change(e.target.value)}
        className="cursor-pointer rounded-full border border-[#e0d5bd] bg-[#ffffff] px-2.5 py-1 text-[11px] font-bold text-[#2b2118] outline-none"
      >
        <option value="newest">Most recent</option>
        <option value="oldest">Oldest</option>
        <option value="name">Name A–Z</option>
      </select>
    </span>
  );
}
