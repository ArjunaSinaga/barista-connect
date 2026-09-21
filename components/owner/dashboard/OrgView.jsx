"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Copy, UserPlus, UserMinus, KeyRound, MailPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// Kelola PT: buat, klaim (owner telat), undangan token, manager, transfer.
// ponytail: semua aksi via RPC / policy server; client cuma panggil.
export default function OrgView({ orgs = [], cafes = [], onBack }) {
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [claim, setClaim] = useState("");
  const [transfer, setTransfer] = useState({});
  const [token, setToken] = useState("");

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

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">Owner</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">PT / Organisasi ({orgs.length})</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-espresso-soft">1 PT menaungi banyak kafe. Manager diundang per PT.</p>
        </div>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2 text-xs font-bold text-espresso hover:border-coffee">
          Dashboard
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); call("accept_invite", { p_token: token }, "Gabung PT berhasil").then((d) => { if (d) setToken(""); }); }} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><UserPlus size={15} /> Gabung via undangan</h3>
          <div className="mt-3 flex gap-2">
            <input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} placeholder="XXXXXXXX-XXXXXXXX" maxLength={17} className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase focus:border-coffee focus:outline-none" />
            <button disabled={busy || !token.trim()} className="shrink-0 rounded-full bg-[#1f6b4a] px-4 py-2 text-xs font-bold text-white hover:bg-[#17573c] disabled:opacity-50">Gabung</button>
          </div>
        </form>
        <form onSubmit={(e) => { e.preventDefault(); call("create_org", { p_name: name, p_iam_owner: true }, "PT dibuat — kamu pemiliknya").then(() => setName("")); }} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><Building2 size={15} /> Buat PT baru</h3>
          <div className="mt-3 flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Senja Group" className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-2 text-sm font-bold text-espresso focus:border-coffee focus:outline-none" />
            <button disabled={busy || name.trim().length < 3} className="shrink-0 rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015] disabled:opacity-50">Buat</button>
          </div>
          <button type="button" disabled={busy || name.trim().length < 3} onClick={() => call("create_org", { p_name: name, p_iam_owner: false }, "PT dibuat — kamu manager, owner menyusul").then(() => setName(""))} className="mt-2 text-xs font-bold text-link hover:underline disabled:opacity-50">
            Saya manager-nya (pemilik menyusul)
          </button>
        </form>
        <form onSubmit={(e) => { e.preventDefault(); call("claim_org_owner", { p_code: claim }, "Kamu kini pemilik PT").then(() => setClaim("")); }} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><KeyRound size={15} /> Klaim PT (owner telat daftar)</h3>
          <div className="mt-3 flex gap-2">
            <input value={claim} onChange={(e) => setClaim(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" maxLength={9} className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase focus:border-coffee focus:outline-none" />
            <button disabled={busy || !claim.trim()} className="shrink-0 rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015] disabled:opacity-50">Klaim</button>
          </div>
        </form>
      </div>

      <ul className="space-y-3">
        {orgs.map((o) => (
          <li key={o.id} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-espresso">{o.name} {o.kind === "personal" && <span className="ml-1 rounded-full bg-[#e3f0e8] px-2 py-0.5 text-[10px] font-bold text-matcha">pribadi</span>} {o.needs_owner && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">tunggu owner</span>} {!o.isOwner && <span className="ml-1 rounded-full bg-[#e3f0e8] px-2 py-0.5 text-[10px] font-bold text-matcha">manager</span>}</p>
            </div>
            {o.isOwner && <InviteManager org={o} onChanged={() => router.refresh()} />}
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-espresso"><UserPlus size={13} /> Manager ({(o.members ?? []).length})</p>
              {(o.members ?? []).length === 0 && <p className="mt-1 text-[11px] text-espresso-soft">Belum ada manager. Undang via formulir di atas.</p>}
              <ul className="mt-1.5 space-y-1.5">
                {(o.members ?? []).map((m) => (
                  <li key={m.user_id} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#faf7ef] px-3 py-2 text-xs">
                    <span className="min-w-0 flex-1 truncate font-bold text-espresso">{m.name ?? m.email ?? m.user_id.slice(0, 8)}</span>
                    <span className="text-[10px] text-espresso-soft">{m.scope === null ? "semua kafe" : ((m.scope ?? []).length === 0 ? "tanpa akses" : `${m.scope.length} kafe`)}</span>
                    {o.isOwner && (
                      <>
                        <button disabled={busy} onClick={() => { const ids = cafes.filter((c) => c.org_id === o.id).map((c) => c.id); const hasAccess = m.scope === null || (m.scope || []).length > 0; const next = hasAccess ? [] : ids; call("set_manager_scope", { p_org: o.id, p_user: m.user_id, p_scope: next }, "Scope disimpan"); }} className="font-bold text-link hover:underline disabled:opacity-50">
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
                <input value={transfer[o.id] ?? ""} onChange={(e) => setTransfer((t) => ({ ...t, [o.id]: e.target.value }))} placeholder="Email owner baru" className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-1.5 text-xs focus:border-coffee focus:outline-none" />
                <button disabled={busy || !(transfer[o.id] ?? "").includes("@")} className="shrink-0 rounded-full border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">Transfer owner</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

// Undang manager/viewer via token kedaluwarsa (ganti kode statis).
function InviteManager({ org, onChanged }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("invitations").select("id,email,role,token,expires_at").eq("org_id", org.id).is("accepted_at", null).order("created_at", { ascending: false });
      setList(data ?? []);
    } catch { /* diam */ }
  }
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("invitations").select("id,email,role,token,expires_at").eq("org_id", org.id).is("accepted_at", null).order("created_at", { ascending: false });
        if (on) setList(data ?? []);
      } catch { /* diam */ }
    })();
    return () => { on = false; };
  }, [org.id]);

  async function invite(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("invitations").insert({ org_id: org.id, email: email.trim(), role, invited_by: user?.id ?? null }).select("id").single();
      if (error) throw error;
      await supabase.from("org_audit").insert({ org_id: org.id, actor_id: user?.id ?? null, action: "invite_created", detail: { email: email.trim(), role } });
      toast("Undangan dibuat — share token ke calon manager");
      setEmail("");
      load();
      onChanged?.();
      return data;
    } catch (err) {
      toast(err?.message || "Gagal buat undangan", "error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id) {
    if (!confirm("Batalkan undangan ini?")) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
      toast("Undangan dibatalkan");
      load();
    } catch (err) {
      toast(err?.message || "Gagal", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copy(t) {
    try { await navigator.clipboard.writeText(t); toast("Token disalin"); }
    catch { toast("Gagal salin", "error"); }
  }

  return (
    <div className="mt-2 rounded-xl bg-[#faf7ef] p-3">
      <p className="flex items-center gap-1.5 text-xs font-extrabold text-espresso"><MailPlus size={13} /> Undang manager / viewer</p>
      <form onSubmit={invite} className="mt-2 flex flex-wrap gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email calon manager" type="email" className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-white px-3 py-1.5 text-xs focus:border-coffee focus:outline-none" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-full border border-[#e0d5bd] bg-white px-3 py-1.5 text-xs font-bold text-espresso focus:border-coffee focus:outline-none">
          <option value="manager">Manager</option>
          <option value="viewer">Viewer</option>
        </select>
        <button disabled={busy || !email.includes("@")} className="shrink-0 rounded-full bg-coffee px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2e2015] disabled:opacity-50">Buat undangan</button>
      </form>
      {list.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {list.map((inv) => (
            <li key={inv.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-[11px]">
              <span className="min-w-0 flex-1 truncate font-bold text-espresso">{inv.email} <span className="font-normal text-espresso-soft">· {inv.role} · s/d {new Date(inv.expires_at).toLocaleDateString("id-ID")}</span></span>
              <button onClick={() => copy(inv.token)} className="inline-flex items-center gap-1 font-mono font-bold text-link hover:underline"><Copy size={11} /> {inv.token}</button>
              <button onClick={() => revoke(inv.id)} className="inline-flex items-center gap-1 font-bold text-red-600 hover:underline"><X size={11} /> Batal</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
