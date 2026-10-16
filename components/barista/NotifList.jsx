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
  const [tab, setTab] = useState("Semua");
  const [visible, setVisible] = useState(5);
  const unread = list.filter((n) => !n.is_read).length;

  const TABS = ["Semua", "Lamaran", "Sistem", "Promosi"];
  function matchTab(n) {
    if (tab === "Semua") return true;
    const t = `${n.title ?? ""} ${n.body ?? ""}`.toLowerCase();
    if (tab === "Lamaran") return /lamar|interview|diterima|ditolak|dilihat|undangan/.test(t);
    if (tab === "Sistem") return /sistem|sertifikat|lengkapi|akun|verifikasi|profil/.test(t);
    return /promo|rekomendasi|kursus|academy/.test(t);
  }
  const filtered = list.filter(matchTab);
  const shown = filtered.slice(0, visible);

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
      <div className="rounded-2xl border border-[#e8e0cf] bg-white p-10 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <Bell size={22} className="mx-auto text-[#b6a98f]" />
        <p className="mt-2 font-serif text-lg font-black text-espresso">Belum ada notifikasi</p>
        <p className="mt-0.5 text-xs text-espresso-soft">Update lamaran, undangan, dan pengumuman akan muncul di sini.</p>
        <Link href="/jobs" className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-xs font-bold text-white hover:bg-[#2e2015]">
          Cari Lowongan
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 border-b border-[#e8e0cf]" role="tablist" aria-label="Kategori notifikasi">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => { setTab(t); setVisible(5); }}
              className={`px-4 py-2 text-[13px] font-bold ${tab === t ? "border-b-2 border-coffee text-espresso" : "text-espresso-soft hover:text-espresso"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-espresso-soft" role="status">
          {unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}
        </p>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={busy}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-coffee bg-white px-5 py-2 text-xs font-bold text-espresso hover:bg-coffee hover:text-white disabled:opacity-50"
          >
            <CheckCheck size={14} /> Tandai semua dibaca
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-10 text-center">
          <p className="font-serif text-lg font-black text-espresso">Belum ada notifikasi</p>
          <p className="mt-0.5 text-xs text-espresso-soft">Coba lagi atau pilih kategori lain.</p>
        </div>
      ) : (
      <ul className="space-y-2.5">
        {shown.map((n) => (
          <li key={n.id}>
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.06)] ${n.is_read ? "border-[#e8e0cf]" : "border-coffee/40"}`}
            >
              <span className={`mt-1 h-2 w-2 shrink-0 self-start rounded-full ${n.is_read ? "bg-[#e0d5bd]" : "bg-red-500"}`} aria-label={n.is_read ? "Sudah dibaca" : "Belum dibaca"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-espresso">{n.title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-espresso-soft">{n.body}</span>
                <span className="mt-1 block text-[11px] text-[#b6a98f]">{relativeTime(n.created_at)}</span>
              </span>
              <Link
                href="/dashboard/barista/applications"
                onClick={() => open(n.id)}
                className="inline-flex shrink-0 items-center rounded-full bg-[#ece2cc] px-4 py-2 text-xs font-bold text-espresso hover:bg-coffee hover:text-white"
              >
                Lihat detail
              </Link>
            </div>
          </li>
        ))}
      </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Link href="/help" className="text-xs font-bold text-caramel hover:underline">⚙ Pengaturan notifikasi</Link>
        {visible < filtered.length ? (
          <div className="text-center">
            <button type="button" onClick={() => setVisible((v) => v + 5)} className="inline-flex min-h-[40px] items-center rounded-full border border-coffee bg-white px-6 text-xs font-bold text-espresso hover:bg-coffee hover:text-white">
              Muat lebih banyak
            </button>
            <p className="mt-1 text-[11px] text-espresso-soft">Menampilkan {shown.length} dari {filtered.length} notifikasi</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
