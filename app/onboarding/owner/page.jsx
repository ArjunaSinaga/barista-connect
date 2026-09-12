"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Camera, LoaderCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { ownerProfileSchema } from "@/lib/validation";
import { AVATAR_MIME_TYPES, AVATAR_MAX_BYTES } from "@/lib/constants";
import { compressImage } from "@/lib/image";

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

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
      toast("Foto profil terpasang ✓");
    } catch {
      toast("Gagal unggah foto", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = ownerProfileSchema.safeParse({ business_name: businessName });
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    if (!avatarUrl) {
      toast("Foto profil wajib diunggah", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      const { error } = await supabase.from("owners").upsert(
        {
          id: user.id,
          business_name: businessName.trim(),
          location: "",
          avatar_url: avatarUrl,
        },
        { onConflict: "id" }
      );
      if (error) throw error;
      toast("Profil tersimpan — daftarkan cafe pertamamu");
      router.push("/dashboard/owner/cafes/new");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal menyimpan", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-caramel text-white"><Store size={26} /></span>
        <h1 className="mt-4 text-xl font-extrabold text-espresso">Profil usahamu</h1>
        <p className="mt-1 text-sm text-espresso-soft">Sekali isi. Alamat & kontak diatur per cafe nanti.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl card-dark p-6">
        <div>
          <p className="mb-2 text-sm font-bold text-espresso">Foto profil — WAJIB</p>
          <div className="flex items-center gap-3">
            <Avatar src={avatarUrl} name={businessName || "Owner"} size="lg" />
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
          placeholder="cth. Kopi Senja Group"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <Button type="submit" full size="lg" disabled={busy || uploading}>
          {busy ? "Menyimpan..." : "Lanjut Daftarkan Cafe"}
        </Button>
      </form>
    </div>
  );
}
