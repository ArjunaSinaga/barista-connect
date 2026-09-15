"use client";

import { usePathname } from "next/navigation";

// Satu tema kertas terang untuk semua halaman (homepage sembunyikan footer).
export default function Footer() {
  const pathname = usePathname();
  // Homepage = app-like 1 layar tanpa scroll halaman: footer disembunyikan.
  if (pathname === "/") return null;
  return (
    <footer className="mt-auto border-t border-[#e8e0cf] bg-[#efe9d9]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs sm:flex-row text-[#857768]">
        <p>© {new Date().getFullYear()} BaristaConnect — hubungan barista & coffee shop</p>
        <p>Dibuat dengan ☕ di Indonesia</p>
      </div>
    </footer>
  );
}
