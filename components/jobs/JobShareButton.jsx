"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

// T-08: Web Share API bila didukung, fallback salin tautan publik loker ini.
export default function JobShareButton({ jobId, title }) {
  const [shared, setShared] = useState(false);

  async function share() {
    const url = `${window.location.origin}/jobs/${jobId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch { /* batal: diam */ }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Bagikan lowongan"
      title="Bagikan"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0d5bd] bg-white text-espresso-soft hover:border-coffee hover:text-espresso"
    >
      {shared ? <Check size={15} /> : <Share2 size={15} />}
    </button>
  );
}
