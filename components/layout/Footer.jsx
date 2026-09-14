"use client";

import { usePathname } from "next/navigation";

// 3 tingkat: landing kertas → funnel coklat sedang → dalam coklat tua.
const AUTH_ROUTES = ["/login", "/signup"];

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAuth =
    AUTH_ROUTES.includes(pathname) || pathname.startsWith("/onboarding");
  return (
    <footer className={
      isLanding
        ? "mt-auto border-t-2 border-dashed border-[#2f2721]/20 bg-[#a2977f]/50"
        : isAuth
          ? "mt-auto border-t border-[#ece0c9]/15 bg-[#3e3125]"
          : "mt-auto border-t border-latte/60 bg-[#16100d]/40"
    }>
      <div className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs sm:flex-row ${isLanding ? "text-[#2f2721]/70" : isAuth ? "text-[#ece0c9]/65" : "text-espresso-soft"}`}>
        <p>© {new Date().getFullYear()} BaristaConnect — hubungan barista & coffee shop</p>
        <p>Dibuat dengan ☕ di Indonesia</p>
      </div>
    </footer>
  );
}
