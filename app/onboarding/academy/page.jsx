"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, FileText, LoaderCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { academyProfileSchema } from "@/lib/validation";
import { AVATAR_MAX_BYTES } from "@/lib/constants";

const JENIS = ["Lembaga Pelatihan (LPK)", "Akademi Kopi", "Komunitas", "Lainnya"];
const KOTA = ["Yogyakarta", "Jakarta", "Bandung", "Surabaya", "Semarang", "Denpasar", "Medan", "Makassar", "Lainnya"];
const DRAFT_KEY = "academy-onboarding-draft";

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* abaikan draft rusak */ }
  return null;
}

// ponytail: tabel academy_profiles hanya punya name/description/logo_url.
// Field mockup (jenis/website/kota/dokumen) disimpan sebagai draft lokal,
// yang di-upsert ke Supabase tetap name/description — logika DB tidak berubah.
export default function AcademyOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [initial] = useState(readDraft);
  const [name, setName] = useState(initial?.name ?? "");
  const [jenis, setJenis] = useState(initial?.jenis ?? JENIS[0]);
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [kota, setKota] = useState(initial?.kota ?? KOTA[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [docName, setDocName] = useState(initial?.docName ?? "");
  const [docSize, setDocSize] = useState(initial?.docSize ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initial) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("academy_profiles").select("name, description").eq("id", user.id).maybeSingle();
        if (data?.name) setName(data.name);
        if (data?.description) setDescription(data.description);
      } catch { /* diam: form tetap tampil */ }
    })();
  }, [initial]);

  function draft() {
    return { name, jenis, website, kota, description, docName, docSize };
  }

  function handleDoc(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ok = file.type === "application/pdf" || file.type.startsWith("image/");
    if (!ok) {
      toast("Gunakan PDF/JPG maksimal 5 MB", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Gunakan PDF/JPG maksimal 5 MB", "error");
      return;
    }
    setDocName(file.name);
    setDocSize(`${Math.max(1, Math.round(file.size / 1024))} KB`);
  }

  function handleSaveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft()));
      toast("Draft tersimpan ✓");
    } catch {
      toast("Gagal menyimpan draft", "error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = academyProfileSchema.safeParse({ name, description });
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    if (description.trim().length > 500) {
      toast("Deskripsi maksimal 500 karakter", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      const { error } = await supabase.from("academy_profiles").upsert(
        { id: user.id, name: name.trim(), description: description.trim() },
        { onConflict: "id" }
      );
      if (error) throw error;
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft()));
      } catch { /* draft opsional */ }
      toast("Profil akademi tersimpan");
      router.push("/dashboard/academy");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal menyimpan", "error");
    } finally {
      setBusy(false);
    }
  }

  const descLen = description.trim().length;

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#f5f1e8] text-espresso">
      <div className="border-b border-[#e8e0cf] bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
            kerja<span className="text-caramel">.inc</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-espresso px-5 py-2 text-xs font-bold hover:bg-espresso hover:text-white">
              Login
            </Link>
            <Link href="/signup" className="rounded-full bg-espresso px-5 py-2 text-xs font-bold text-white hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight">Daftar sebagai Mitra Academy</h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Lengkapi profil lembaga agar program pelatihanmu dapat ditinjau tim kerja.inc.
        </p>

        <ol className="mt-6 flex items-center gap-2 text-xs font-bold">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-espresso text-[11px] text-white">1</span>
            <span>Profil Lembaga</span>
          </li>
          <li aria-hidden="true" className="h-px flex-1 bg-[#e8e0cf]" />
          <li className="flex items-center gap-2 text-espresso-soft">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8cdae] text-[11px]">2</span>
            <span>Program &amp; Sertifikasi</span>
          </li>
          <li aria-hidden="true" className="h-px flex-1 bg-[#e8e0cf]" />
          <li className="flex items-center gap-2 text-espresso-soft">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8cdae] text-[11px]">3</span>
            <span>Review &amp; Ajukan</span>
          </li>
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e8e0cf] bg-white p-6 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:p-8">
            <h2 className="text-base font-extrabold">1. Profil Lembaga</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input name="nama" type="text" label="Nama lembaga *" placeholder="Barista Academy Nusantara" value={name} onChange={(e) => setName(e.target.value)} />
              <div>
                <label htmlFor="jenis" className="mb-1.5 block text-xs font-bold text-espresso">Jenis lembaga *</label>
                <select id="jenis" value={jenis} onChange={(e) => setJenis(e.target.value)} className="min-h-[44px] w-full rounded-xl border border-[#d8cdae] bg-white px-3 text-sm text-espresso">
                  {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <Input name="website" type="url" label="Website / Instagram" placeholder="https://baristaacademy.id" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <div>
                <label htmlFor="kota" className="mb-1.5 block text-xs font-bold text-espresso">Kota *</label>
                <select id="kota" value={kota} onChange={(e) => setKota(e.target.value)} className="min-h-[44px] w-full rounded-xl border border-[#d8cdae] bg-white px-3 text-sm text-espresso">
                  {KOTA.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Textarea name="deskripsi" label="Deskripsi singkat *" placeholder="Pelatihan barista dan hospitality dengan praktik langsung di kafe mitra, bersertifikat." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              <p className="mt-1 text-right text-[11px] text-espresso-soft">{descLen}/500</p>
            </div>
            <div className="mt-2">
              <p className="mb-1.5 text-xs font-bold text-espresso">Dokumen izin (NIB / izin LPK) *</p>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#d8cdae] px-3 py-2.5">
                <span className="flex min-w-0 flex-1 items-center gap-2 text-xs text-espresso-soft">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{docName ? `${docName} · ${docSize}` : "Belum ada dokumen"}</span>
                </span>
                {docName ? <Check size={14} className="shrink-0 text-matcha" aria-label="Dokumen terpasang" /> : null}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 rounded-full border border-espresso px-4 py-2 text-xs font-bold text-espresso hover:bg-espresso hover:text-white"
                >
                  {docName ? "Unggah Ulang" : "Unggah Dokumen"}
                </button>
                <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleDoc} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="min-h-[44px] rounded-full border border-espresso px-6 text-sm font-bold text-espresso hover:bg-espresso hover:text-white"
              >
                Simpan Draft
              </button>
              <Button type="submit" size="lg" variant="coffee" disabled={busy} className="rounded-full min-h-[44px]">
                {busy ? <LoaderCircle size={16} className="animate-spin" /> : "Simpan & Lanjutkan →"}
              </Button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#e8e0cf] bg-[#f7ecd9] p-5">
              <h2 className="text-sm font-extrabold">Status Verifikasi</h2>
              <p className="mt-2 inline-block rounded-full bg-[#e8e0cf] px-3 py-1 text-[11px] font-bold text-espresso-soft">
                Belum diajukan
              </p>
              <p className="mt-2 text-xs leading-5 text-espresso-soft">
                Dokumen izin diperiksa tim kerja.inc (1–3 hari kerja). Program tampil publik setelah disetujui.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
              <h2 className="text-sm font-extrabold">Langkah Onboarding</h2>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span>Profil Lembaga</span>
                  <span className="font-bold text-caramel">Sedang diisi</span>
                </li>
                <li className="flex items-center justify-between text-espresso-soft">
                  <span>Program &amp; Sertifikasi</span>
                  <span>Belum diisi</span>
                </li>
                <li className="flex items-center justify-between text-espresso-soft">
                  <span>Review &amp; Ajukan</span>
                  <span>Belum diisi</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
