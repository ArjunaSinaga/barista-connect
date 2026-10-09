"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { relativeTime } from "@/lib/time";

// EMAPP-25/26: daftar notifikasi lamaran terbaru-dulu + titik unread.
// Tiap item menaut ke Lamaran Saya (notifikasi tidak menyimpan application_id di DB).
export default function NotifList({ items }) {
  const [list, setList] = useState(items);
  const [busy, setBusy] = useState(false);
  const unread = list.filter((n) => !n.is_read).length;

  async function mark(ids) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids ? { ids } : {}),
      });
    } catch { /* abaikan: state lokal tetap update */ }
  }

  function open(id) {
    setList((l) => l.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    mark([id]);
  }

  async function markAll() {
    setBusy(true);
    await mark();
    setList((l) => l.map((n) => ({ ...n, is_read: true })));
    setBusy(false);
  }

  if (!list.length) {
    return (
      <div className="rounded-2xl border border-[#e8e0cf] bg-white p-8 text-center">
        <Bell size={22} className="mx-auto text-[#b6a98f]" />
        <p className="mt-2 text-sm font-extrabold text-espresso">Belum ada notifikasi</p>
        <p className="mt-0.5 text-xs text-espresso-soft">Update lamaran, undangan, dan pengumuman akan muncul di sini.</p>
        <Link href="/jobs" className="mt-4 inline-flex min-h-[40px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white">
          Cari Lowongan
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-espresso-soft" role="status">
          {unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}
        </p>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d5bd] bg-white px-4 py-2 text-xs font-bold text-espresso hover:border-coffee disabled:opacity-50"
          >
            <CheckCheck size={14} /> Tandai semua dibaca
          </button>
        )}
      </div>
      <ul className="space-y-2.5">
        {list.map((n) => (
          <li key={n.id}>
            <Link
              href="/dashboard/barista/applications"
              onClick={() => open(n.id)}
              className={`flex gap-3 rounded-2xl border bg-white p-4 hover:border-coffee ${n.is_read ? "border-[#e8e0cf]" : "border-coffee/40"}`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-[#e0d5bd]" : "bg-coffee"}`} aria-label={n.is_read ? "Sudah dibaca" : "Belum dibaca"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-espresso">{n.title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-espresso-soft">{n.body}</span>
                <span className="mt-1 block text-[11px] text-[#b6a98f]">{relativeTime(n.created_at)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
