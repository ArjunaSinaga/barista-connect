"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FlagOff, MapPin, Store, ChevronRight, MessageCircle, TriangleAlert } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CafeLogo } from "@/components/landing/LatestJobs";
import { STATUS_META, EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import CafeRatingForm from "@/components/ratings/CafeRatingForm";

const TABS = [
  { key: "all", label: "Semua" },
  { key: "processing", label: "Diproses" },
  { key: "interview", label: "Interview" },
  { key: "accepted", label: "Diterima" },
  { key: "rejected", label: "Ditolak" },
];

const STAGES = ["Lamaran Dikirim", "Lamaran Dilihat", "Lanjut Interview", "Diterima"];

// Index tahap aktif dari status DB. Interview tidak punya status/tabel sendiri di backend:
// tahap 3 dianggap terlewati hanya bila lamaran sudah Diterima/Selesai (tak mungkin
// diterima tanpa lewat interview). Lihat catatan APPTRK K-12 di bawah.
function stageIdx(status) {
  if (status === "pending") return 0;
  if (status === "viewed") return 1;
  if (status === "accepted" || status === "terminated") return 3;
  return -1; // rejected: terminal merah
}

function inTab(status, tab) {
  if (tab === "all") return true;
  if (tab === "processing") return status === "pending" || status === "viewed";
  if (tab === "interview") return false; // belum ada data interview (APPTRK K-04/K-12)
  if (tab === "accepted") return status === "accepted" || status === "terminated";
  if (tab === "rejected") return status === "rejected";
  return false;
}

const PAGE = 10;

export default function ApplicationsList() {
  const router = useRouter();
  const toast = useToast();
  const [apps, setApps] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState("all");
  const [limit, setLimit] = useState(PAGE);
  const [busyId, setBusyId] = useState(null);
  const [teamByApp, setTeamByApp] = useState({});
  const [cafeRatings, setCafeRatings] = useState({});
  const [meId, setMeId] = useState(null);

  async function load() {
    setLoadError(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMeId(user.id);

      const { data, error } = await supabase
        .from("applications")
        .select(
          `id, status, message, created_at,
           job_posts ( id, title, location, salary_text, employment_type, employment_types, is_active, owner_id,
                       cafes ( name ), owners ( business_name ) )`
        )
        .eq("barista_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setApps(data ?? []);

      const { data: teams } = await supabase
        .from("team_members")
        .select("id, application_id, owner_id, status")
        .eq("barista_id", user.id);
      const tmap = {};
      (teams ?? []).forEach((t) => { if (t.application_id) tmap[t.application_id] = t; });
      setTeamByApp(tmap);
      const teamIds = (teams ?? []).map((t) => t.id);
      if (teamIds.length) {
        const { data: cr } = await supabase
          .from("cafe_ratings")
          .select("id, team_member_id, stars, comment, updated_at")
          .in("team_member_id", teamIds);
        const cmap = {};
        (cr ?? []).forEach((r) => { cmap[r.team_member_id] = r; });
        setCafeRatings(cmap);
      }
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    // Fetch data saat mount — kasus sah untuk effect (sinkronisasi dari Supabase).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { all: (apps ?? []).length, processing: 0, interview: 0, accepted: 0, rejected: 0 };
    (apps ?? []).forEach((a) => {
      if (a.status === "pending" || a.status === "viewed") c.processing += 1;
      if (a.status === "accepted" || a.status === "terminated") c.accepted += 1;
      if (a.status === "rejected") c.rejected += 1;
    });
    return c;
  }, [apps]);

  const filtered = useMemo(
    () => (apps ?? []).filter((a) => inTab(a.status, tab)),
    [apps, tab]
  );
  const visible = filtered.slice(0, limit);

  async function startChat(ownerId) {
    if (!ownerId || !meId) return;
    setBusyId("chat");
    try {
      const supabase = createClient();
      const { data: cid, error } = await supabase.rpc(
        "get_or_create_conversation",
        { p_owner: ownerId, p_barista: meId }
      );
      if (error || !cid) throw error;
      router.push(`/messages/${cid}`);
    } catch {
      toast("Gagal membuka percakapan", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleResign(appId) {
    if (!confirm("Tandai selesai bekerja di sini? Kamu bisa memberi rating ke kafe setelah ini.")) return;
    setBusyId(appId);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("resign_application", { p_application: appId });
      if (error) throw error;
      setApps((list) => list.map((a) => (a.id === appId ? { ...a, status: "terminated" } : a)));
      toast("Ditandai selesai. Kasih rating ke kafe-nya! ✓");
      router.refresh();
    } catch {
      toast("Gagal menandai selesai", "error");
    } finally {
      setBusyId(null);
    }
  }

  // Tarik lamaran (pending saja): hapus baris milik sendiri. Tanpa alasan tertulis —
  // tidak ada kolom alasan di DB, jadi tidak dikarang.
  async function handleWithdraw(appId) {
    if (!confirm("Tarik lamaran ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setBusyId(appId);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("applications").delete().eq("id", appId);
      if (error) throw error;
      setApps((list) => list.filter((a) => a.id !== appId));
      toast("Lamaran ditarik");
    } catch {
      toast("Gagal menarik lamaran", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">Lamaran Saya</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Pantau status lamaran, jadwal interview, dan update terbaru dari perusahaan.
      </p>

      {/* Tabs */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setLimit(PAGE); }}
            aria-current={tab === t.key ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              tab === t.key
                ? "bg-coffee text-white"
                : "border border-latte card-dark text-espresso-soft hover:text-caramel"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        {/* Kiri: daftar kartu */}
        <div className="min-w-0 space-y-4 pb-8">
          {apps === null && !loadError &&
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

          {loadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <TriangleAlert size={20} className="mx-auto text-red-500" />
              <p className="mt-2 text-sm font-extrabold text-espresso">Riwayat lamaran gagal dimuat</p>
              <p className="mt-0.5 text-xs text-espresso-soft">Filter yang kamu pilih tetap tersimpan.</p>
              <button
                type="button"
                onClick={load}
                className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {apps !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              icon={<FileText size={22} />}
              title={tab === "interview" ? "Belum ada undangan interview" : apps.length === 0 ? "Belum ada lamaran" : "Tidak ada di kategori ini"}
              subtitle={tab === "interview" ? "Undangan interview dari perusahaan akan muncul di sini. Sementara itu, pantau pesanmu." : "Jelajahi lowongan dan kirim lamaran pertamamu."}
              actionLabel={tab === "interview" ? "Buka Pesan" : "Cari lowongan"}
              actionHref={tab === "interview" ? "/messages" : "/jobs"}
            />
          )}

          {visible.map((app) => {
            const job = app.job_posts;
            const meta = STATUS_META[app.status] ?? STATUS_META.pending;
            const cur = stageIdx(app.status);
            const rejected = app.status === "rejected";
            const cafeName = job?.cafes?.name ?? job?.owners?.business_name ?? "-";
            const types = job?.employment_types?.length ? job.employment_types : job?.employment_type ? [job.employment_type] : [];
            return (
              <article key={app.id} className="rounded-2xl card-dark p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <CafeLogo job={job ?? {}} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={job?.id ? `/jobs/${job.id}` : "/jobs"} className="block truncate font-bold text-espresso hover:text-caramel">
                        {job?.title ?? "Lowongan dihapus"}
                      </Link>
                      <Link href={job?.id ? `/jobs/${job.id}` : "/jobs"} aria-label="Lihat detail" className="shrink-0 text-espresso-soft hover:text-caramel">
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-espresso-soft">{cafeName}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-espresso-soft">
                      {job && (
                        <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                      )}
                      {types.map((t) => (
                        <span key={t}>{EMPLOYMENT_LABELS[t] ?? t}</span>
                      ))}
                    </p>
                    {job?.salary_text && (
                      <p className="mt-0.5 text-[11px] font-bold text-espresso">{job.salary_text}</p>
                    )}
                  </div>
                  <Badge classes={meta.classes}>{app.status === "terminated" ? "Selesai" : meta.label}</Badge>
                </div>

                {/* Stepper 4 tahap */}
                <ol className="mt-4 flex items-start" aria-label="Progres lamaran">
                  {STAGES.map((s, i) => {
                    const reached = cur >= 0 && i <= cur;
                    const isCur = i === cur;
                    return (
                      <li key={s} className="flex flex-1 flex-col items-center gap-1 last:flex-none">
                        <span className="flex w-full items-center">
                          <span className={`h-1.5 w-full rounded-full ${reached ? "bg-caramel" : rejected && i === 0 ? "bg-red-400" : "bg-latte"}`} aria-hidden="true" />
                        </span>
                        <span className={`text-center text-[10px] leading-tight font-bold ${isCur ? "text-espresso" : rejected ? "text-red-500" : reached ? "text-espresso" : "text-espresso-soft/60"}`}>
                          {rejected && i === 0 ? "Ditolak" : s}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                {rejected && (
                  <p className="mt-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600">
                    Perusahaan tidak melanjutkan lamaranmu.
                  </p>
                )}

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

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-latte/60 pt-3">
                  <span className="text-[11px] text-espresso-soft/70">
                    Dilamar {relativeTime(app.created_at)}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {app.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(app.id)}
                        disabled={busyId === app.id}
                        className="text-[11px] font-bold text-red-500 hover:underline disabled:opacity-50"
                      >
                        Tarik lamaran
                      </button>
                    )}
                    {app.status === "accepted" && (
                      <Button variant="secondary" size="sm" disabled={busyId === app.id} onClick={() => handleResign(app.id)}>
                        <FlagOff size={14} /> {busyId === app.id ? "..." : "Selesai Bekerja"}
                      </Button>
                    )}
                    {job?.owner_id && (
                      <button
                        type="button"
                        onClick={() => startChat(job.owner_id)}
                        disabled={busyId === "chat"}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-caramel hover:underline disabled:opacity-50"
                      >
                        <MessageCircle size={12} /> Hubungi via pesan →
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {filtered.length > visible.length && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                className="inline-flex min-h-[40px] items-center rounded-full border border-[#e0d5bd] bg-white px-6 text-xs font-bold text-espresso hover:border-coffee"
              >
                Muat lebih ({visible.length} dari {filtered.length})
              </button>
            </div>
          )}
        </div>

        {/* Kanan: arti status + pesan */}
        <aside className="space-y-3 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <h2 className="text-sm font-extrabold text-espresso">Arti Status Lamaran</h2>
            <ol className="mt-3 space-y-2.5 text-[13px]">
              {[
                ["Diproses", "Lamaran terkirim dan sedang ditinjau perusahaan."],
                ["Dilihat", "Perusahaan sudah membuka lamaranmu."],
                ["Interview", "Kamu lolos ke tahap wawancara — jadwal diatur via pesan."],
                ["Diterima", "Selamat! Kamu diterima bekerja."],
                ["Ditolak", "Perusahaan tidak melanjutkan lamaranmu."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coffee text-[10px] font-extrabold text-white">{i + 1}</span>
                  <p className="text-espresso-soft"><span className="font-bold text-espresso">{t}.</span> {d}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-[#fff8e8] p-5 text-xs">
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
              <Store size={14} /> Undangan & jadwal interview
            </p>
            <p className="mt-1.5 leading-relaxed text-espresso-soft">
              Perusahaan menghubungimu lewat pesan untuk mengatur interview. Pantau kotak masukmu.
            </p>
            <Link href="/messages" className="mt-2.5 block rounded-full bg-coffee px-4 py-2 text-center text-xs font-bold text-white hover:bg-[#2e2015]">
              Buka Pesan
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
