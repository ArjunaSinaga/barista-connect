"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, LoaderCircle, Camera, Upload, ArrowRight, ArrowLeft,
  ShieldCheck, Store, Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_MIME_TYPES, AVATAR_MAX_BYTES } from "@/lib/constants";
import { compressImage } from "@/lib/image";
import { friendlyUpload } from "@/lib/errors";

const STEPS = ["Informasi Dasar Perusahaan", "Detail Outlet", "Foto & Media Outlet", "Tim & Kontak Rekrutmen", "Review & Aktivasi"];
const BIZ_TYPES = [
  { value: "coffee_shop", label: "F&B / Coffee Shop" },
  { value: "restaurant", label: "Restoran" },
  { value: "hotel", label: "Hotel" },
  { value: "retail", label: "Retail" },
  { value: "office", label: "Kantor / Lainnya" },
];
const DRAFT_KEY = "owner-onboarding-draft";

// Wizard onboarding owner 5 langkah (OWN-ONB). Hanya field yang ada kolomnya di DB:
// owners(business_name, business_type, whatsapp, location, avatar_url, is_verified),
// cafes(name, address, location, whatsapp, photo_urls). NIB/NPWP, dokumen legalitas,
// jam operasional, sosmed, peta, preferensi notifikasi BELUM ada kolomnya -> tidak dibuat
// (tidak dikarang), dicatat sebagai kebutuhan migrasi.
export default function OwnerOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const logoRef = useRef(null);
  const photoRef = useRef(null);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    business_name: "", business_type: "coffee_shop", whatsapp: "", location: "",
    logo_url: "", outlet_name: "", outlet_address: "", outlet_location: "",
    outlet_whatsapp: "", outlet_photos: [], cafeId: null, pic_whatsapp: "",
    declaration: false,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Prefill + draft (OWN-ONB-01/03).
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setEmail(user.email ?? "");
        const { data: ow } = await supabase.from("owners")
          .select("business_name, business_type, whatsapp, location, avatar_url, is_verified")
          .eq("id", user.id).maybeSingle();
        const { data: cafe } = await supabase.from("cafes")
          .select("id, name, address, location, whatsapp, photo_urls")
          .eq("owner_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
        let draft = null;
        try { draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null"); } catch { /* abaikan */ }
        setForm((f) => ({
          ...f,
          business_name: ow?.business_name ?? draft?.business_name ?? "",
          business_type: ow?.business_type ?? draft?.business_type ?? "coffee_shop",
          whatsapp: ow?.whatsapp ?? draft?.whatsapp ?? "",
          location: ow?.location ?? draft?.location ?? "",
          logo_url: ow?.avatar_url ?? draft?.logo_url ?? "",
          outlet_name: cafe?.name ?? draft?.outlet_name ?? "",
          outlet_address: cafe?.address ?? draft?.outlet_address ?? "",
          outlet_location: cafe?.location ?? draft?.outlet_location ?? "",
          outlet_whatsapp: cafe?.whatsapp ?? draft?.outlet_whatsapp ?? "",
          outlet_photos: cafe?.photo_urls?.length ? cafe.photo_urls : (draft?.outlet_photos ?? []),
          cafeId: cafe?.id ?? draft?.cafeId ?? null,
          pic_whatsapp: ow?.whatsapp ?? draft?.pic_whatsapp ?? "",
        }));
        setVerified(!!ow?.is_verified);
        if (ow?.business_name && cafe?.id) setDone(false);
      } catch { /* diam: form tetap tampil */ }
    })();
  }, []);

  useEffect(() => {
    if (done) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* abaikan */ }
  }, [form, done]);

  const waOk = (v) => /^[\d+\s-]{8,20}$/.test((v ?? "").trim());

  async function uploadTo(bucket, file) {
    const blob = await compressImage(file);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const path = `${user.id}/${Date.now()}-${Math.floor(Math.random() * 1e4)}.jpg`;
    const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: "image/jpeg" });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function pickLogo(file) {
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type)) { toast("Logo harus JPG, PNG, atau WebP", "error"); return; }
    setUploading(true);
    try {
      const url = await uploadTo("avatars", file);
      set("logo_url", url);
      toast("Logo terpasang");
    } catch (err) { toast(friendlyUpload(err), "error"); }
    finally { setUploading(false); }
  }

  async function pickPhotos(files) {
    const arr = [...files];
    if (form.outlet_photos.length + arr.length > 9) { toast("Maksimal 9 foto", "error"); return; }
    setUploading(true);
    try {
      const urls = [];
      for (const f of arr) {
        if (!AVATAR_MIME_TYPES.includes(f.type)) { toast(`${f.name}: harus JPG/PNG/WebP`, "error"); continue; }
        urls.push(await uploadTo("cafes", f));
      }
      set("outlet_photos", [...form.outlet_photos, ...urls]);
    } catch (err) { toast(friendlyUpload(err), "error"); }
    finally { setUploading(false); }
  }

  async function saveCompany() {
    const e = {};
    if (form.business_name.trim().length < 2) e.business_name = "Nama perusahaan minimal 2 karakter";
    if (!waOk(form.whatsapp)) e.whatsapp = "Nomor WhatsApp 8–20 digit";
    if (!form.location.trim()) e.location = "Lokasi wajib diisi";
    if (!form.logo_url) e.logo_url = "Logo perusahaan wajib diunggah";
    if (Object.keys(e).length) { setErrors(e); return false; }
    setErrors({});
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      const { data: ow, error } = await supabase.from("owners").upsert({
        id: user.id, business_name: form.business_name.trim(),
        business_type: form.business_type, whatsapp: form.whatsapp.trim(),
        location: form.location.trim(), avatar_url: form.logo_url,
      }, { onConflict: "id" }).select("is_verified").maybeSingle();
      if (error) throw error;
      setVerified(!!ow?.is_verified);
      try { await supabase.rpc("ensure_personal_org", { p_name: form.business_name.trim() }); } catch { /* abaikan */ }
      if (!form.pic_whatsapp) set("pic_whatsapp", form.whatsapp);
      return true;
    } catch (err) { toast(friendlyUpload(err.message || err), "error"); return false; }
    finally { setBusy(false); }
  }

  async function saveOutlet() {
    const e = {};
    if (form.outlet_name.trim().length < 2) e.outlet_name = "Nama outlet minimal 2 karakter";
    if (!form.outlet_address.trim()) e.outlet_address = "Alamat wajib diisi";
    if (!form.outlet_location.trim()) e.outlet_location = "Lokasi wajib diisi";
    if (form.outlet_whatsapp && !waOk(form.outlet_whatsapp)) e.outlet_whatsapp = "Nomor 8–20 digit";
    if (!form.outlet_photos.length) e.outlet_photos = "Minimal 1 foto outlet";
    if (Object.keys(e).length) { setErrors(e); return false; }
    setErrors({});
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      const payload = {
        owner_id: user.id, name: form.outlet_name.trim(),
        address: form.outlet_address.trim(), location: form.outlet_location.trim(),
        whatsapp: (form.outlet_whatsapp || form.whatsapp).trim(), photo_urls: form.outlet_photos,
      };
      let cafeId = form.cafeId;
      if (cafeId) {
        const { error } = await supabase.from("cafes").update(payload).eq("id", cafeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("cafes").insert(payload).select("id").single();
        if (error) throw error;
        cafeId = data.id;
        set("cafeId", cafeId);
      }
      return true;
    } catch (err) { toast(friendlyUpload(err.message || err), "error"); return false; }
    finally { setBusy(false); }
  }

  async function next() {
    if (step === 0) { if (await saveCompany()) setStep(1); return; }
    if (step === 1) { if (await saveOutlet()) setStep(2); return; }
    if (step === 2) { if (await saveOutlet()) setStep(3); return; }
    if (step === 3) {
      const e = {};
      if (!waOk(form.pic_whatsapp)) e.pic_whatsapp = "Nomor PIC 8–20 digit";
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setBusy(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("owners").update({ whatsapp: form.pic_whatsapp.trim() }).eq("id", user.id);
        if (error) throw error;
        setStep(4);
      } catch (err) { toast(friendlyUpload(err.message || err), "error"); }
      finally { setBusy(false); }
      return;
    }
  }

  async function activate() {
    if (!form.declaration) { setErrors({ declaration: "Centang pernyataan akurasi dulu" }); return; }
    setBusy(true);
    try {
      const ok1 = await saveCompany();
      const ok2 = ok1 && await saveOutlet();
      if (!ok1 || !ok2) return;
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* abaikan */ }
      setDone(true);
    } finally { setBusy(false); }
  }

  const stepDone = [
    form.business_name.trim().length >= 2 && !!form.logo_url,
    form.outlet_name.trim().length >= 2 && form.outlet_photos.length > 0,
    form.outlet_photos.length > 0,
    waOk(form.pic_whatsapp),
    done,
  ];
  const pct = Math.round((stepDone.filter(Boolean).length / STEPS.length) * 100);

  if (done) {
    return (
      <div className="min-h-screen bg-[#f6f1e7] text-[#1c1412]">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4a7c59] text-white">
            <CheckCircle2 size={30} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Outlet Berhasil Ditambahkan!</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#6b5d4d]">
            Outlet Anda sekarang aktif dan siap digunakan untuk merekrut talenta terbaik.
          </p>
          <div className={`mx-auto mt-4 max-w-md rounded-xl px-4 py-3 text-left text-xs font-bold ${verified ? "bg-green-50 text-green-700" : "bg-[#fff8e8] text-[#8a6d1f]"}`}>
            {verified ? "Status: Terverifikasi — perusahaan Anda lolos verifikasi." : "Status: Menunggu Verifikasi — lengkapi profil untuk mempercepat proses verifikasi."}
          </div>
          <div className="mx-auto mt-6 grid max-w-md gap-2.5 text-left">
            {[
              ["Buat lowongan pekerjaan pertama", "Mulai lowongan pekerjaan pertama Anda.", "/dashboard/owner/jobs/new"],
              ["Kelola dan pantau lamaran", "Lihat pelamar yang masuk dan proses rekrutmen.", "/dashboard/owner?tab=pelamar"],
              ["Lihat Dashboard", "Pantau aktivitas merekrut dan mengelola lowongan.", "/dashboard/owner"],
              ["Tambah outlet lain", "Kelola semua outlet Anda dalam satu tempat.", "/dashboard/owner/cafes/new"],
            ].map(([t, d, href], i) => (
              <Link key={t} href={href} className="flex items-center gap-3 rounded-xl border border-[#e8e0cf] bg-white p-3.5 hover:border-coffee">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coffee text-xs font-extrabold text-white">{i + 1}</span>
                <span><span className="block text-sm font-extrabold text-espresso">{t}</span><span className="block text-xs text-espresso-soft">{d}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sec = "rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6";

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-[#1c1412]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-extrabold">Selamat datang, {form.business_name || "Owner"}! 👋</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6b5d4d]">
          Sebelum memulai proses rekrutmen, lengkapi terlebih dahulu data outlet dan profil perusahaan Anda.
        </p>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-4">
            {/* Stepper */}
            <div className="flex items-center rounded-2xl bg-white px-4 py-4 shadow-sm">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center last:flex-none">
                  <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1" aria-current={i === step ? "step" : undefined}>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${i < step ? "bg-[#4a7c59] text-white" : i === step ? "bg-[#3d2b1f] text-white" : "bg-[#e9e0cf] text-[#8a7a63]"}`}>
                      {i < step ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <span className={`hidden text-center text-[10px] font-bold sm:block ${i === step ? "text-[#1c1412]" : "text-[#8a7a63]"}`}>{label}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 rounded ${i < step ? "bg-[#4a7c59]" : "bg-[#e9e0cf]"}`} />}
                </div>
              ))}
            </div>

            {step === 0 && (
              <section className={sec} aria-label="Informasi dasar perusahaan">
                <h2 className="text-base font-extrabold">Informasi Dasar Perusahaan</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input name="business_name" label="Nama Perusahaan / Brand" placeholder="cth. Kopi Kenangan" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} error={errors.business_name} />
                  <div>
                    <label htmlFor="biz-type" className="mb-1 block text-sm font-bold">Jenis Badan Usaha</label>
                    <select id="biz-type" value={form.business_type} onChange={(e) => set("business_type", e.target.value)} className="w-full rounded-xl border border-[#e0d5bd] bg-white px-4 py-2.5 text-sm outline-none">
                      {BIZ_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <Input name="whatsapp" label="WhatsApp Perusahaan" placeholder="08xxxxxxxxxx" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} error={errors.whatsapp} />
                  <Input name="location" label="Kota / Lokasi" placeholder="cth. Jakarta Selatan" value={form.location} onChange={(e) => set("location", e.target.value)} error={errors.location} />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold">Logo Perusahaan</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar src={form.logo_url} name={form.business_name || "Usaha"} size="lg" />
                    <input ref={logoRef} type="file" accept={AVATAR_MIME_TYPES.join(",")} className="hidden" onChange={(e) => pickLogo(e.target.files?.[0])} aria-label="Unggah logo" />
                    <Button variant="secondary" size="sm" onClick={() => logoRef.current?.click()} disabled={uploading}>
                      {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Camera size={14} />} {form.logo_url ? "Ganti Logo" : "Unggah Logo"}
                    </Button>
                  </div>
                  {errors.logo_url && <p className="mt-1 text-xs font-medium text-red-500">{errors.logo_url}</p>}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={next} disabled={busy}>Simpan & Lanjut <ArrowRight size={15} /></Button>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className={sec} aria-label="Detail outlet">
                <h2 className="text-base font-extrabold">Detail Outlet</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input name="outlet_name" label="Nama Outlet / Cabang" placeholder="cth. Kopi Kenangan — Kemang" value={form.outlet_name} onChange={(e) => set("outlet_name", e.target.value)} error={errors.outlet_name} />
                  <Input name="outlet_whatsapp" label="WhatsApp Outlet" placeholder="08xxxxxxxxxx" value={form.outlet_whatsapp} onChange={(e) => set("outlet_whatsapp", e.target.value)} error={errors.outlet_whatsapp} />
                  <div className="sm:col-span-2">
                    <Input name="outlet_address" label="Alamat Lengkap" placeholder="cth. Jl. Kemang Raya No. 12, Jakarta Selatan" value={form.outlet_address} onChange={(e) => set("outlet_address", e.target.value)} error={errors.outlet_address} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input name="outlet_location" label="Kota / Area" placeholder="cth. Jakarta Selatan" value={form.outlet_location} onChange={(e) => set("outlet_location", e.target.value)} error={errors.outlet_location} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold">Foto Outlet (min 1)</p>
                  <PhotoGrid photos={form.outlet_photos} onRemove={(u) => set("outlet_photos", form.outlet_photos.filter((x) => x !== u))} photoRef={photoRef} onPick={pickPhotos} uploading={uploading} />
                  {errors.outlet_photos && <p className="mt-1 text-xs font-medium text-red-500">{errors.outlet_photos}</p>}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(0)}><ArrowLeft size={15} /> Kembali</Button>
                  <Button onClick={next} disabled={busy}>Simpan & Lanjut <ArrowRight size={15} /></Button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className={sec} aria-label="Foto dan media outlet">
                <h2 className="text-base font-extrabold">Foto & Media Outlet</h2>
                <p className="mt-1 text-sm text-[#6b5d4d]">Tambahkan foto suasana outlet agar kandidat bisa melihat tempat kerja sebelum melamar.</p>
                <div className="mt-3">
                  <PhotoGrid photos={form.outlet_photos} onRemove={(u) => set("outlet_photos", form.outlet_photos.filter((x) => x !== u))} photoRef={photoRef} onPick={pickPhotos} uploading={uploading} />
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft size={15} /> Kembali</Button>
                  <Button onClick={next} disabled={busy}>Simpan & Lanjut <ArrowRight size={15} /></Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className={sec} aria-label="Tim dan kontak rekrutmen">
                <h2 className="text-base font-extrabold">Tim & Kontak Rekrutmen</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input name="pic_whatsapp" label="WhatsApp Perekrutan (PIC)" placeholder="08xxxxxxxxxx" value={form.pic_whatsapp} onChange={(e) => set("pic_whatsapp", e.target.value)} error={errors.pic_whatsapp} />
                  <Input name="email" label="Email" value={email} onChange={() => {}} disabled />
                </div>
                <div className="mt-3 rounded-xl bg-[#faf7ef] p-4">
                  <p className="text-sm font-extrabold">Undang Anggota Tim</p>
                  <p className="mt-1 text-[13px] text-[#6b5d4d]">Butuh kolega membantu rekrutmen? Undang sebagai Manager/Viewer lewat halaman Tim & Akses.</p>
                  <Link href="/dashboard/owner?tab=org" className="mt-2 inline-block rounded-full border border-[#e0d5bd] bg-white px-4 py-2 text-xs font-bold hover:border-coffee">
                    Buka Tim & Akses →
                  </Link>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft size={15} /> Kembali</Button>
                  <Button onClick={next} disabled={busy}>Simpan & Lanjut <ArrowRight size={15} /></Button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className={sec} aria-label="Review dan aktivasi">
                <h2 className="text-base font-extrabold">Review Informasi</h2>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="rounded-xl bg-[#faf7ef] p-4">
                    <p className="flex items-center gap-2 font-extrabold"><Store size={15} /> {form.business_name} <button type="button" onClick={() => setStep(0)} className="ml-auto text-xs font-bold text-link hover:underline">Ubah</button></p>
                    <p className="mt-1 text-[#6b5d4d]">{BIZ_TYPES.find((t) => t.value === form.business_type)?.label} • {form.location} • {form.whatsapp}</p>
                  </div>
                  <div className="rounded-xl bg-[#faf7ef] p-4">
                    <p className="font-extrabold">Outlet: {form.outlet_name} <button type="button" onClick={() => setStep(1)} className="float-right text-xs font-bold text-link hover:underline">Ubah</button></p>
                    <p className="mt-1 text-[#6b5d4d]">{form.outlet_address} • {form.outlet_location} • {form.outlet_photos.length} foto</p>
                  </div>
                  <div className="rounded-xl bg-[#faf7ef] p-4">
                    <p className="font-extrabold">PIC: {form.pic_whatsapp} <button type="button" onClick={() => setStep(3)} className="float-right text-xs font-bold text-link hover:underline">Ubah</button></p>
                    <p className="mt-1 text-[#6b5d4d]">{email}</p>
                  </div>
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] leading-6 text-[#6b5d4d]">
                  <input type="checkbox" checked={form.declaration} onChange={(e) => set("declaration", e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#4a2f1d]" />
                  Saya menyatakan bahwa semua informasi yang saya berikan adalah benar.
                </label>
                {errors.declaration && <p className="mt-1 text-xs font-medium text-red-500">{errors.declaration}</p>}
                <div className="mt-4 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(3)}><ArrowLeft size={15} /> Kembali</Button>
                  <Button onClick={activate} disabled={busy}>{busy ? "Mengaktifkan..." : "Aktifkan Outlet"}</Button>
                </div>
              </section>
            )}
          </div>

          {/* Kanan */}
          <aside className="space-y-3">
            <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
              <p className="flex items-center gap-1.5 text-sm font-extrabold"><ShieldCheck size={15} /> Status Verifikasi Perusahaan</p>
              <p className={`mt-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ${verified ? "bg-green-50 text-green-700" : "bg-[#fff8e8] text-[#8a6d1f]"}`}>
                {verified ? "Terverifikasi — perusahaan Anda lolos verifikasi." : "Menunggu Verifikasi — lengkapi profil untuk mempercepat proses verifikasi."}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
              <p className="flex items-center justify-between text-sm font-extrabold">Langkah Onboarding <span className="text-xs text-[#4a7c59] tabular-nums">{pct}%</span></p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efe7d5]"><div className="h-full rounded-full bg-[#4a7c59] transition-all" style={{ width: `${pct}%` }} /></div>
              <ol className="mt-3 space-y-2">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-2 text-[13px]">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${stepDone[i] ? "bg-[#4a7c59] text-white" : i === step ? "bg-[#3d2b1f] text-white" : "bg-[#e9e0cf] text-[#8a7a63]"}`}>
                      {stepDone[i] ? <CheckCircle2 size={12} /> : i + 1}
                    </span>
                    <span className={i === step ? "font-bold" : "text-[#6b5d4d]"}>{s}</span>
                    <span className="ml-auto text-[11px] text-[#8a7a63]">{stepDone[i] ? "Selesai" : i === step ? "Sedang diisi" : "Belum diisi"}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl bg-[#fff8e8] p-5 text-xs">
              <p className="text-sm font-extrabold">Tips Melengkapi Profil Outlet</p>
              <ul className="mt-2 space-y-1.5 leading-relaxed text-[#6b5d4d]">
                {["Gunakan nama brand yang jelas dan sesuai legalitas.", "Unggah logo dengan resolusi baik.", "Isi alamat lengkap sesuai dokumen resmi.", "Foto suasana asli meningkatkan kepercayaan talenta."].map((t) => (
                  <li key={t} className="flex gap-1.5"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-600" />{t}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PhotoGrid({ photos, onRemove, photoRef, onPick, uploading }) {
  return (
    <div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {photos.map((u) => (
          <div key={u} className="group relative h-24 overflow-hidden rounded-xl">
            <Image src={u} alt="Foto outlet" fill className="object-cover" sizes="160px" />
            <button type="button" onClick={() => onRemove(u)} aria-label="Hapus foto" className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          type="button" onClick={() => photoRef.current?.click()} disabled={uploading}
          className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#d8cbb2] text-xs font-bold text-[#8a7a63] hover:border-coffee"
        >
          {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />} Tambah Foto
        </button>
      </div>
      <input ref={photoRef} type="file" accept={AVATAR_MIME_TYPES.join(",")} multiple className="hidden" aria-label="Tambah foto outlet"
        onChange={(e) => { const f = [...(e.target.files ?? [])]; e.target.value = ""; onPick(f); }} />
    </div>
  );
}
