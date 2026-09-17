"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, Coffee, LogOut, MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

const NAV = [
  { label: "Jobs", href: "/jobs", match: ["/jobs"] },
  { label: "Talent", href: "/find-baristas", match: ["/find-baristas", "/barista"] },
  { label: "Reviews", href: "/reviews", match: ["/reviews"] },
  { label: "Training", href: "/training", match: ["/training"] },
];

export default function Navbar({ user, role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const home = role === "owner" ? "/dashboard/owner" : "/dashboard/barista";
  const profileHref = role === "owner" ? "/dashboard/owner/profile" : "/dashboard/barista/profile";
  const postJobHref = role === "owner" ? "/dashboard/owner/jobs/new" : "/signup?role=owner";
  const initial = (user?.email?.[0] ?? "?").toUpperCase();
  const roleLabel = role === "owner" ? "Owner" : role === "barista" ? "Barista" : null;

  async function handleLogout() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }



  const isActive = (m) => m.some((p) => pathname === p || pathname?.startsWith(p + "/"));
  const forOwnersActive = pathname?.startsWith("/dashboard/owner") || pathname === "/signup";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e0d5bd] bg-[#f5f1e8]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 sm:px-6">
        <span className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight">
          <Link href="/" aria-label="Beranda" title="Beranda" className="flex h-8 w-8 items-center justify-center rounded-xl bg-caramel text-white hover:bg-caramel-dark">
            <Coffee size={17} />
          </Link>
          <Link href={user ? home : "/"} title={user ? "Dashboard" : "Beranda"} className="hidden text-[#2f2721] hover:text-[#6f5a3e] min-[400px]:block">
            {APP_NAME}
          </Link>
        </span>

        <nav aria-label="Utama" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto no-scrollbar sm:gap-1">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              aria-current={isActive(n.match) ? "page" : undefined}
              className={`shrink-0 rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap sm:px-3 ${
                isActive(n.match)
                  ? "text-[#2f2721] underline decoration-[#3d2c1e] decoration-2 underline-offset-8"
                  : "text-[#2f2721]/70 hover:text-[#6f5a3e]"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={user ? home : "/signup?role=owner"}
            className={`hidden shrink-0 rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap sm:px-3 lg:block ${
              forOwnersActive
                ? "text-[#2f2721] underline decoration-[#3d2c1e] decoration-2 underline-offset-8"
                : "text-[#2f2721]/70 hover:text-[#6f5a3e]"
            }`}
          >
            For Owners
          </Link>
        </nav>

        {user ? (
          <>
            <Link
              href="/messages"
              aria-label="Pesan"
              title="Pesan"
              className="shrink-0 rounded-full p-2 text-[#2f2721]/70 hover:bg-[#2f2721]/10 hover:text-[#6f5a3e]"
            >
              <MessageSquareText size={19} />
            </Link>
            <Link
              href="/messages"
              aria-label="Notifikasi"
              title="Notifikasi"
              className="hidden shrink-0 rounded-full p-2 text-[#2f2721]/70 hover:bg-[#2f2721]/10 hover:text-[#6f5a3e] sm:block"
            >
              <Bell size={19} />
            </Link>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 rounded-full py-1 pr-1 pl-1 hover:bg-[#2f2721]/10"
              >
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3d2c1e] text-xs font-extrabold text-white">
                  {initial}
                </span>
                {roleLabel && (
                  <span className="hidden text-left leading-tight xl:block">
                    <span className="block max-w-24 truncate text-xs font-bold text-[#2f2721]">{user.email?.split("@")[0]}</span>
                    <span className="block text-[10px] text-[#2f2721]/60">{roleLabel}</span>
                  </span>
                )}
                <ChevronDown size={14} className="text-[#2f2721]/60" aria-hidden="true" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-1 w-44 overflow-hidden rounded-xl border border-[#e0d5bd] bg-[#ffffff] py-1 shadow-lg">
                  <Link href={home} role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-[#2f2721] hover:bg-[#f5f1e8]">
                    Dashboard
                  </Link>
                  <Link href={profileHref} role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-[#2f2721] hover:bg-[#f5f1e8]">
                    Profil
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-red-700 hover:bg-[#f5f1e8] disabled:opacity-50"
                  >
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              )}
            </div>
            <Link
              href={postJobHref}
              className="hidden shrink-0 rounded-full bg-[#3d2c1e] px-4 py-2 text-sm font-bold whitespace-nowrap text-white hover:bg-[#2e2015] sm:block"
            >
              Post a Job
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signup?role=owner"
              className="ml-auto hidden shrink-0 rounded-full bg-[#3d2c1e] px-4 py-2 text-sm font-bold whitespace-nowrap text-white hover:bg-[#2e2015] md:block"
            >
              Post a Job
            </Link>
            <Link
              href="/login"
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap text-[#2f2721] hover:text-[#6f5a3e]"
            >
              Masuk
            </Link>
            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-caramel px-4 py-2 text-sm font-bold whitespace-nowrap text-white shadow-sm hover:bg-caramel-dark"
            >
              Daftar
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
