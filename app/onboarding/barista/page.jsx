"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Camera, CheckCircle2, LoaderCircle, Trash2, UserRound, Plus, BadgeCheck, ShieldCheck, Headset, ArrowRight, ArrowLeft, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import Toggle from "@/components/ui/Toggle";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { baristaStep1Schema, skillsSchema } from "@/lib/validation";
import { toMonths } from "@/lib/exp";
import { SKILL_PRESETS, skillLabel, CITIES, AVATAR_MIME_TYPES, AVATAR_MAX_BYTES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { compressImage, formatBytes } from "@/lib/image";
import { friendlyUpload } from "@/lib/errors";

const STEPS = ["Data Diri", "Preferensi Kerja", "Pengalaman Kerja", "Keahlian", "Dokumen", "Selesai"];
const PREF_LOCS = ["Bandung", "Jakarta Selatan", "Jakarta Pusat", "Tebet", "Dago", "Cimahi"];
const PREF_ROLES = ["Barista", "Head Barista", "Kasir", "Server", "Kitchen", "Cleaning"];
const SKILL_CATS = ["Teknik Kopi", "Non-Kopi & Operasional", "Soft Skill"];

function completeness(form, photoUrl, experiences) {
  let score = 0;
  if (form.full_name.trim().length >= 2) score += 15;
  if (photoUrl) score += 15;
  if (form.whatsapp.trim()) score += 10;
  if (form.open_to_types.length > 0) score += 15;
  if (experiences.length > 0 || Number(form.exp_years) > 0 || Number(form.exp_months) > 0) score += 15;
  if (form.skills.length > 0) score += 15;
  if (form.cv || form.cvUrl) score += 15;
  return Math.min(score, 100);
}

export default function BaristaOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ full_name: "", age: "", location_place: "", exp_years: "", exp_months: "", whatsapp: "", open_to_types: [], cover_letter: "", skills: [], certificates: [], cv: null, cvUrl: "", ideas_plus: "", is_open_to_work: true, pref_locations: [], pref_roles: [], availability: "Segera", expected_salary: "" });
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [expDraft, setExpDraft] = useState({ place: "", role: "", period: "", desc: "" });
  const [photo, setPhoto] = useState({ url: "", uploading: false, size: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState({ full_name: false, whatsapp: false });

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("barista_profiles").select("full_name, whatsapp").eq("id", user.id).maybeSingle();
        if (!data) return;
        const l = {};
        if (data.full_name) { setForm((f) => ({ ...f, full_name: data.full_name })); l.full_name = true; }
        if (data.whatsapp) { setForm((f) => ({ ...f, whatsapp: data.whatsapp })); l.whatsapp = true; }
        if (Object.keys(l).length) setLocked((p) => ({ ...p, ...l }));
      } catch { /* diam */ }
    })();
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const pct = completeness(form, photo.url, experiences);

  function goNext() {
    if (step === 0) {
      const parsed = baristaStep1Schema.safeParse({ full_name: form.full_name, age: form.age, location_place: form.location_place });
      if (!parsed.success) { const errs = {}; parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message)); setErrors(errs); return; }
      if (!photo.url) { toast("Foto profil wajib diunggah dulu ya", "error"); return; }
      setErrors({});
    }
    if (step === 3) {
      const parsed = skillsSchema.safeParse(form);
      if (!parsed.success) { const errs = {}; parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message)); setErrors(errs); return; }
      setErrors({});
    }
    if (step === 4) {
      const errs = {};
      if (!form.cv && !form.cvUrl) errs.cv = "CV PDF wajib diunggah (max 5MB)";
      if (form.cv && form.cv.type !== "application/pdf") errs.cv = "CV harus PDF";
      if (form.cv && form.cv.size > 5 * 1024 * 1024) errs.cv = "CV maksimal 5MB";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setErrors({});
    }
    if (step === 4) { handleSubmit(); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type)) { toast("Format harus JPG, PNG, atau WebP", "error"); return; }
    setPhoto((p) => ({ ...p, uploading: true }));
    const blob = await compressImage(file);
    if (blob.size > AVATAR_MAX_BYTES) { toast("Ukuran gambar terlalu besar (maks 5MB)", "error"); setPhoto((p) => ({ ...p, uploading: false })); return; }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("no session");
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPhoto({ url: data.publicUrl, uploading: false, size: blob.size });
      toast("Foto berhasil diunggah");
    } catch (err) { toast(friendlyUpload(err), "error"); setPhoto((p) => ({ ...p, uploading: false })); }
  }

  function addSkill(raw) {
    const value = raw.trim();
    if (!value) return;
    if (form.skills.includes(value)) return;
    if (form.skills.length >= 10) { toast("Maksimal 10 skill", "error"); return; }
    set("skills", [...form.skills, value]);
    setSkillInput("");
  }
  function addCert() {
    const value = certInput.trim();
    if (!value) return;
    if (form.certificates.length >= 5) { toast("Maksimal 5 sertifikat", "error"); return; }
    set("certificates", [...form.certificates, value]);
    setCertInput("");
  }
  function addExperience() {
    if (!expDraft.place.trim() || !expDraft.role.trim()) { toast("Nama tempat & peran wajib diisi", "error"); return; }
    setExperiences((arr) => [...arr, { ...expDraft }]);
    setExpDraft({ place: "", role: "", period: "", desc: "" });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      let cvUrlToSave = form.cvUrl || null;
      if (form.cv) {
        const cvPath = `${user.id}/cv-${Date.now()}.pdf`;
        const { error: cvErr } = await supabase.storage.from("cvs").upload(cvPath, form.cv, { contentType: "application/pdf", upsert: true });
        if (cvErr) throw cvErr;
        const { data: cvData } = supabase.storage.from("cvs").getPublicUrl(cvPath);
        cvUrlToSave = cvData.publicUrl;
      }
      const expMonths = toMonths(form.exp_years, form.exp_months);
      const historyText = experiences.map((x) => `${x.role} @ ${x.place} (${x.period})${x.desc ? " — " + x.desc : ""}`).join("\n");
      const { error } = await supabase.from("barista_profiles").upsert({
        id: user.id, full_name: form.full_name.trim(), age: Number(form.age), location_place: form.location_place.trim(),
        profile_picture_url: photo.url, years_of_experience: Math.floor(expMonths / 12), experience_months: expMonths,
        skills: form.skills, whatsapp: form.whatsapp?.replace(/\D/g, "") || null, open_to_types: form.open_to_types,
        cv_url: cvUrlToSave || null, cover_letter: [historyText, form.cover_letter].filter(Boolean).join("\n\n"),
        certificates: form.certificates, ideas_plus: form.ideas_plus.trim(), is_open_to_work: form.is_open_to_work,
      }, { onConflict: "id" });
      if (error) throw error;
      setDone(true);
      setStep(5);
    } catch (err) { toast(friendlyUpload(err.message || err), "error"); }
    finally { setSubmitting(false); }
  }

  const checks = [
    { label: "Data Diri", done: form.full_name.trim().length >= 2 && !!photo.url },
    { label: "Preferensi Kerja", done: form.open_to_types.length > 0 },
    { label: "Pengalaman Kerja", done: experiences.length > 0 || Number(form.exp_years) > 0 },
    { label: "Keahlian", done: form.skills.length > 0 },
    { label: "Dokumen", done: !!(form.cv || form.cvUrl) },
  ];

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-[#1c1412]">
      {/* header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">kerja<span className="text-[#b07a3b]">.inc</span></Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#6b5d4d] md:flex">
          <Link href="/jobs">Cari Kerja</Link><Link href="/talent">Talenta</Link><Link href="/training">Academy</Link><Link href="/feed">Feed</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold">Login</Link>
          <span className="rounded-full bg-[#3d2b1f] px-4 py-2 text-sm font-bold text-white">Daftar Gratis</span>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-6 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">Buat profil kamu<br />dan temukan peluang<br />kerja terbaik</h1>
          <p className="mt-3 max-w-md text-sm text-[#6b5d4d]">Lengkapi profilmu langkah demi langkah, dan sistem kami akan mencocokkannya dengan peluang kerja yang sesuai dengan keahlianmu.</p>
        </div>
        <div className="relative h-44 overflow-hidden rounded-2xl md:h-56">
          <Image src="/images/landing/barista-1.jpg" alt="Barista tersenyum" fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f6f1e7] via-transparent to-transparent" />
          <div className="absolute right-3 top-3 max-w-[180px] rounded-xl bg-white/90 p-3 text-[11px] italic shadow">&ldquo;Lamaran dan profil lengkap bikin peluang diterima 3x lebih besar.&rdquo;</div>
        </div>
      </section>

      {/* stepper */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center rounded-2xl bg-white px-4 py-4 shadow-sm">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${i < step ? "bg-[#4a7c59] text-white" : i === step ? "bg-[#3d2b1f] text-white" : "bg-[#e9e0cf] text-[#8a7a63]"}`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </span>
                <span className={`hidden text-[10px] font-bold sm:block ${i === step ? "text-[#1c1412]" : "text-[#8a7a63]"}`}>{label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 rounded ${i < step ? "bg-[#4a7c59]" : "bg-[#e9e0cf]"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* body */}
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">1. Data Diri</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-[#4a7c59]"><ShieldCheck size={12} /> Data kamu aman</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {!locked.full_name && <Input name="full_name" label="Nama Lengkap" placeholder="cth. Andi Pratama" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} error={errors.full_name} />}
                <Input name="phone" label="No. HP / WhatsApp" placeholder="cth. 0812 3456 7890" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                <Input name="age" type="number" min={15} max={90} label="Umur" placeholder="cth. 22" value={form.age} onChange={(e) => set("age", e.target.value)} error={errors.age} />
                <div className="sm:col-span-2">
                  <Input name="location_place" label="Domisili" placeholder="cth. Bandung" list="city-list" value={form.location_place} onChange={(e) => set("location_place", e.target.value)} error={errors.location_place} />
                  <datalist id="city-list">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold">Foto Profil <span className="text-red-500">*</span></p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative">
                    <Avatar src={photo.url} name={form.full_name} size="xl" />
                    {photo.uploading && <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white"><LoaderCircle size={22} className="animate-spin" /></span>}
                    {!photo.url && !photo.uploading && <UserRound aria-hidden size={36} className="absolute inset-0 m-auto text-[#d8cbb2]" />}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept={AVATAR_MIME_TYPES.join(",")} className="hidden" onChange={handleFile} aria-label="Unggah foto profil" />
                    <Button variant={photo.url ? "secondary" : "primary"} onClick={() => fileRef.current?.click()} disabled={photo.uploading}><Camera size={15} />{photo.url ? "Ganti Foto" : "Pilih Foto"}</Button>
                    <p className="mt-2 text-[11px] text-[#8a7a63]">JPG/PNG/WebP • maks 5MB{photo.url && photo.size > 0 && ` • ${formatBytes(photo.size)}`}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span />
                <Button onClick={goNext}>Simpan & Lanjutkan <ArrowRight size={15} /></Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold">2. Preferensi Kerja</h2>
              <div>
                <p className="text-sm font-bold">Tipe pekerjaan yang dicari <span className="text-red-500">*</span></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMPLOYMENT_TYPES.map((t) => (
                    <label key={t.value} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${form.open_to_types.includes(t.value) ? "border-[#3d2b1f] bg-[#3d2b1f] text-white" : "border-[#e0d5bd] text-[#6b5d4d]"}`}>
                      <input type="checkbox" className="sr-only" checked={form.open_to_types.includes(t.value)} onChange={(e) => setForm((s) => ({ ...s, open_to_types: e.target.checked ? [...s.open_to_types, t.value] : s.open_to_types.filter((v) => v !== t.value) }))} />{t.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold">Lokasi yang diminati</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREF_LOCS.map((c) => (
                    <label key={c} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold ${form.pref_locations.includes(c) ? "border-[#b07a3b] bg-[#b07a3b]/10 text-[#b07a3b]" : "border-[#e0d5bd] text-[#6b5d4d]"}`}>
                      <input type="checkbox" className="sr-only" checked={form.pref_locations.includes(c)} onChange={(e) => setForm((s) => ({ ...s, pref_locations: e.target.checked ? [...s.pref_locations, c] : s.pref_locations.filter((v) => v !== c) }))} />{c}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold">Peran yang diminati</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREF_ROLES.map((r) => (
                    <label key={r} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold ${form.pref_roles.includes(r) ? "border-[#b07a3b] bg-[#b07a3b]/10 text-[#b07a3b]" : "border-[#e0d5bd] text-[#6b5d4d]"}`}>
                      <input type="checkbox" className="sr-only" checked={form.pref_roles.includes(r)} onChange={(e) => setForm((s) => ({ ...s, pref_roles: e.target.checked ? [...s.pref_roles, r] : s.pref_roles.filter((v) => v !== r) }))} />{r}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="availability" label="Ketersediaan mulai" value={form.availability} onChange={(e) => set("availability", e.target.value)} />
                <Input name="expected_salary" label="Ekspektasi gaji (opsional)" placeholder="cth. 3,5 jt/bln" value={form.expected_salary} onChange={(e) => set("expected_salary", e.target.value)} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" onClick={() => setStep(0)}><ArrowLeft size={15} /> Kembali</Button>
                <Button onClick={goNext}>Simpan & Lanjutkan <ArrowRight size={15} /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold">3. Pengalaman Kerja</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="exp_years" type="number" min={0} max={50} label="Pengalaman (tahun)" placeholder="cth. 1" value={form.exp_years} onChange={(e) => set("exp_years", e.target.value)} />
                <Input name="exp_months" type="number" min={0} max={11} label="Plus (bulan)" placeholder="cth. 2" value={form.exp_months} onChange={(e) => set("exp_months", e.target.value)} />
              </div>
              {experiences.map((x, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl border border-[#e9e0cf] p-4">
                  <div><p className="text-sm font-extrabold">{x.role} @ {x.place}</p><p className="text-xs text-[#8a7a63]">{x.period}</p>{x.desc && <p className="mt-1 text-sm">{x.desc}</p>}</div>
                  <button type="button" className="text-[#8a7a63] hover:text-red-500" onClick={() => setExperiences((a) => a.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
                </div>
              ))}
              <div className="grid gap-3 rounded-xl bg-[#faf7ef] p-4 sm:grid-cols-2">
                <Input name="x_place" label="Tempat kerja" placeholder="cth. Kopi Kenangan Tebet" value={expDraft.place} onChange={(e) => setExpDraft((d) => ({ ...d, place: e.target.value }))} />
                <Input name="x_role" label="Peran" placeholder="cth. Barista" value={expDraft.role} onChange={(e) => setExpDraft((d) => ({ ...d, role: e.target.value }))} />
                <Input name="x_period" label="Periode" placeholder="cth. 2022 — 2024" value={expDraft.period} onChange={(e) => setExpDraft((d) => ({ ...d, period: e.target.value }))} />
                <Input name="x_desc" label="Deskripsi singkat" placeholder="cth. Pegang bar & latte art" value={expDraft.desc} onChange={(e) => setExpDraft((d) => ({ ...d, desc: e.target.value }))} />
                <div className="sm:col-span-2"><Button variant="secondary" onClick={addExperience}><Plus size={15} /> Tambah Pengalaman Kerja</Button></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft size={15} /> Kembali</Button>
                <Button onClick={goNext}>Simpan & Lanjutkan <ArrowRight size={15} /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold">4. Keahlian</h2>
              {SKILL_CATS.map((cat) => (
                <div key={cat}>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#8a7a63]">{cat}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SKILL_PRESETS.filter((p) => !form.skills.includes(p)).slice(0, cat === "Teknik Kopi" ? 6 : 4).map((preset) => (
                      <button key={preset} type="button" onClick={() => addSkill(preset)} className="rounded-full border border-dashed border-[#d8cbb2] px-3 py-1.5 text-xs font-semibold text-[#6b5d4d] hover:border-[#b07a3b] hover:text-[#b07a3b]">+ {skillLabel(preset)}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} placeholder="Tulis skill lalu tekan Enter" className="w-full rounded-xl border border-[#e0d5bd] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#b07a3b]" />
              </div>
              {errors.skills && <p className="text-xs font-medium text-red-500">{errors.skills}</p>}
              {form.skills.length > 0 && <div className="flex flex-wrap gap-2">{form.skills.map((s) => <button key={s} type="button" onClick={() => set("skills", form.skills.filter((x) => x !== s))} className="inline-flex items-center gap-1 rounded-full bg-[#b07a3b]/10 px-3 py-1.5 text-xs font-bold text-[#b07a3b] hover:bg-red-100 hover:text-red-600">{skillLabel(s)}<Trash2 size={12} /></button>)}</div>}
              <div>
                <p className="text-sm font-bold">Sertifikat <span className="font-medium text-[#8a7a63]">(opsional)</span></p>
                <div className="mt-2 flex gap-2">
                  <input value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }} placeholder="cth. SCA Barista Foundation 2024" className="w-full rounded-xl border border-[#e0d5bd] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#b07a3b]" />
                  <Button variant="secondary" onClick={addCert}>Tambah</Button>
                </div>
                {form.certificates.length > 0 && <ul className="mt-3 space-y-2">{form.certificates.map((c, idx) => <li key={`${c}-${idx}`} className="flex items-center justify-between rounded-xl bg-[#faf7ef] px-4 py-2.5 text-sm"><span className="inline-flex items-center gap-2"><BadgeCheck size={15} className="text-[#4a7c59]" />{c}</span><button type="button" onClick={() => set("certificates", form.certificates.filter((_, i) => i !== idx))} className="text-[#8a7a63] hover:text-red-500"><Trash2 size={14} /></button></li>)}</ul>}
              </div>
              <Textarea name="ideas_plus" label="Ide & nilai plus kamu" placeholder="cth. Punya ide menu signature, biasa bikin konten latte art..." value={form.ideas_plus} maxLength={500} onChange={(e) => set("ideas_plus", e.target.value)} />
              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft size={15} /> Kembali</Button>
                <Button onClick={goNext}>Simpan & Lanjutkan <ArrowRight size={15} /></Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold">5. Dokumen</h2>
              <div className="flex items-center gap-4">
                <Avatar src={photo.url} name={form.full_name} size="xl" />
                <div className="text-sm"><p className="font-extrabold">{form.full_name || "Nama kamu"}</p><p className="text-[#8a7a63]">{form.location_place || "Domisili"}</p></div>
              </div>
              <div>
                <p className="text-sm font-bold">CV PDF <span className="text-red-500">*</span> <span className="font-normal text-[#8a7a63]">(max 5MB)</span></p>
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#d8cbb2] bg-[#faf7ef] px-4 py-3 text-sm hover:border-[#b07a3b]">
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setForm((s) => ({ ...s, cv: e.target.files?.[0] || null }))} />
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#3d2b1f] px-3 py-1.5 text-xs font-bold text-white"><Upload size={13} /> Pilih PDF</span>
                  <span className="truncate text-[#6b5d4d]">{form.cv ? `${form.cv.name} — ${(form.cv.size / 1024).toFixed(0)} KB` : form.cvUrl ? "CV sudah terunggah" : "Belum ada file"}</span>
                </label>
                {errors.cv && <p className="mt-1 text-xs font-medium text-red-500">{errors.cv}</p>}
              </div>
              <Textarea name="cover_letter" label="Cover letter (opsional)" placeholder="Ceritakan kenapa kamu cocok..." value={form.cover_letter} maxLength={1000} onChange={(e) => set("cover_letter", e.target.value)} />
              <div className="rounded-2xl bg-[#faf7ef] p-5"><Toggle checked={form.is_open_to_work} onChange={(v) => set("is_open_to_work", v)} label="Buka untuk peluang kerja" description={form.is_open_to_work ? "Profilmu tampil di pencarian pemilik coffee shop" : "Profilmu disembunyikan dari pencarian"} /></div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" onClick={() => setStep(3)}><ArrowLeft size={15} /> Kembali</Button>
                <Button onClick={goNext} disabled={submitting}>{submitting ? "Menyimpan..." : <>Kirim & Selesaikan <ArrowRight size={15} /></>}</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4a7c59] text-white"><CheckCircle2 size={30} /></span>
              <h2 className="mt-4 text-xl font-extrabold">Profil kamu selesai!</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[#6b5d4d]">Selamat! Profilmu sudah lengkap {pct}%. Sekarang kamu bisa melamar ke peluang kerja terbaik yang sesuai dengan keahlianmu.</p>
              <div className="mx-auto mt-6 grid max-w-sm gap-3 text-left">
                <Link href="/jobs" className="flex items-center justify-between rounded-xl border border-[#e9e0cf] px-4 py-3 text-sm font-bold hover:border-[#b07a3b]">Lihat Peluang Kerja <ArrowRight size={15} /></Link>
                <Link href="/dashboard/barista" className="flex items-center justify-between rounded-xl border border-[#e9e0cf] px-4 py-3 text-sm font-bold hover:border-[#b07a3b]">Lihat Profil <ArrowRight size={15} /></Link>
              </div>
              <Button className="mt-6" onClick={() => router.push(done ? "/dashboard/barista" : "/jobs")}>Ke Dashboard <ArrowRight size={15} /></Button>
            </div>
          )}
        </section>

        {/* sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-extrabold">Kelengkapan Profil</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efe7d5]"><div className="h-full rounded-full bg-[#4a7c59] transition-all" style={{ width: `${pct}%` }} /></div>
            <p className="mt-1 text-right text-xs font-bold text-[#4a7c59]">{pct}%</p>
            <ul className="mt-3 space-y-2">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${c.done ? "bg-[#4a7c59] text-white" : "border border-[#d8cbb2] text-transparent"}`}><CheckCircle2 size={13} /></span><span className={c.done ? "font-bold" : "text-[#8a7a63]"}>{c.label}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[#fff8e8] p-5 text-xs shadow-sm">
            <p className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck size={15} /> Kenapa profil lengkap penting?</p>
            <p className="mt-2 leading-relaxed text-[#6b5d4d]">Profil lengkap dilirik 3x lebih sering oleh pemilik usaha. Foto asli, pengalaman jelas, dan CV rapi bikin kamu dipercaya sejak pandangan pertama.</p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-[#6b5d4d]">
            {[["Terpercaya", ShieldCheck], ["Cepat", BadgeCheck], ["Komunitas", Headset], ["Aman", ShieldCheck]].map(([l, Icon]) => (
              <div key={l} className="rounded-xl bg-white p-3 shadow-sm"><Icon size={16} className="mx-auto text-[#b07a3b]" /><p className="mt-1">{l}</p></div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
