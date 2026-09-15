"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const HIDDEN_KEY = "hide-bottom-cta";

function initialVisible() {
  try {
    return localStorage.getItem(HIDDEN_KEY) !== "1";
  } catch {
    return true;
  }
}

// Strip CTA bawah — bisa di-X, pilihan diingat via localStorage.
export default function BottomCtaStrip() {
  const [visible, setVisible] = useState(initialVisible);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // abaikan
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1400px] shrink-0 px-4 pb-3 sm:px-6">
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-[#2b1c11] px-5 py-3">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Sembunyikan banner"
          className="absolute top-2.5 right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#f5f1e8]/30 bg-[#f5f1e8]/15 text-[#f5f1e8] hover:bg-[#f5f1e8]/25"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#f5f1e8]">Good people make great coffee.</p>
          <p className="truncate text-[11px] text-[#f5f1e8]/60">Join thousands of baristas and cafe owners building a stronger coffee community.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pr-6">
          <Link href="/signup" className="inline-flex min-h-[36px] items-center rounded-full bg-[#f5f1e8] px-5 text-xs font-bold text-[#2b1c11] hover:bg-white">
            I&apos;m a Barista
          </Link>
          <Link href="/signup?role=owner" className="inline-flex min-h-[36px] items-center rounded-full border border-[#f5f1e8]/40 px-5 text-xs font-bold text-[#f5f1e8] hover:border-[#f5f1e8]">
            I&apos;m a Cafe Owner
          </Link>
        </div>
        <p className="font-chalk hidden pr-10 text-right text-sm leading-4 text-[#f5f1e8]/70 xl:block">Same People<br />Brighter Tomorrows</p>
      </div>
    </section>
  );
}
