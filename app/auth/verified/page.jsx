"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VerifiedPage() {
  const [dest, setDest] = useState("/login");
  const [label, setLabel] = useState("Masuk sekarang");

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        const role = profile?.role ?? "barista";
        const table = role === "owner" ? "owners" : "barista_profiles";
        const { data: detail } = await supabase.from(table).select("id").eq("id", user.id).maybeSingle();
        setDest(detail ? `/dashboard/${role}` : `/onboarding/${role}`);
        setLabel(detail ? "Ke dashboard" : "Lengkapi data diri");
      } catch {
        // diam: tetap ke login
      }
    })();
  }, []);

  return (
    <div className="auth-light min-h-[calc(100dvh-3.5rem)] text-espresso">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-6 text-center shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:p-8">
          <BadgeCheck size={40} className="mx-auto text-matcha" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Verifikasi selesai</h1>
          <p className="mt-2 text-sm leading-6 text-espresso-soft">
            Email kamu sudah terverifikasi. Silakan masuk untuk melengkapi data diri.
          </p>
          <Link
            href={dest}
            className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-coffee px-5 text-sm font-bold text-white hover:bg-[#2e2015]"
          >
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}
