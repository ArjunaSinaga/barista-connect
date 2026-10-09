"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import NotifBell from "@/components/NotifBell";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { APP_NAME } from "@/lib/constants";

const NAV = [
  { label: "Loker", href: "/jobs", match: ["/jobs"] },
  { label: "Talenta", href: "/find-baristas", match: ["/find-baristas", "/barista"] },
  { label: "Ulasan", href: "/reviews", match: ["/reviews"] },
  { label: "Pelatihan", href: "/training", match: ["/training"] },
  { label: "Feed", href: "/feed", match: ["/feed"] },
];

export default function Navbar({ user, role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const home = role === "owner" ? "/dashboard/owner" : "/dashboard/barista";
  const profileHref = role === "owner" ? "/dashboard/owner/profile" : "/dashboard/barista/profile";
  const postJobHref = role === "owner" ? "/dashboard/owner/jobs/new" : "/register?role=employer";
  const initial = (user?.email?.[0] ?? "?").toUpperCase();
  const roleLabel = role === "owner" ? "Pemilik Kafe" : role === "barista" ? "Barista" : null;

  async function handleLogout() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }



  const isActive = (m) => m.some((p) => pathname === p || pathname?.startsWith(p + "/"));
  const forOwnersActive = pathname?.startsWith("/dashboard/owner") || pathname === "/register";
  // REG-19: di halaman pendaftaran, tombol Daftar disembunyikan (anti loop) — Masuk tetap ada (REG-18).
  const onRegisterPage = pathname === "/register" || pathname?.startsWith("/signup");

  return (
    <header className="sticky top-0 z-40 border-b border-[#e0d5bd] bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 sm:px-6">
        <span className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight">
            <Link href="/" aria-label="Beranda" title="Beranda" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-[#e0d5bd]">
              <Image src="/images/landing/logo.jpg" alt="kerja.inc" width={32} height={32} className="h-8 w-8 object-cover" />
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
              className={`inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-2.5 text-sm font-semibold whitespace-nowrap sm:px-3 ${
                isActive(n.match)
                  ? "text-[#2f2721] underline decoration-[#3d2c1e] decoration-2 underline-offset-8"
                  : "text-[#2f2721]/70 hover:text-[#6f5a3e]"
              }`}
            >
              {n.label}
            </Link>
          ))}
          {!user && (
          <Link
            href="/register?role=employer"
            className={`hidden min-h-[44px] shrink-0 items-center rounded-lg px-2.5 text-sm font-semibold whitespace-nowrap sm:px-3 lg:inline-flex ${
              forOwnersActive
                ? "text-[#2f2721] underline decoration-[#3d2c1e] decoration-2 underline-offset-8"
                : "text-[#2f2721]/70 hover:text-[#6f5a3e]"
            }`}
          >
            Untuk Owner
          </Link>
          )}
        </nav>

        <HeaderSearch />

        {user ? (
          <>
            <Link
              href="/messages"
              aria-label="Pesan"
              title="Pesan"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-[#2f2721]/70 hover:bg-[#2f2721]/10 hover:text-[#6f5a3e]"
            >
              <MessageSquareText size={19} />
            </Link>
            <NotifBell />
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex min-h-[44px] items-center gap-1.5 rounded-full py-1 pr-1 pl-1 hover:bg-[#2f2721]/10"
              >
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-coffee text-xs font-extrabold text-white">
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
                <div role="menu" className="absolute right-0 mt-1 w-44 overflow-hidden rounded-xl border border-[#e0d5bd] bg-white py-1 shadow-lg">
                  <Link href={home} role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-[#2f2721] hover:bg-paper">
                    Dashboard
                  </Link>
                  <Link href={profileHref} role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-[#2f2721] hover:bg-paper">
                    Profil
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-red-700 hover:bg-paper disabled:opacity-50"
                  >
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              )}
            </div>
            {role === "owner" && (
            <Link
              href={postJobHref}
              className="hidden shrink-0 rounded-full bg-coffee px-4 py-2 text-sm font-bold whitespace-nowrap text-white hover:bg-[#2e2015] sm:block"
            >
              Pasang Loker
            </Link>
            )}
          </>
        ) : (
          <>
            <Link
              href="/register?role=employer"
              className="ml-auto hidden shrink-0 rounded-full bg-coffee px-4 py-2 text-sm font-bold whitespace-nowrap text-white hover:bg-[#2e2015] md:block"
            >
              Pasang Loker
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-xl px-3 text-sm font-bold whitespace-nowrap text-[#2f2721] hover:text-[#6f5a3e]"
            >
              Masuk
            </Link>
            {!onRegisterPage && (
            <Link
              href="/register"
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-xl bg-caramel px-4 text-sm font-bold whitespace-nowrap text-white shadow-sm hover:bg-caramel-dark"
            >
              Daftar
            </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
