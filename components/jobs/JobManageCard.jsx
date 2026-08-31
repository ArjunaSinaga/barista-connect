"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Pencil, Trash2, UsersRound } from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/toast";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { createClient } from "@/lib/supabase/client";

export default function JobManageCard({ job, applicantCount }) {
  const toast = useToast();
  const [active, setActive] = useState(job.is_active);
  const [deleted, setDeleted] = useState(false);
  const [count, setCount] = useState(applicantCount ?? 0);

  if (deleted) return null;

  async function toggleActive(v) {
    setActive(v);
    const supabase = createClient();
    const { error } = await supabase
      .from("job_posts")
      .update({ is_active: v })
      .eq("id", job.id);
    if (error) {
      setActive(!v);
      toast("Gagal mengubah status", "error");
    } else {
      toast(v ? "Lowongan aktif kembali" : "Lowongan dijeda");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Hapus lowongan "${job.title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("job_posts")
      .delete()
      .eq("id", job.id);
    if (error) return toast("Gagal menghapus", "error");
    setDeleted(true);
    toast("Lowongan dihapus");
  }

  return (
    <div className="rounded-2xl border border-latte bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/jobs/${job.id}`}
            className="truncate font-bold text-espresso hover:text-caramel"
          >
            {job.title}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-espresso-soft">
            <Badge classes="bg-cream-dark text-espresso-soft">
              {EMPLOYMENT_LABELS[job.employment_type]}
            </Badge>
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {job.location}
            </span>
            <span>• {relativeTime(job.created_at)}</span>
          </p>
        </div>
        <Toggle checked={active} onChange={toggleActive} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-latte/60 pt-4">
        <Link
          href={`/dashboard/owner/jobs/${job.id}/applicants`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-espresso px-4 py-2 text-xs font-bold text-white hover:bg-espresso/90"
        >
          <UsersRound size={14} />
          Pelamar ({count})
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/owner/jobs/${job.id}/edit`}
            aria-label="Edit"
            className="rounded-lg p-2 text-espresso-soft hover:bg-cream-dark hover:text-caramel"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={handleDelete}
            aria-label="Hapus"
            className="rounded-lg p-2 text-espresso-soft hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
