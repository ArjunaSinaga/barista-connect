"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Coffee, MessageSquareText, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

export default function Navbar({ user, role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const home = role === "owner" ? "/dashboard/owner" : "/dashboard/barista";
  const profileHref = role === "owner" ? "/dashboard/owner/profile" : "/dashboard/barista/profile";
  // Jembatan terang-gelap: di landing navbar ikut kertas, di dalam ikut dark roast.
  const light = pathname === "/";

  async function handleLogout() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className={light
      ? "sticky top-0 z-40 border-b border-[#e0d5bd] bg-[#f5f1e8]/90 backdrop-blur"
      : "sticky top-0 z-40 border-b border-latte/60 bg-cream/85 backdrop-blur"}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-extrabold tracking-tight">
          <Link href="/" aria-label="Beranda" title="Beranda" className="flex h-8 w-8 items-center justify-center rounded-xl bg-caramel text-white hover:bg-caramel-dark">
            <Coffee size={17} />
          </Link>
          <Link href={user ? home : "/"} title={user ? "Dashboard" : "Beranda"} className={light ? "text-[#2f2721] hover:text-[#6f5a3e]" : "text-espresso hover:text-caramel"}>
            {APP_NAME}
          </Link>
        </span>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/jobs"
            className={light
              ? "rounded-lg px-3 py-2 text-sm font-semibold text-[#2f2721]/70 hover:text-[#6f5a3e]"
              : "rounded-lg px-3 py-2 text-sm font-semibold text-espresso-soft hover:text-caramel"}
          >
            Jobs
          </Link>
          <Link
            href="/find-baristas"
            className={light
              ? "hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#2f2721]/70 hover:text-[#6f5a3e] sm:block"
              : "hidden rounded-lg px-3 py-2 text-sm font-semibold text-espresso-soft hover:text-caramel sm:block"}
          >
            Talent
          </Link>
          {user ? (
            <>
              <Link
                href={profileHref}
                className={light
                  ? "hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#2f2721]/70 hover:text-[#6f5a3e] sm:block"
                  : "hidden rounded-lg px-3 py-2 text-sm font-semibold text-espresso-soft hover:text-caramel sm:block"}
              >
                Profil
              </Link>
              <Link
                href="/messages"
                aria-label="Pesan"
                className={light
                  ? "rounded-full p-2 text-[#2f2721]/70 hover:bg-[#2f2721]/10 hover:text-[#6f5a3e]"
                  : "rounded-full p-2 text-espresso-soft hover:bg-cream-dark hover:text-caramel"}
              >
                <MessageSquareText size={19} />
              </Link>
              <button
                onClick={handleLogout}
                disabled={busy}
                aria-label="Keluar"
                title="Keluar"
                className={light
                  ? "rounded-full p-2 text-[#2f2721]/70 hover:bg-[#2f2721]/10 hover:text-red-700 disabled:opacity-50"
                  : "rounded-full p-2 text-espresso-soft hover:bg-cream-dark hover:text-red-500 disabled:opacity-50"}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={light
                  ? "rounded-xl px-4 py-2 text-sm font-bold text-[#2f2721] hover:text-[#6f5a3e]"
                  : "rounded-xl px-4 py-2 text-sm font-bold text-espresso hover:text-caramel"}
              >
                Masuk
              </Link>
              <Link
                href="/signup?role=owner"
                className="hidden rounded-full bg-[#3d2c1e] px-4 py-2 text-sm font-bold text-white hover:bg-[#2e2015] sm:block"
              >
                Post a Job
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-caramel px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-caramel-dark"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
