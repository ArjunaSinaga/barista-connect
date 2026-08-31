"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, MapPin, Store } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { STATUS_META, EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Terkirim" },
  { key: "viewed", label: "Dilihat" },
  { key: "accepted", label: "Diterima" },
  { key: "rejected", label: "Ditolak" },
];

export default function ApplicationsList() {
  const [apps, setApps] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("applications")
        .select(
          `id, status, message, created_at,
           job_posts ( id, title, location, employment_type, is_active,
                       owners ( business_name ) )`
        )
        .eq("barista_id", user.id)
        .order("created_at", { ascending: false });

      if (!cancelled) setApps(data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (apps ?? []).filter((a) => tab === "all" || a.status === tab),
    [apps, tab]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">Lamaran Saya</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Pantau status semua lamaran kamu di satu tempat.
      </p>

      {/* Tabs */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const count =
            t.key === "all"
              ? (apps ?? []).length
              : (apps ?? []).filter((a) => a.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                tab === t.key
                  ? "bg-espresso text-white"
                  : "border border-latte bg-white text-espresso-soft hover:text-caramel"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4 pb-8">
        {apps === null &&
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

        {apps !== null && filtered.length === 0 && (
          <EmptyState
            icon={<FileText size={22} />}
            title={
              apps.length === 0
                ? "Belum ada lamaran"
                : "Tidak ada di kategori ini"
            }
            subtitle="Jelajahi lowongan dan kirim lamaran pertamamu."
            actionLabel="Cari lowongan"
            actionHref="/dashboard/barista"
          />
        )}

        {filtered.map((app) => {
          const job = app.job_posts;
          const meta = STATUS_META[app.status];
          return (
            <div
              key={app.id}
              className="rounded-2xl border border-latte bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/jobs/${job?.id}`}
                    className="block truncate font-bold text-espresso hover:text-caramel"
                  >
                    {job?.title ?? "Lowongan dihapus"}
                  </Link>
                  <p className="mt-0.5 truncate text-xs font-medium text-espresso-soft">
                    {job && (
                      <>
                        <Store size={11} className="mr-1 inline" />
                        {job.owners?.business_name}
                        <MapPin size={11} className="mx-1 inline" />
                        {job.location}
                      </>
                    )}
                  </p>
                </div>
                <Badge classes={`${meta.classes}`}>{meta.label}</Badge>
              </div>

              {app.message && (
                <p className="mt-3 line-clamp-2 rounded-xl bg-cream px-4 py-2.5 text-sm text-espresso-soft italic">
                  “{app.message}”
                </p>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-latte/60 pt-3">
                <span className="text-[11px] text-espresso-soft/70">
                  Dilamar {relativeTime(app.created_at)}
                </span>
                {job && (
                  <Link
                    href="/messages"
                    className="text-[11px] font-bold text-caramel hover:underline"
                  >
                    Hubungi via pesan →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
