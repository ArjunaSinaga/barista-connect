"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, Camera, LoaderCircle } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { ownerOnboardingSchema } from "@/lib/validation";
import { CITIES, AVATAR_MIME_TYPES, AVATAR_MAX_BYTES } from "@/lib/constants";
import { compressImage } from "@/lib/image";

export default function BusinessForm({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    business_name: initial?.business_name ?? "",
    location: initial?.location ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      toast("Format harus JPG, PNG, atau WebP", "error");
      return;
    }
    setUploading(true);
    try {
      const blob = await compressImage(file);
      if (blob.size > AVATAR_MAX_BYTES) {
        toast("Gambar terlalu besar (maks 2MB)", "error");
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/owner-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast("Foto terpasang — jangan lupa simpan");
    } catch {
      toast("Gagal unggah foto", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!avatarUrl) {
      toast("Foto profil wajib diunggah", "error");
      return;
    }
    const parsed = ownerOnboardingSchema.safeParse(form);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("owners")
        .update({ ...parsed.data, avatar_url: avatarUrl })
        .eq("id", user.id);
      if (error) throw error;
      toast("Data bisnis tersimpan ✓");
      router.refresh();
    } catch {
      toast("Gagal menyimpan", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-caramel text-white">
          <Store size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-espresso">
          Data Bisnis
        </h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Nama ini yang dilihat barista pada lowongan kamu.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl card-dark p-6"
      >
        <div>
          <p className="mb-2 text-sm font-bold text-espresso">
            Foto profil <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-3">
            <Avatar src={avatarUrl} name={form.business_name || "Owner"} size="lg" />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} />
            <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? " Mengunggah..." : avatarUrl ? " Ganti foto" : " Unggah foto"}
            </Button>
          </div>
        </div>
        <Input
          name="business_name"
          label="Nama usaha"
          value={form.business_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, business_name: e.target.value }))
          }
        />
        <Input
          name="location"
          label="Lokasi utama"
          list="biz-city-list"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <datalist id="biz-city-list">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Button type="submit" full size="lg" disabled={busy}>
          <Save size={16} /> {busy ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </div>
  );
}
