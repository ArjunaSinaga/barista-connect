"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FlagOff, MapPin, Store } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { STATUS_META, EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import CafeRatingForm from "@/components/ratings/CafeRatingForm";

const TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Terkirim" },
  { key: "viewed", label: "Dilihat" },
  { key: "accepted", label: "Diterima" },
  { key: "rejected", label: "Ditolak" },
  { key: "terminated", label: "Selesai" },
];

export default function ApplicationsList() {
  const router = useRouter();
  const toast = useToast();
  const [apps, setApps] = useState(null);
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [teamByApp, setTeamByApp] = useState({});
  const [cafeRatings, setCafeRatings] = useState({});
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (!cancelled) setMeId(user.id);

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

      // Baris tim + rating cafe milik sendiri
      const { data: teams } = await supabase
        .from("team_members")
        .select("id, application_id, owner_id, status")
        .eq("barista_id", user.id);
      if (cancelled) return;
      const tmap = {};
      (teams ?? []).forEach((t) => { if (t.application_id) tmap[t.application_id] = t; });
      setTeamByApp(tmap);
      const teamIds = (teams ?? []).map((t) => t.id);
      if (teamIds.length) {
        const { data: cr } = await supabase
          .from("cafe_ratings")
          .select("id, team_member_id, stars, comment, updated_at")
          .in("team_member_id", teamIds);
        if (cancelled) return;
        const cmap = {};
        (cr ?? []).forEach((r) => { cmap[r.team_member_id] = r; });
        setCafeRatings(cmap);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (apps ?? []).filter((a) => tab === "all" || a.status === tab),
    [apps, tab]
  );

  async function handleResign(appId) {
    if (!confirm("Tandai selesai bekerja di sini? Kamu bisa memberi rating ke cafe setelah ini.")) return;
    setBusyId(appId);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("resign_application", { p_application: appId });
      if (error) throw error;
      setApps((list) => list.map((a) => (a.id === appId ? { ...a, status: "terminated" } : a)));
      toast("Ditandai selesai. Kasih rating ke cafe-nya! ✓");
      router.refresh();
    } catch {
      toast("Gagal menandai selesai", "error");
    } finally {
      setBusyId(null);
    }
  }

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
                  : "border border-latte card-dark text-espresso-soft hover:text-caramel"
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
              className="rounded-2xl card-dark p-5 shadow-sm"
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

              {app.status === "terminated" && teamByApp[app.id] && (
                <CafeRatingForm
                  teamMemberId={teamByApp[app.id].id}
                  ownerId={teamByApp[app.id].owner_id}
                  baristaId={meId}
                  applicationId={app.id}
                  jobPostId={job?.id ?? null}
                  isTerminated
                  existing={cafeRatings[teamByApp[app.id].id] ?? null}
                />
              )}

              <div className="mt-3 flex items-center justify-between border-t border-latte/60 pt-3">
                <span className="text-[11px] text-espresso-soft/70">
                  Dilamar {relativeTime(app.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  {app.status === "accepted" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === app.id}
                      onClick={() => handleResign(app.id)}
                    >
                      <FlagOff size={14} /> {busyId === app.id ? "..." : "Selesai Bekerja"}
                    </Button>
                  )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
