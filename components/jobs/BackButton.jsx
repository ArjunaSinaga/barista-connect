"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// T-01 / APPFORM-01: kembali ke hasil pencarian (riwayat browser) — fallback eksplisit.
export default function BackButton({ fallback = "/jobs", label = "Kembali ke hasil pencarian" }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-espresso-soft hover:text-caramel"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}
