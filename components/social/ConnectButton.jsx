"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Clock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// C2: koneksi barista — tambah teman, terima/tolak, batalkan.
export default function ConnectButton({ targetId, viewerId }) {
  const toast = useToast();
  const [conn, setConn] = useState(null); // {id, requester_id, addressee_id, status}
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!viewerId || !targetId || viewerId === targetId) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("barista_connections")
        .select("id, requester_id, addressee_id, status")
        .or(`and(requester_id.eq.${viewerId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${viewerId})`)
        .maybeSingle();
      setConn(data ?? null);
    })();
  }, [viewerId, targetId]);

  if (!viewerId || viewerId === targetId) return null;

  async function run(fn, okMsg) {
    setBusy(true);
    try {
      await fn(createClient());
      if (okMsg) toast(okMsg, "success");
    } catch {
      toast("Gagal, coba lagi", "error");
    } finally {
      setBusy(false);
    }
  }

  const send = () => run(async (sb) => {
    const { data, error } = await sb
      .from("barista_connections")
      .insert({ requester_id: viewerId, addressee_id: targetId })
      .select("id, requester_id, addressee_id, status")
      .single();
    if (error) throw error;
    setConn(data);
  }, "Permintaan koneksi terkirim");

  const accept = () => run(async (sb) => {
    const { error } = await sb
      .from("barista_connections")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", conn.id);
    if (error) throw error;
    setConn({ ...conn, status: "accepted" });
  }, "Koneksi diterima");

  const remove = () => run(async (sb) => {
    const { error } = await sb.from("barista_connections").delete().eq("id", conn.id);
    if (error) throw error;
    setConn(null);
  });

  const base = "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60";

  if (!conn) {
    return (
      <button type="button" disabled={busy} onClick={send} className={`${base} bg-coffee text-white hover:bg-[#2e2015]`}>
        <UserPlus size={15} /> Koneksi
      </button>
    );
  }
  if (conn.status === "accepted") {
    return (
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-matcha/15 px-4 py-2.5 text-sm font-bold text-matcha">
          <UserCheck size={15} /> Terkoneksi
        </span>
        <button type="button" disabled={busy} onClick={remove} title="Hapus koneksi" className="rounded-xl border border-latte p-2.5 text-espresso-soft hover:text-red-600">
          <X size={15} />
        </button>
      </span>
    );
  }
  if (conn.requester_id === viewerId) {
    return (
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-cream-dark px-4 py-2.5 text-sm font-bold text-espresso-soft">
          <Clock size={15} /> Menunggu
        </span>
        <button type="button" disabled={busy} onClick={remove} className="text-xs font-bold text-espresso-soft underline hover:text-red-600">
          Batalkan
        </button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={busy} onClick={accept} className={`${base} bg-matcha text-white hover:brightness-95`}>
        <UserCheck size={15} /> Terima
      </button>
      <button type="button" disabled={busy} onClick={remove} className={`${base} border border-latte text-espresso hover:border-red-400 hover:text-red-600`}>
        Tolak
      </button>
    </span>
  );
}
