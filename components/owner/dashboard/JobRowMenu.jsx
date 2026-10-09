"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import JobActiveToggle from "@/components/jobs/JobActiveToggle";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";

// Menu aksi baris tabel loker (H-38): lihat/edit/toggle/hapus. Tutup otomatis setelah aksi.
export default function JobRowMenu({ job }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Aksi untuk ${job.title}`}
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0d5bd] text-espresso-soft hover:border-coffee hover:text-espresso"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-20 w-44 rounded-xl border border-[#e8e0cf] bg-white p-1.5 shadow-lg">
            <Link href={`/jobs/${job.id}`} className="block rounded-lg px-3 py-2 text-xs font-bold text-espresso hover:bg-[#faf7ef]">
              Lihat
            </Link>
            <Link href={`/dashboard/owner/jobs/${job.id}/edit`} className="block rounded-lg px-3 py-2 text-xs font-bold text-espresso hover:bg-[#faf7ef]">
              Edit
            </Link>
            <div className="rounded-lg px-3 py-2 hover:bg-[#faf7ef]">
              <JobActiveToggle jobId={job.id} isActive={job.is_active} />
            </div>
            <div className="rounded-lg px-3 py-2 hover:bg-[#faf7ef]">
              <JobDeleteButton jobId={job.id} jobTitle={job.title} variant="link" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
