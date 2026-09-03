"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, LoaderCircle, Trash2, UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import Toggle from "@/components/ui/Toggle";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { baristaStep1Schema, skillsSchema } from "@/lib/validation";
import { SKILL_PRESETS, CITIES, AVATAR_MIME_TYPES, AVATAR_MAX_BYTES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { compressImage, formatBytes } from "@/lib/image";

const STEPS = ["Data Diri", "Foto Profil", "Skill & Sertifikat", "Dokumen & Tipe", "Siap Kerja"];

export default function BaristaOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);

  // step data
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    location_place: "",
  whatsapp: "",
  open_to_types: [],
  cover_letter: "",
    skills: [],
    certificates: [],
  cv: null,
  cvUrl: "",
    ideas_plus: "",
    is_open_to_work: true,
  });
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  // photo
  const [photo, setPhoto] = useState({ url: "", uploading: false, size: 0 });
  const [submitting, setSubmitting] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  /* ---------------- Step navigation ---------------- */
  function next() {
    if (step === 0) {
      const parsed = baristaStep1Schema.safeParse({
        full_name: form.full_name,
        age: form.age,
        location_place: form.location_place,
      });
      if (!parsed.success) {
        const errs = {};
        parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
        setErrors(errs);
        return;
      }
      setErrors({});
    }
    if (step === 1 && !photo.url) {
      toast("Foto profil wajib diunggah dulu ya", "error");
      return;
    }
    if (step === 2) {
      const parsed = skillsSchema.safeParse(form);
      if (!parsed.success) {
        const errs = {};
        parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
        setErrors(errs);
        return;
      }
      setErrors({});
    }
    if (step === 3) {
      const errs = {};
      if (!form.open_to_types || form.open_to_types.length === 0) errs.open_to_types = "Pilih minimal 1 tipe pekerjaan";
      if (!form.cv && !form.cvUrl) errs.cv = "CV PDF wajib diunggah (max 5MB)";
      if (!form.cover_letter || form.cover_letter.trim().length < 20) errs.cover_letter = "Cover letter minimal 20 karakter";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      if (form.cv && form.cv.type !== "application/pdf") { setErrors({ cv: "CV harus PDF" }); return; }
      if (form.cv && form.cv.size > 5 * 1024 * 1024) { setErrors({ cv: "CV maksimal 5MB" }); return; }
      setErrors({});
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  /* ---------------- Photo handling ---------------- */
  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      toast("Format harus JPG, PNG, atau WebP", "error");
      return;
    }

    setPhoto((p) => ({ ...p, uploading: true }));
    const blob = await compressImage(file);

    if (blob.size > AVATAR_MAX_BYTES) {
      toast("Ukuran gambar terlalu besar (maks 2MB)", "error");
      setPhoto((p) => ({ ...p, uploading: false }));
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("no session");

      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPhoto({ url: data.publicUrl, uploading: false, size: blob.size });
      toast("Foto berhasil diunggah");
    } catch {
      toast("Gagal mengunggah foto, coba lagi", "error");
      setPhoto((p) => ({ ...p, uploading: false }));
    }
  }

  /* ---------------- Skills / certificates ---------------- */
  function addSkill(raw) {
    const value = raw.trim();
    if (!value) return;
    if (form.skills.includes(value)) return;
    if (form.skills.length >= 10) {
      toast("Maksimal 10 skill", "error");
      return;
    }
    set("skills", [...form.skills, value]);
    setSkillInput("");
  }

  function addCert() {
    const value = certInput.trim();
    if (!value) return;
    if (form.certificates.length >= 5) {
      toast("Maksimal 5 sertifikat", "error");
      return;
    }
    set("certificates", [...form.certificates, value]);
    setCertInput("");
  }

  /* ---------------- Final submit ---------------- */
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
    let cvUrlToSave = form.cvUrl || null;
    if (form.cv) {
      if (form.cv.type !== "application/pdf") throw new Error("CV harus PDF");
      if (form.cv.size > 5 * 1024 * 1024) throw new Error("CV max 5MB");
      const cvPath = `${user.id}/cv-${Date.now()}.pdf`;
      const { error: cvErr } = await supabase.storage.from("cvs").upload(cvPath, form.cv, { contentType: "application/pdf", upsert: true });
      if (cvErr) throw cvErr;
      const { data: cvData } = supabase.storage.from("cvs").getPublicUrl(cvPath);
      cvUrlToSave = cvData.publicUrl;
    }

      const payload = {
        id: user.id,
        full_name: form.full_name.trim(),
        age: Number(form.age),
        location_place: form.location_place.trim(),
        profile_picture_url: photo.url,
        years_of_experience: 0,
        skills: form.skills,
        whatsapp: form.whatsapp?.replace(/\D/g,"") || null,
        open_to_types: form.open_to_types,
        cv_url: cvUrlToSave || null,
        cover_letter: form.cover_letter,
        certificates: form.certificates,
        ideas_plus: form.ideas_plus.trim(),
        is_open_to_work: form.is_open_to_work,
      };

      const { error } = await supabase
        .from("barista_profiles")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;

      router.push("/dashboard/barista");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal menyimpan profil", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = (() => {
  if (form.full_name.trim().length < 2 || Number(form.age) < 17 || !form.location_place.trim()) return false;
  if (!photo.url) return false;
  if (form.skills.length === 0) return false;
  if (form.open_to_types.length === 0) return false;
  if (!form.cv && !form.cvUrl) return false;
  if (form.cover_letter.trim().length < 20) return false;
  return true;
})();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition-colors ${
                  i < step
                    ? "bg-matcha text-white"
                    : i === step
                      ? "bg-caramel text-white"
                      : "bg-latte/70 text-espresso-soft"
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </span>
              <span className="hidden text-[10px] font-bold text-espresso-soft sm:block">
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 mb-0 h-0.5 flex-1 rounded sm:mb-5 ${
                  i < step ? "bg-matcha" : "bg-latte/70"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Data diri */}
      {step === 0 && (
        <section className="animate-rise space-y-4">
          <h1 className="text-xl font-extrabold text-espresso">
            Kenalan dulu yuk 👋
          </h1>
          <Input
            name="full_name"
            label="Nama lengkap"
            placeholder="cth. Rizky Pratama"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            error={errors.full_name}
          />
          <Input
            name="age"
            type="number"
            min={15}
            max={90}
            label="Umur"
            placeholder="cth. 21"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            error={errors.age}
          />
          <div>
            <Input
              name="location_place"
              label="Domisili"
              placeholder="cth. Bandung"
              list="city-list"
              value={form.location_place}
              onChange={(e) => set("location_place", e.target.value)}
              error={errors.location_place}
            />
            <datalist id="city-list">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          <Input
            name="whatsapp"
            label="WhatsApp (opsional)"
            placeholder="08xxxxxxxxxx"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            error={errors.whatsapp}
          />
          </div>
        </section>
      )}

      {/* STEP 2: Foto */}
      {step === 1 && (
        <section className="animate-rise">
          <h1 className="text-xl font-extrabold text-espresso">
            Foto profil kamu
          </h1>
          <p className="mt-1 text-sm text-espresso-soft">
            Foto jadi bukti kamu orang sungguhan — pemilik usaha jauh lebih
            percaya pada profil berfoto.
          </p>

          <div className="mt-8 flex flex-col items-center">
            <div className="relative">
              <Avatar src={photo.url} name={form.full_name} size="xl" />
              {photo.uploading && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-espresso/50 text-white">
                  <LoaderCircle size={26} className="animate-spin" />
                </span>
              )}
              {!photo.url && !photo.uploading && (
                <UserRound
                  aria-hidden
                  size={44}
                  className="absolute inset-0 m-auto text-latte"
                />
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept={AVATAR_MIME_TYPES.join(",")}
              className="hidden"
              onChange={handleFile}
            />

            <Button
              variant={photo.url ? "secondary" : "primary"}
              className="mt-6"
              onClick={() => fileRef.current?.click()}
              disabled={photo.uploading}
            >
              <Camera size={16} />
              {photo.url ? "Ganti Foto" : "Pilih Foto"}
            </Button>

            <p className="mt-3 text-center text-[11px] text-espresso-soft">
              JPG/PNG/WebP • otomatis dikompres • maks 2MB
              {photo.url &&
                photo.size > 0 &&
                ` • terkirim ${formatBytes(photo.size)}`}
            </p>
          </div>
        </section>
      )}

      {/* STEP 3: Skill & sertifikat */}
      {step === 2 && (
        <section className="animate-rise space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-espresso">Keahlian</h1>
            <p className="mt-1 text-sm text-espresso-soft">
              Minimal satu skill biar peluang dilamar makin besar.
            </p>

            <div className="mt-4 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Tulis skill lalu tekan Enter"
                className="w-full rounded-xl border border-latte bg-white text-[#1c1412] px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
              />
            </div>

            {errors.skills && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.skills}
              </p>
            )}

            {form.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      set(
                        "skills",
                        form.skills.filter((x) => x !== s)
                      )
                    }
                    className="group inline-flex items-center gap-1 rounded-full bg-caramel/10 px-3 py-1.5 text-xs font-bold text-caramel hover:bg-red-100 hover:text-red-600"
                  >
                    {s}
                    <Trash2 size={12} />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-4 text-[11px] font-bold tracking-wide text-espresso-soft uppercase">
              Saran skill:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKILL_PRESETS.filter((p) => !form.skills.includes(p)).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addSkill(preset)}
                    className="rounded-full card-dark border-dashed px-3 py-1.5 text-xs font-semibold text-espresso-soft hover:border-caramel hover:text-caramel"
                  >
                    + {preset}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-espresso">
              Sertifikat{" "}
              <span className="font-medium text-espresso-soft">(opsional)</span>
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCert();
                  }
                }}
                placeholder="cth. SCA Barista Foundation 2024"
                className="w-full rounded-xl border border-latte bg-white text-[#1c1412] px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
              />
              <Button variant="secondary" onClick={addCert}>
                Tambah
              </Button>
            </div>
            {form.certificates.length > 0 && (
              <ul className="mt-3 space-y-2">
                {form.certificates.map((c, idx) => (
                  <li
                    key={`${c}-${idx}`}
                    className="flex items-center justify-between rounded-xl card-dark px-4 py-2.5 text-sm"
                  >
                    <span className="truncate">{c}</span>
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "certificates",
                          form.certificates.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-espresso-soft hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Textarea
            name="ideas_plus"
            label="Ide & nilai plus kamu"
            placeholder="cth. Punya ide menu signature musim panas, biasa bikin konten latte art..."
            value={form.ideas_plus}
            maxLength={500}
            onChange={(e) => set("ideas_plus", e.target.value)}
          />
          <p className="-mt-3 text-right text-[11px] text-espresso-soft">
            {form.ideas_plus.length}/500
          </p>
        </section>
      )}

      {/* STEP 4: Dokumen & Tipe (Wajib) */}
      {step === 3 && (
        <section className="animate-rise space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-espresso">Dokumen & tipe kerja</h1>
            <p className="mt-1 text-sm text-espresso-soft">CV PDF & cover letter wajib — tipe kerja pilih minimal 1.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-espresso">Tipe pekerjaan yang kamu cari <span className="text-red-500">*</span></p>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_TYPES.map((t) => (
                <label key={t.value} className={`px-4 py-2 rounded-full text-sm font-bold border cursor-pointer transition ${form.open_to_types.includes(t.value) ? "bg-caramel text-white border-caramel" : "card-dark border-[#2c241f] text-espresso-soft hover:border-caramel"}`}>
                  <input type="checkbox" className="sr-only" checked={form.open_to_types.includes(t.value)} onChange={(e) => {
                    setForm((s) => ({ ...s, open_to_types: e.target.checked ? [...s.open_to_types, t.value] : s.open_to_types.filter((v) => v !== t.value) }));
                  }} />
                  {t.label}
                </label>
              ))}
            </div>
            {errors.open_to_types && <p className="text-xs font-medium text-red-500">{errors.open_to_types}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-espresso">CV PDF <span className="text-red-500">*</span> <span className="font-normal text-espresso-soft">(max 5MB)</span></p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#2c241f] bg-[#16100d] px-4 py-3 text-sm hover:border-caramel">
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setForm((s) => ({ ...s, cv: e.target.files?.[0] || null }))} />
              <span className="rounded-lg bg-caramel px-3 py-1.5 text-xs font-bold text-white">Pilih PDF</span>
              <span className="truncate text-espresso-soft">{form.cv ? `${form.cv.name} — ${(form.cv.size/1024).toFixed(0)} KB` : form.cvUrl ? "CV sudah terunggah" : "Belum ada file"}</span>
            </label>
            {errors.cv && <p className="text-xs font-medium text-red-500">{errors.cv}</p>}
          </div>
          <Textarea
            name="cover_letter"
            label="Cover letter"
            placeholder="Ceritakan kenapa kamu cocok, pengalaman relevan, & tipe shift yang kamu bisa..."
            value={form.cover_letter}
            maxLength={1000}
            onChange={(e) => set("cover_letter", e.target.value)}
            error={errors.cover_letter}
          />
          <p className="-mt-3 text-right text-[11px] text-espresso-soft">{form.cover_letter.length}/1000 (min 20)</p>
        </section>
      )}

      {/* STEP 5: Siap kerja */}
      {step === 4 && (
        <section className="animate-rise">
          <h1 className="text-xl font-extrabold text-espresso">
            Terakhir — status siap kerja
          </h1>
          <p className="mt-1 text-sm text-espresso-soft">
            Bisa kamu ubah kapan saja dari halaman profil.
          </p>

          <div className="mt-6 rounded-2xl card-dark p-5">
            <Toggle
              checked={form.is_open_to_work}
              onChange={(v) => set("is_open_to_work", v)}
              label="Buka untuk peluang kerja"
              description={
                form.is_open_to_work
                  ? "Profilmu tampil di pencarian pemilik coffee shop"
                  : "Profilmu disembunyikan dari pencarian"
              }
            />
          </div>

          <div className="mt-6 rounded-2xl card-dark p-5 text-sm">
            <p className="font-bold text-espresso">Ringkasan</p>
            <ul className="mt-2 space-y-1 text-espresso-soft">
              <li>👤 {form.full_name}, {form.age} th — 📍 {form.location_place}</li>
              <li>📱 {form.whatsapp || "—"} • {form.is_open_to_work ? "Buka peluang" : "Tutup"}</li>
              <li>🛠️ {form.skills.join(", ")}</li>
              <li>📜 {form.certificates.length} sertifikat</li>
              <li>💼 {form.open_to_types.length ? form.open_to_types.join(", ") : "—"} • CV: {form.cv ? form.cv.name : form.cvUrl ? "terunggah" : "—"}</li>
              <li>✉️ Cover: {form.cover_letter.length} karakter</li>
            </ul>
          </div>
        </section>
      )}

      {/* Nav buttons */}
      <div className="mt-10 flex gap-3">
        {step > 0 && (
          <Button
            variant="secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={submitting}
          >
            Kembali
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next} full disabled={photo.uploading}>
            Lanjut
          </Button>
        ) : (
          <Button onClick={handleSubmit} full disabled={!canSubmit || submitting}>
            {submitting ? "Menyimpan..." : "Selesai & Mulai Cari Kerja"}
          </Button>
        )}
      </div>
    </div>
  );
}
