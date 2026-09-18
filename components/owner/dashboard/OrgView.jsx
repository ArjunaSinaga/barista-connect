"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Copy, RefreshCw, UserPlus, UserMinus, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// Kelola PT: buat, klaim (owner telat), kode, manager, transfer.
// ponytail: semua aksi via RPC (server validasi peran); client cuma panggil.
export default function OrgView({ orgs = [], cafes = [], onBack }) {
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [claim, setClaim] = useState("");
  const [transfer, setTransfer] = useState({});

  async function call(fn, args, ok) {
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc(fn, args);
      if (error) throw error;
      toast(ok);
      router.refresh();
      return data;
    } catch (err) {
      toast(err?.message || "Gagal", "error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function copy(t) {
    try { await navigator.clipboard.writeText(t); toast("Kode disalin"); }
    catch { toast("Gagal salin", "error"); }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Owner</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">PT / Organisasi ({orgs.length})</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#6f6252]">1 PT menaungi banyak kafe. Manager diundang per PT.</p>
        </div>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]">
          Dashboard
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); call("create_org", { p_name: name, p_iam_owner: true }, "PT dibuat — kamu pemiliknya").then(() => setName("")); }} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#2b2118]"><Building2 size={15} /> Buat PT baru</h3>
          <div className="mt-3 flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Senja Group" className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-2 text-sm font-bold text-[#2b2118] focus:border-[#3d2c1e] focus:outline-none" />
            <button disabled={busy || name.trim().length < 3} className="shrink-0 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015] disabled:opacity-50">Buat</button>
          </div>
          <button type="button" disabled={busy || name.trim().length < 3} onClick={() => call("create_org", { p_name: name, p_iam_owner: false }, "PT dibuat — kamu manager, owner menyusul").then(() => setName(""))} className="mt-2 text-xs font-bold text-[#2b6cb0] hover:underline disabled:opacity-50">
            Saya manager-nya (pemilik menyusul)
          </button>
        </form>
        <form onSubmit={(e) => { e.preventDefault(); call("claim_org_owner", { p_code: claim }, "Kamu kini pemilik PT").then(() => setClaim("")); }} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#2b2118]"><KeyRound size={15} /> Klaim PT (owner telat daftar)</h3>
          <div className="mt-3 flex gap-2">
            <input value={claim} onChange={(e) => setClaim(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" maxLength={9} className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase focus:border-[#3d2c1e] focus:outline-none" />
            <button disabled={busy || !claim.trim()} className="shrink-0 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015] disabled:opacity-50">Klaim</button>
          </div>
        </form>
      </div>

      <ul className="space-y-3">
        {orgs.map((o) => (
          <li key={o.id} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-[#2b2118]">{o.name} {o.needs_owner && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">tunggu owner</span>} {!o.isOwner && <span className="ml-1 rounded-full bg-[#e3f0e8] px-2 py-0.5 text-[10px] font-bold text-[#1f6b4a]">manager</span>}</p>
              {o.isOwner && (
                <button disabled={busy} onClick={async () => { const d = await call("regenerate_org_codes", { p_org: o.id }, "Kode baru aktif"); if (d) router.refresh(); }} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2b6cb0] hover:underline disabled:opacity-50">
                  <RefreshCw size={11} /> Acak kode
                </button>
              )}
            </div>
            {o.isOwner && (
              <div className="mt-2 space-y-1 text-[11px] text-[#857768]">
                <p className="flex items-center gap-2">Kode owner: <span className="rounded bg-[#efe9d9] px-1.5 py-0.5 font-mono font-bold text-[#3d2c1e]">{o.owner_code}</span>
                  <button onClick={() => copy(o.owner_code)} className="inline-flex items-center gap-1 font-bold text-[#2b6cb0] hover:underline"><Copy size={11} /> Salin</button></p>
                <p className="flex items-center gap-2">Kode manager: <span className="rounded bg-[#efe9d9] px-1.5 py-0.5 font-mono font-bold text-[#3d2c1e]">{o.manager_code}</span>
                  <button onClick={() => copy(o.manager_code)} className="inline-flex items-center gap-1 font-bold text-[#2b6cb0] hover:underline"><Copy size={11} /> Salin</button></p>
              </div>
            )}
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#2b2118]"><UserPlus size={13} /> Manager ({(o.members ?? []).length})</p>
              {(o.members ?? []).length === 0 && <p className="mt-1 text-[11px] text-[#857768]">Belum ada manager. Share kode manager.</p>}
              <ul className="mt-1.5 space-y-1.5">
                {(o.members ?? []).map((m) => (
                  <li key={m.user_id} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#faf7ef] px-3 py-2 text-xs">
                    <span className="min-w-0 flex-1 truncate font-bold text-[#2b2118]">{m.name ?? m.email ?? m.user_id.slice(0, 8)}</span>
                    <span className="text-[10px] text-[#857768]">{m.scope === null ? "semua kafe" : ((m.scope ?? []).length === 0 ? "tanpa akses" : `${m.scope.length} kafe`)}</span>
                    {o.isOwner && (
                      <>
                        <button disabled={busy} onClick={() => { const ids = cafes.filter((c) => c.org_id === o.id).map((c) => c.id); const hasAccess = m.scope === null || (m.scope || []).length > 0; const next = hasAccess ? [] : ids; call("set_manager_scope", { p_org: o.id, p_user: m.user_id, p_scope: next }, "Scope disimpan"); }} className="font-bold text-[#2b6cb0] hover:underline disabled:opacity-50">
                          {(m.scope === null || (m.scope || []).length > 0) ? "Batasi" : "Buka semua"}
                        </button>
                        <button disabled={busy} onClick={() => { if (confirm("Keluarkan manager ini?")) call("remove_manager", { p_org: o.id, p_user: m.user_id }, "Manager dikeluarkan"); }} className="inline-flex items-center gap-1 font-bold text-red-600 hover:underline disabled:opacity-50">
                          <UserMinus size={11} /> Keluarkan
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {o.isOwner && (
              <form onSubmit={(e) => { e.preventDefault(); if (confirm("Transfer kepemilikan? Kamu jadi manager biasa.")) call("transfer_org_owner", { p_org: o.id, p_new_email: transfer[o.id] ?? "" }, "Kepemilikan pindah").then(() => setTransfer((t) => ({ ...t, [o.id]: "" }))); }} className="mt-3 flex gap-2">
                <input value={transfer[o.id] ?? ""} onChange={(e) => setTransfer((t) => ({ ...t, [o.id]: e.target.value }))} placeholder="Email owner baru" className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-1.5 text-xs focus:border-[#3d2c1e] focus:outline-none" />
                <button disabled={busy || !(transfer[o.id] ?? "").includes("@")} className="shrink-0 rounded-full border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">Transfer owner</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
