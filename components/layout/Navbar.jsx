"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Coffee, MessageSquareText, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

export default function Navbar({ user, role }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const home = role === "owner" ? "/dashboard/owner" : "/dashboard/barista";

  async function handleLogout() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-latte/60 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-caramel text-white">
            <Coffee size={17} />
          </span>
          <span className="text-espresso">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/jobs"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-espresso-soft hover:text-caramel"
          >
            Lowongan
          </Link>
          {user ? (
            <>
              <Link
                href={home}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-espresso-soft hover:text-caramel sm:block"
              >
                Dashboard
              </Link>
              <Link
                href="/messages"
                aria-label="Pesan"
                className="rounded-full p-2 text-espresso-soft hover:bg-cream-dark hover:text-caramel"
              >
                <MessageSquareText size={19} />
              </Link>
              <button
                onClick={handleLogout}
                disabled={busy}
                aria-label="Keluar"
                title="Keluar"
                className="rounded-full p-2 text-espresso-soft hover:bg-cream-dark hover:text-red-500 disabled:opacity-50"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-bold text-espresso hover:text-caramel"
              >
                Masuk
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
