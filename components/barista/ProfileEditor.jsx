"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Save, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SKILL_PRESETS, AVATAR_MIME_TYPES, AVATAR_MAX_BYTES } from "@/lib/constants";
import { compressImage, formatBytes } from "@/lib/image";
import { profileUpdateSchema } from "@/lib/validation";

export default function ProfileEditor({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    full_name: initial.full_name ?? "",
    age: initial.age ?? "",
    location_place: initial.location_place ?? "",
    years_of_experience: initial.years_of_experience ?? 0,
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const completeness = [
    Boolean(photoUrl),
    form.full_name.length > 2,
    Boolean(form.age),
    Boolean(form.location_place),
    form.skills.length > 0,
    form.certificates.length > 0 || form.ideas_plus.length > 20,
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
      toast("Gambar terlalu besar (maks 2MB)", "error");
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

  async function handleSave() {
    const parsed = profileUpdateSchema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      toast("Periksa kembali isian kamu", "error");
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
      const { error } = await supabase
        .from("barista_profiles")
        .update({ ...parsed.data, profile_picture_url: photoUrl })
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
      <div className="rounded-2xl border border-latte bg-white p-5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-espresso">Kelengkapan profil</span>
          <span className={completeness >= 6 ? "text-matcha" : "text-caramel"}>
            {Math.round((completeness / 6) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-latte/60">
          <div
            className={`h-full rounded-full transition-all ${completeness >= 6 ? "bg-matcha" : "bg-caramel"}`}
            style={{ width: `${(completeness / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* photo */}
      <div className="flex flex-col items-center rounded-2xl border border-latte bg-white p-6">
        <div className="relative">
          <Avatar src={photoUrl} name={form.full_name} size="xl" />
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-espresso/50 text-white">
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
      <div className="space-y-4 rounded-2xl border border-latte bg-white p-6">
        <p className="font-bold text-espresso">Data Diri</p>
        <Input
          name="full_name"
          label="Nama lengkap"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          error={errors.full_name}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="age"
            type="number"
            label="Umur"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            error={errors.age}
          />
          <Input
            name="years_of_experience"
            type="number"
            min={0}
            max={50}
            label="Pengalaman (tahun)"
            value={form.years_of_experience}
            onChange={(e) => set("years_of_experience", e.target.value)}
            error={errors.years_of_experience}
          />
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
      <div className="rounded-2xl border border-latte bg-white p-6">
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
              {s} <Trash2 size={11} />
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
          className="mt-3 w-full rounded-xl border border-latte bg-white px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
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
                + {preset}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* certificates */}
      <div className="rounded-2xl border border-latte bg-white p-6">
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
            className="w-full rounded-xl border border-latte bg-white px-4 py-2.5 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
          />
          <Button variant="secondary" onClick={addCert}>
            Tambah
          </Button>
        </div>
      </div>

      {/* ideas + toggle */}
      <div className="space-y-5 rounded-2xl border border-latte bg-white p-6">
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
