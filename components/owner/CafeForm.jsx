"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Save, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_MIME_TYPES, AVATAR_MAX_BYTES, CITIES } from "@/lib/constants";
import { compressImage } from "@/lib/image";

const MAX_PHOTOS = 5;

export default function CafeForm({ initial = null }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    whatsapp: initial?.whatsapp ?? "",
  });
  const [photos, setPhotos] = useState(initial?.photo_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleFiles(e) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      toast(`Maksimal ${MAX_PHOTOS} foto`, "error");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const urls = [];
      for (const file of files) {
        if (!AVATAR_MIME_TYPES.includes(file.type)) {
          toast(`${file.name}: format harus JPG/PNG/WebP`, "error");
          continue;
        }
        const blob = await compressImage(file);
        if (blob.size > AVATAR_MAX_BYTES) {
          toast(`${file.name}: terlalu besar (maks 2MB)`, "error");
          continue;
        }
        const path = `${user.id}/cafe-${Date.now()}-${Math.floor(Math.random() * 1e6)}.jpg`;
        const { error } = await supabase.storage.from("cafes").upload(path, blob, {
          contentType: "image/jpeg",
        });
        if (error) throw error;
        const { data } = supabase.storage.from("cafes").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      if (urls.length) {
        setPhotos((p) => [...p, ...urls].slice(0, MAX_PHOTOS));
        toast("Foto ditambahkan — jangan lupa simpan");
      }
    } catch {
      toast("Gagal unggah foto", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast("Nama cafe minimal 2 karakter", "error");
      return;
    }
    if (!photos.length) {
      toast("Wajib minimal 1 foto cafe", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        address: form.address.trim(),
        whatsapp: form.whatsapp.replace(/[\s-]/g, ""),
        photo_urls: photos,
      };
      if (initial?.id) {
        const { error } = await supabase.from("cafes").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast("Cafe diperbarui ✓");
      } else {
        const { error } = await supabase.from("cafes").insert({ ...payload, owner_id: user.id });
        if (error) throw error;
        toast("Cafe didaftarkan! 🎉");
      }
      router.push("/dashboard/owner/cafes");
      router.refresh();
    } catch {
      toast("Gagal menyimpan cafe", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm(`Hapus cafe "${initial.name}"? SEMUA lowongan di cafe ini ikut terhapus permanen.`)) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("cafes").delete().eq("id", initial.id);
      if (error) throw error;
      toast("Cafe dihapus");
      router.push("/dashboard/owner/cafes");
      router.refresh();
    } catch {
      toast("Gagal menghapus cafe", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">
        {initial ? "Edit Cafe" : "Daftarkan Cafe"}
      </h1>
      <p className="mt-1 mb-6 text-sm text-espresso-soft">
        Satu akun bisa punya banyak cafe. Lowongan dipasang per cafe.
      </p>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl card-dark p-6">
        <Input
          name="name"
          label="Nama cafe"
          placeholder="cth. Kopi Senja Tebet"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="location"
            label="Kota"
            list="cafe-city-list"
            placeholder="cth. Jakarta Selatan"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
          <Input
            name="whatsapp"
            label="WhatsApp cafe (opsional)"
            placeholder="cth. 0812..."
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </div>
        <datalist id="cafe-city-list">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Textarea
          name="address"
          label="Alamat lengkap (opsional)"
          rows={2}
          placeholder="Jl. ..."
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />

        <div>
          <p className="text-sm font-bold text-espresso">
            Foto cafe <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-semibold text-espresso-soft">min 1, maks {MAX_PHOTOS}</span>
          </p>
          {photos.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {photos.map((url) => (
                <div key={url} className="relative overflow-hidden rounded-xl border border-latte">
                  <img src={url} alt="Foto cafe" className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((x) => x !== url))}
                    aria-label="Hapus foto"
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFiles} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading || photos.length >= MAX_PHOTOS}
            onClick={() => fileRef.current?.click()}
            className="mt-2"
          >
            {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Camera size={14} />}
            {uploading ? " Mengunggah..." : " Tambah foto"}
          </Button>
        </div>

        <Button type="submit" full size="lg" disabled={busy || uploading}>
          <Save size={16} /> {busy ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Daftarkan Cafe"}
        </Button>
        {initial?.id && (
          <Button type="button" variant="danger" full onClick={handleDelete}>
            <Trash2 size={16} /> Hapus Cafe (+ semua lowongannya)
          </Button>
        )}
      </form>
    </div>
  );
}
