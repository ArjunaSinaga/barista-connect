"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Bookmark, MessagesSquare, GraduationCap, UserRound, Settings,
  Sparkles,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Toggle from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { formatExpShort } from "@/lib/exp";

// Sidebar dashboard barista — kerangka sama dengan SidebarOwner, konteks barista.
export default function SidebarBarista({ barista, counts, view, onNavigate }) {
  const toast = useToast();
  const [open, setOpen] = useState(barista?.is_open_to_work ?? true);
  const [busy, setBusy] = useState(false);

  async function toggleWork(v) {
    if (busy) return;
    setOpen(v);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("barista_profiles").update({ is_open_to_work: v }).eq("id", barista.id);
      if (error) throw error;
      toast(v ? "Kamu tampil sebagai Siap Kerja ✓" : "Status nonaktif — owner tak melihatmu di Talenta");
    } catch {
      setOpen(!v);
      toast("Gagal menyimpan status", "error");
    } finally {
      setBusy(false);
    }
  }

  const cls = (active) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-[#efe9d9] text-[#3d2c1e]" : "text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]"
    }`;
  const countBadge = (n) =>
    n !== null && n !== undefined ? (
      <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-[#6f6252]">{n}</span>
    ) : null;

  const item = (key, Icon, label, count) => (
    <button type="button" onClick={() => onNavigate?.(key)} className={cls(view === key)}>
      <Icon size={17} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {countBadge(count)}
    </button>
  );

  return (
    <aside className="flex min-w-0 flex-col gap-3 lg:h-full">
      <div className="shrink-0 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <div className="mx-auto w-fit">
          <Avatar src={barista?.profile_picture_url} name={barista?.full_name} size="lg" />
        </div>
        <p className="mt-2 truncate text-base font-extrabold tracking-tight text-[#2b2118]">{barista?.full_name ?? "Barista"}</p>
        <p className="mt-0.5 text-xs text-[#857768]">
          {formatExpShort(barista?.experience_months, barista?.years_of_experience)} pengalaman • {barista?.location_place ?? "-"}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#faf7ef] px-3 py-2">
          <span className={`h-2 w-2 rounded-full ${open ? "bg-[#1f6b4a]" : "bg-gray-400"}`} aria-hidden="true" />
          <span className="text-xs font-bold text-[#2b2118]">{open ? "Siap Kerja" : "Sibuk"}</span>
          <Toggle checked={open} onChange={toggleWork} />
        </div>
        <Link
          href="/dashboard/barista/profile"
          className="mt-2 block rounded-full bg-[#efe9d9] px-4 py-2 text-center text-xs font-bold text-[#3d2c1e] hover:bg-[#e5dcc4]"
        >
          Edit Profil
        </Link>
      </div>

      <nav className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:flex-1" aria-label="Dashboard barista">
        {item("ringkasan", LayoutDashboard, "Dasbor", null)}
        {item("lamaran", FileText, "Lamaran Saya", counts.applied)}
        {item("tersimpan", Bookmark, "Loker Tersimpan", counts.saved)}
        <Link href="/messages" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]">
          <MessagesSquare size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pesan</span>
        </Link>
        <Link href="/training" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]">
          <GraduationCap size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pelatihan</span>
        </Link>
        <Link href="/dashboard/barista/profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]">
          <UserRound size={17} className="shrink-0" />
          <span className="flex-1 text-left">Profil</span>
        </Link>
        <button type="button" onClick={() => onNavigate?.("pengaturan")} className={cls(view === "pengaturan")}>
          <Settings size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pengaturan</span>
        </button>
      </nav>

      <div className="relative shrink-0 rounded-2xl border border-[#e8e0cf] bg-[#efe9d9] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="flex items-center gap-2 text-sm font-extrabold text-[#3d2c1e]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3d2c1e] text-white"><Sparkles size={15} /></span>
          Profil 100%
        </p>
        <p className="mt-2 text-xs leading-5 text-[#6f6252]">
          Foto + CV + 3 skill + pengalaman = owner 3x lebih mungkin chat kamu.
        </p>
        <Link
          href="/dashboard/barista/profile"
          className="mt-3 inline-flex items-center rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Cek Profil →
        </Link>
      </div>
    </aside>
  );
}
