"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Tombol keluar di sidebar profil.
export default function SignOutButton() {
  const router = useRouter();
  async function out() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={out}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-espresso-soft hover:bg-[#faf7ef] hover:text-espresso"
    >
      <LogOut size={17} className="shrink-0" />
      <span className="flex-1 text-left">Keluar</span>
    </button>
  );
}
