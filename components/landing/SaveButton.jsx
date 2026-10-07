"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function readSaved(storageKey, id) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "[]").includes(id);
  } catch {
    return false;
  }
}

export default function SaveButton({ storageKey, id, label }) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => readSaved(storageKey, id));

  // LP-10: pengguna keluar -> prompt login, bukan simpan diam-diam.
  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await createClient().auth.getSession();
      if (!data.session) {
        router.push("/login?next=/");
        return;
      }
    } catch {
      /* env belum terpasang: lanjut simpan lokal */
    }
    try {
      const list = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next.includes(id));
    } catch {
      /* abaikan */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={saved}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8e0cf] bg-white text-espresso-soft transition-colors hover:border-coffee hover:text-coffee"
    >
      <Heart size={15} className={saved ? "fill-coffee text-coffee" : ""} />
    </button>
  );
}
