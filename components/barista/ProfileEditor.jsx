"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Save, Trash2, ImagePlus, FileText, Upload } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SKILL_PRESETS, skillLabel, AVATAR_MIME_TYPES, AVATAR_MAX_BYTES, PORTFOLIO_MIME_TYPES, PORTFOLIO_MAX_BYTES, PORTFOLIO_MAX_ITEMS } from "@/lib/constants";
import { compressImage, formatBytes } from "@/lib/image";
import { profileUpdateSchema } from "@/lib/validation";
import { focusFirstError } from "@/lib/focusFirstError";
import { splitMonths, toMonths } from "@/lib/exp";

export default function ProfileEditor({ initial, portfolio = [] }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const portfolioFileRef = useRef(null);

  const initExp = splitMonths(initial.experience_months ?? (initial.years_of_experience ?? 0) * 12);
  const [form, setForm] = useState({
    full_name: initial.full_name ?? "",
    age: initial.age ?? "",
    location_place: initial.location_place ?? "",
    exp_years: initExp.years,
    exp_months: initExp.months,
    skills: initial.skills ?? [],
    certificates: initial.certificates ?? [],
    ideas_plus: initial.ideas_plus ?? "",
    is_open_to_work: initial.is_open_to_work ?? true,
  });
  const [photoUrl, setPhotoUrl] = useState(initial.profile_picture_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [items, setItems] = useState(portfolio);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [cvUrl, setCvUrl] = useState(initial.cv_url ?? "");
  const [uploadingCv, setUploadingCv] = useState(false);
  const cvFileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const completeness = [
    Boolean(photoUrl),
    form.full_name.length > 2,
    Boolean(form.age),
    Boolean(form.location_place),
    form.skills.length > 0,
    form.certificates.length > 0 || form.ideas_plus.length > 20,
    Boolean(cvUrl),
  ].filter(Boolean).length;

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      toast("Format harus JPG, PNG, atau WebP", "error");
      return;
    }
    setUploading(true);
    const blob = await compressImage(file);
    if (blob.size > AVATAR_MAX_BYTES) {
      toast("Gambar terlalu besar (maks 5MB)", "error");
      setUploading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      toast("Foto diperbarui — jangan lupa simpan");
    } catch {
      toast("Gagal unggah foto", "error");
    } finally {
      setUploading(false);
    }
  }

  function addSkill(raw) {
    const v = raw.trim();
    if (!v || form.skills.includes(v)) return;
    if (form.skills.length >= 10) return toast("Maksimal 10 skill", "error");
    set("skills", [...form.skills, v]);
    setSkillInput("");
  }

  function addCert() {
    const v = certInput.trim();
    if (!v) return;
    if (form.certificates.length >= 5) return toast("Maksimal 5 sertifikat", "error");
    set("certificates", [...form.certificates, v]);
    setCertInput("");
  }

  async function handlePortfolioFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!PORTFOLIO_MIME_TYPES.includes(file.type)) {
      toast("Format harus JPG, PNG, atau WebP", "error");
      return;
    }
    if (items.length >= PORTFOLIO_MAX_ITEMS) {
      toast(`Maksimal ${PORTFOLIO_MAX_ITEMS} foto portofolio`, "error");
      return;
    }
    setUploadingPortfolio(true);
    try {
      const blob = await compressImage(file);
      if (blob.size > PORTFOLIO_MAX_BYTES) {
        toast("Gambar terlalu besar (maks 10MB)", "error");
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/portfolio-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("portfolio").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const { data: row, error: insErr } = await supabase
        .from("barista_portfolio")
        .insert({ barista_id: user.id, image_url: data.publicUrl })
        .select()
        .single();
      if (insErr) throw insErr;
      setItems((prev) => [...prev, row]);
      toast("Foto portofolio ditambahkan ✓");
      router.refresh();
    } catch {
      toast("Gagal mengunggah portofolio", "error");
    } finally {
      setUploadingPortfolio(false);
    }
  }

  async function handleCaptionSave(id, caption) {
    const v = caption.trim().slice(0, 140);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, caption: v } : it)));
    try {
      const supabase = createClient();
      const { error } = await supabase.from("barista_portfolio").update({ caption: v }).eq("id", id);
      if (error) throw error;
    } catch {
      toast("Gagal menyimpan caption", "error");
    }
  }

  async function handlePortfolioDelete(id) {
    const target = items.find((it) => it.id === id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      const supabase = createClient();
      const { error } = await supabase.from("barista_portfolio").delete().eq("id", id);
      if (error) throw error;
      toast("Foto dihapus");
      router.refresh();
    } catch {
      if (target) setItems((prev) => [...prev, target]);
      toast("Gagal menghapus foto", "error");
    }
  }

  async function handleCvFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast("CV harus berformat PDF", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("CV terlalu besar (maks 5MB)", "error");
      return;
    }
    setUploadingCv(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/cv-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("cvs").getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from("barista_profiles")
        .update({ cv_url: data.publicUrl })
        .eq("id", user.id);
      if (dbErr) throw dbErr;
      setCvUrl(data.publicUrl);
      toast("CV diperbarui ✓");
      router.refresh();
    } catch {
      toast("Gagal mengunggah CV", "error");
    } finally {
      setUploadingCv(false);
    }
  }

  async function handleSave() {
    const parsed = profileUpdateSchema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      toast("Periksa kembali isian kamu", "error");
      focusFirstError(errs);
      return;
    }
    if (!photoUrl) {
      toast("Foto profil wajib ada", "error");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const months = toMonths(parsed.data.exp_years, parsed.data.exp_months);
      const { exp_years, exp_months, ...rest } = parsed.data;
      const { error } = await supabase
        .from("barista_profiles")
        .update({ ...rest, years_of_experience: Math.floor(months / 12), experience_months: months, profile_picture_url: photoUrl })
        .eq("id", user.id);
      if (error) throw error;
      toast("Profil tersimpan ✓");
      router.refresh();
    } catch {
      toast("Gagal menyimpan profil", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">Profil Saya</h1>

      {/* completeness meter */}
      <div className="rounded-2xl card-dark p-5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-espresso">Kelengkapan profil</span>
          <span className={completeness >= 7 ? "text-matcha" : "text-caramel"}>
            {Math.round((completeness / 7) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-latte/60">
          <div
            className={`h-full rounded-full transition-all ${completeness >= 7 ? "bg-matcha" : "bg-caramel"}`}
            style={{ width: `${(completeness / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* photo */}
      <div className="flex flex-col items-center rounded-2xl card-dark p-6">
        <div className="relative">
          <Avatar src={photoUrl} name={form.full_name} size="xl" />
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
              <LoaderCircle size={26} className="animate-spin" />
            </span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={AVATAR_MIME_TYPES.join(",")}
          hidden
          onChange={handleFile}
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Camera size={14} /> Ganti foto
        </Button>
      </div>

      {/* data diri */}
      <div className="space-y-4 rounded-2xl card-dark p-6">
        <p className="font-bold text-espresso">Data Diri</p>
        <Input
          name="full_name"
          label="Nama lengkap"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          error={errors.full_name}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="age"
            type="number"
            label="Umur"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            error={errors.age}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              name="exp_years"
              type="number"
              min={0}
              max={50}
              label="Pengalaman (tahun)"
              value={form.exp_years}
              onChange={(e) => set("exp_years", e.target.value)}
              error={errors.exp_years}
            />
            <Input
              name="exp_months"
              type="number"
              min={0}
              max={11}
              label="Plus (bulan)"
              value={form.exp_months}
              onChange={(e) => set("exp_months", e.target.value)}
              error={errors.exp_months}
            />
          </div>
        </div>
        <Input
          name="location_place"
          label="Domisili"
          value={form.location_place}
          onChange={(e) => set("location_place", e.target.value)}
          error={errors.location_place}
        />
      </div>

      {/* skills */}
      <div className="rounded-2xl card-dark p-6">
        <p className="font-bold text-espresso">Keahlian</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.skills.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                set("skills", form.skills.filter((x) => x !== s))
              }
              className="inline-flex items-center gap-1 rounded-full bg-caramel/10 px-3 py-1.5 text-xs font-bold text-caramel hover:bg-red-100 hover:text-red-600"
            >
              {skillLabel(s)} <Trash2 size={11} />
            </button>
          ))}
        </div>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(skillInput);
            }
          }}
          placeholder="Tulis skill lalu Enter"
          className="mt-3 w-full rounded-xl border border-latte bg-white text-[#1c1412] px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
        />
        {form.skills.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SKILL_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addSkill(preset)}
                className="rounded-full border border-dashed border-latte px-3 py-1.5 text-xs font-semibold text-espresso-soft hover:border-caramel hover:text-caramel"
              >
                + {skillLabel(preset)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* certificates */}
      <div className="rounded-2xl card-dark p-6">
        <p className="font-bold text-espresso">
          Sertifikat{" "}
          <span className="font-medium text-espresso-soft">(opsional)</span>
        </p>
        <ul className="mt-3 space-y-2">
          {form.certificates.map((c, idx) => (
            <li
              key={`${c}-${idx}`}
              className="flex items-center justify-between rounded-xl border border-latte px-4 py-2.5 text-sm"
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
        <div className="mt-3 flex gap-2">
          <input
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCert();
              }
            }}
            placeholder="cth. SCA Barista Foundation"
            className="w-full rounded-xl border border-latte bg-white text-[#1c1412] px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
          />
          <Button variant="secondary" onClick={addCert}>
            Tambah
          </Button>
        </div>
      </div>

      {/* portfolio */}
      <div className="rounded-2xl card-dark p-6">
        <div className="flex items-center justify-between">
          <p className="font-bold text-espresso">
            Portofolio{" "}
            <span className="font-medium text-espresso-soft">
              ({items.length}/{PORTFOLIO_MAX_ITEMS})
            </span>
          </p>
          <input
            ref={portfolioFileRef}
            type="file"
            accept={PORTFOLIO_MIME_TYPES.join(",")}
            hidden
            onChange={handlePortfolioFile}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => portfolioFileRef.current?.click()}
            disabled={uploadingPortfolio || items.length >= PORTFOLIO_MAX_ITEMS}
          >
            <ImagePlus size={14} />
            {uploadingPortfolio ? "Mengunggah..." : "Tambah foto"}
          </Button>
        </div>
        <p className="mt-1 text-xs text-espresso-soft">
          Pamerkan hasil karyamu — latte art, interior kafe, biji racikan. Tampil di profil publikmu.
        </p>
        {items.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((it) => (
              <li key={it.id} className="overflow-hidden rounded-xl border border-latte">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image_url} alt={it.caption || "Portofolio"} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handlePortfolioDelete(it.id)}
                    aria-label="Hapus foto"
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <input
                  defaultValue={it.caption ?? ""}
                  maxLength={140}
                  onBlur={(e) => {
                    if (e.target.value !== (it.caption ?? "")) handleCaptionSave(it.id, e.target.value);
                  }}
                  placeholder="Tulis caption…"
                  className="w-full bg-white px-2.5 py-2 text-xs text-[#1c1412] outline-none placeholder:text-gray-400 focus:bg-cream"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CV */}
      <div className="rounded-2xl card-dark p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 font-bold text-espresso">
              <FileText size={15} className="text-caramel" /> CV / Resume (PDF)
            </p>
            <p className="mt-1 text-xs text-espresso-soft">
              {cvUrl ? (
                <>Sudah terunggah — <a href={cvUrl} target="_blank" rel="noopener" className="font-bold text-caramel hover:underline">lihat CV</a></>
              ) : (
                "Belum ada CV. Wajib PDF, maks 5MB — tampil sebagai preview di profil publikmu."
              )}
            </p>
          </div>
          <input
            ref={cvFileRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleCvFile}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => cvFileRef.current?.click()}
            disabled={uploadingCv}
            className="shrink-0"
          >
            <Upload size={14} />
            {uploadingCv ? "Mengunggah..." : cvUrl ? "Ganti CV" : "Unggah CV"}
          </Button>
        </div>
      </div>

      {/* ideas + toggle */}
      <div className="space-y-5 rounded-2xl card-dark p-6">
        <Textarea
          name="ideas_plus"
          label="Ide & nilai plus"
          value={form.ideas_plus}
          maxLength={500}
          onChange={(e) => set("ideas_plus", e.target.value)}
          error={errors.ideas_plus}
        />
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

      <Button onClick={handleSave} full size="lg" disabled={saving}>
        <Save size={16} />
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </div>
  );
}
