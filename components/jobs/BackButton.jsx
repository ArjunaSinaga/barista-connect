"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// T-01: kembali ke hasil pencarian (riwayat browser) — fallback /jobs bila dibuka langsung.
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/jobs");
      }}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-espresso-soft hover:text-caramel"
    >
      <ArrowLeft size={16} /> Kembali ke hasil pencarian
    </button>
  );
}
