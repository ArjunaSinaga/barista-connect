"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LoaderCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { academyProfileSchema } from "@/lib/validation";
import { AVATAR_MIME_TYPES, AVATAR_MAX_BYTES } from "@/lib/constants";
import { compressImage } from "@/lib/image";

// ponytail: edit profil = form yang sama dengan onboarding, prefilled.
export default function AcademyProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("academy_profiles").select("name, description, logo_url").eq("id", user.id).maybeSingle();
        if (data) {
          setName(data.name ?? "");
          setDescription(data.description ?? "");
          setLogoUrl(data.logo_url ?? "");
        }
      } catch { /* diam */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleLogo(e) {
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
        toast("Gambar terlalu besar (maks 5MB)", "error");
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/academy-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      toast("Logo terpasang ✓");
    } catch {
      toast("Gagal unggah logo", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = academyProfileSchema.safeParse({ name, description });
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      const { error } = await supabase.from("academy_profiles").upsert(
        { id: user.id, name: name.trim(), description: description.trim(), logo_url: logoUrl || null },
        { onConflict: "id" }
      );
      if (error) throw error;
      toast("Profil tersimpan");
      router.push("/dashboard/academy");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal menyimpan", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-lg px-4 py-10 text-sm text-espresso-soft">Memuat...</div>;

  return (
    <div className="auth-light">
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-caramel uppercase">
          <GraduationCap size={14} /> Academy
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-espresso">Edit profil akademi</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            name="name"
            type="text"
            label="Nama akademi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="organization"
          />
          <Textarea
            name="description"
            label="Deskripsi singkat"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <div>
            <p className="mb-1.5 text-xs font-bold text-espresso">Logo</p>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo akademi" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efe9d9] text-espresso-soft">
                  <GraduationCap size={20} />
                </span>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-full border border-[#d8cdae] px-4 py-2 text-xs font-bold text-espresso hover:border-coffee disabled:opacity-50"
              >
                {uploading ? "Mengunggah..." : logoUrl ? "Ganti logo" : "Unggah logo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>
          </div>
          <Button type="submit" full size="lg" variant="coffee" disabled={busy}>
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : "Simpan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
