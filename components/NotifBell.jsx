"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export default function NotifBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/notifications?unread=1", { cache: "no-store" });
      if (r.ok) setItems((await r.json()).items ?? []);
    } catch { /* offline: diam */ }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && items.length) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items.map((n) => n.id) }),
      }).catch(() => {});
      setItems([]);
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button" onClick={toggle} aria-label="Notifikasi" title="Notifikasi"
        aria-expanded={open}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#2f2721]/70 hover:bg-[#2f2721]/10 hover:text-[#6f5a3e]"
      >
        <Bell size={19} />
        {items.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-1 w-72 overflow-hidden rounded-xl border border-[#e0d5bd] bg-white shadow-lg">
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#2f2721]/60">Tidak ada notifikasi baru.</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="border-b border-[#e0d5bd] px-4 py-2.5 last:border-0">
                <p className="text-sm font-bold text-[#2f2721]">{n.title}</p>
                <p className="text-xs text-[#2f2721]/70">{n.body}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
