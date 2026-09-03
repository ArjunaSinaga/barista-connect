"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  FileText,
  MapPin,
  MessageSquareText,
  Phone,
  UsersRound,
  X,
} from "lucide-react";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/toast";
import { STATUS_META } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import { createClient } from "@/lib/supabase/client";

const ORDER = { accepted: 0, pending: 1, viewed: 2, rejected: 3 };

export default function ApplicantsBoard({
  jobId,
  ownerId,
  initialApplicants,
}) {
  const router = useRouter();
  const toast = useToast();
  const [apps, setApps] = useState(initialApplicants);
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(
    () =>
      [...apps]
        .filter((a) => tab === "all" || a.status === tab)
        .sort(
          (a, b) =>
            ORDER[a.status] - ORDER[b.status] ||
            new Date(b.created_at) - new Date(a.created_at)
        ),
    [apps, tab]
  );

  async function setStatus(appId, status) {
    setBusyId(appId);
    // optimistic
    setApps((list) =>
      list.map((a) => (a.id === appId ? { ...a, status } : a))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", appId);
    if (error) {
      toast("Gagal memperbarui status", "error");
      router.refresh();
    } else {
      toast(status === "accepted" ? "Pelamar diterima ✓" : "Status diperbarui");
    }
    setBusyId(null);
  }

  async function startChat(baristaId, ownerId) {
    try {
      const supabase = createClient();
      const { data: cid, error } = await supabase.rpc(
        "get_or_create_conversation",
        { p_owner: ownerId, p_barista: baristaId }
      );
      if (error || !cid) throw error;
      router.push(`/messages/${cid}`);
    } catch {
      toast("Gagal membuka percakapan", "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard/owner"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-espresso-soft hover:text-caramel"
      >
        <ArrowLeft size={16} /> Lowongan saya
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-espresso">
        Pelamar ({apps.length})
      </h1>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {["all", "pending", "viewed", "accepted", "rejected"].map((k) => {
          const count =
            k === "all"
              ? apps.length
              : apps.filter((a) => a.status === k).length;
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                tab === k
                  ? "bg-espresso text-white"
                  : "border border-latte card-dark text-espresso-soft hover:text-caramel"
              }`}
            >
              {k === "all"
                ? `Semua (${count})`
                : `${STATUS_META[k].label} (${count})`}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4 pb-8">
        {filtered.length === 0 && (
          <EmptyState
            icon={<UsersRound size={22} />}
            title="Belum ada pelamar di sini"
            subtitle="Pastikan lowonganmu aktif dan judulnya menarik."
          />
        )}

        {filtered.map((app) => {
          const b = app.barista_profiles;
          const meta = STATUS_META[app.status];
          return (
            <div
              key={app.id}
              className="rounded-2xl card-dark p-5 shadow-sm transition-opacity"
            >
              <div className="flex items-start gap-4">
                <Avatar src={b?.profile_picture_url} name={b?.full_name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/barista/${b?.id}`}
                        className="truncate font-bold text-espresso hover:text-caramel"
                      >
                        {b?.full_name ?? "Barista"}
                      </Link>
                      <p className="mt-0.5 text-xs font-semibold text-espresso-soft">
                        {b?.age} th • {b?.years_of_experience} th pengalaman •{" "}
                        <span className="inline-flex items-center">
                          <MapPin size={10} /> {b?.location_place}
                        </span>
                      </p>
                    </div>
                    <Badge classes={meta.classes}>{meta.label}</Badge>
                  </div>

                  {b?.skills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-cream-dark px-2.5 py-0.5 text-[11px] font-bold text-espresso-soft"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.employment_types?.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {app.employment_types.map(t=>(
                        <span key={t} className="rounded-full bg-caramel px-2.5 py-1 text-[11px] font-bold text-white">{EMPLOYMENT_LABELS[t] ?? t}</span>
                      ))}
                    </div>
                  )}
                  {app.cover_letter && (
                    <p className="mt-3 rounded-xl bg-cream-dark px-4 py-2.5 text-sm text-espresso leading-relaxed whitespace-pre-wrap">
                      {app.cover_letter}
                    </p>
                  )}
                  {app.message && (
                    <p className="mt-2 rounded-xl bg-cream px-4 py-2.5 text-sm text-espresso-soft italic">
                      “{app.message}”
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {app.cv_url && (
                      <a href={app.cv_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full bg-espresso px-3 py-1 text-xs font-bold text-white hover:bg-espresso/90">
                        <FileText size={12}/> Lihat CV PDF
                      </a>
                    )}
                    {b?.whatsapp && (
                      <a href={`https://wa.me/${b.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-1 text-xs font-bold text-white hover:bg-[#20bd5a]">
                        <Phone size={12}/> WA {b.whatsapp}
                      </a>
                    )}
                    {app.cv_url?.endsWith?.(".pdf") ? null : null}
                  </div>

                  <p className="mt-2 text-[11px] text-espresso-soft/70">
                    Melamar {relativeTime(app.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-latte/60 pt-4">
                {app.status !== "accepted" && app.status !== "rejected" && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      disabled={busyId === app.id}
                      onClick={() => setStatus(app.id, "accepted")}
                    >
                      <Check size={14} /> Terima
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === app.id}
                      onClick={() => setStatus(app.id, "rejected")}
                    >
                      <X size={14} /> Tolak
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => startChat(b?.id, ownerId)}
                >
                  <MessageSquareText size={14} /> Chat
                </Button>
                <Link
                  href={`/barista/${b?.id}`}
                  className="text-xs font-bold text-caramel hover:underline"
                >
                  Lihat profil lengkap →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
