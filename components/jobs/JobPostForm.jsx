"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { jobPostSchema } from "@/lib/validation";
import { CITIES, EMPLOYMENT_LABELS, EMPLOYMENT_TYPES } from "@/lib/constants";

const TYPE_CLASSES = {
  full_time: "bg-caramel/10 text-caramel",
  part_time: "bg-blue-100 text-blue-700",
  casual: "bg-purple-100 text-purple-700",
};

export default function JobPostForm({ initial = null }) {
  const router = useRouter();
  const toast = useToast();
  const initialTypes = initial?.employment_types?.length
    ? initial.employment_types
    : initial?.employment_type
      ? [initial.employment_type]
      : [];
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    salary_text: initial?.salary_text ?? "",
    employment_types: initialTypes,
  });
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = jobPostSchema.safeParse(form);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const payload = { ...parsed.data, employment_type: parsed.data.employment_types[0] };
      if (initial?.id) {
        const { error } = await supabase
          .from("job_posts")
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
        toast("Lowongan diperbarui ✓");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { error } = await supabase.from("job_posts").insert({
          ...payload,
          owner_id: user.id,
        });
        if (error) throw error;
        toast("Lowongan tayang! 🎉");
      }
      router.push("/dashboard/owner");
      router.refresh();
    } catch {
      toast("Gagal menyimpan lowongan", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Judul lowongan"
          placeholder="cth. Barista Shift Pagi"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <div className="space-y-2">
          <p className="text-sm font-bold text-espresso">Tipe pekerjaan yang ditawarkan <span className="text-red-500">*</span></p>
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map((t) => (
              <label key={t.value} className={`px-4 py-2 rounded-full text-sm font-bold border cursor-pointer transition ${form.employment_types.includes(t.value) ? "bg-caramel text-white border-caramel" : "card-dark border-[#2c241f] text-espresso-soft hover:border-caramel"}`}>
                <input type="checkbox" className="sr-only" checked={form.employment_types.includes(t.value)} onChange={(e) => set("employment_types", e.target.checked ? [...form.employment_types, t.value] : form.employment_types.filter((v) => v !== t.value))} />
                {t.label}
              </label>
            ))}
          </div>
          {form.employment_types.includes("casual") && <p className="text-xs text-espresso-soft">Untuk Panggilan, gaji wajib format <code className="rounded bg-cream-dark px-1">&lt;nominal&gt;/shift</code> mis: 80000/shift atau Rp 80.000/shift</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="location"
            label="Lokasi kerja"
            list="job-city-list"
            placeholder="cth. Bandung"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
          <Input
            name="salary_text"
            label="Gaji (teks bebas)"
            placeholder="cth. 80000/shift atau 3.500.000/bulan"
            value={form.salary_text}
            onChange={(e) => set("salary_text", e.target.value)}
          />
        </div>
        <datalist id="job-city-list">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Textarea
          name="description"
          label="Deskripsi singkat"
          rows={6}
          placeholder="Tugas, shift, fasilitas, kualifikasi..."
          value={form.description}
          maxLength={2000}
          onChange={(e) => set("description", e.target.value)}
        />
        <p className="-mt-2 text-right text-[11px] text-espresso-soft">
          {form.description.length}/2000
        </p>
        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Pasang Lowongan"}
        </Button>
      </form>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-espresso-soft">
          <Eye size={13} /> Pratinjau kartu lowongan
        </p>
        <div className="rounded-2xl card-dark p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate font-bold text-espresso">
              {form.title || "Judul lowongan"}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {(form.employment_types.length ? form.employment_types : [""]).map((t) => t && (
                <Badge key={t} classes={TYPE_CLASSES[t]}>{EMPLOYMENT_LABELS[t]}</Badge>
              ))}
            </div>
          </div>
          <p className="mt-3 line-clamp-3 min-h-[3rem] text-sm text-espresso-soft">
            {form.description || "Deskripsi muncul di sini..."}
          </p>
          <p className="mt-3 text-xs font-semibold text-espresso-soft">
            📍 {form.location || "Lokasi"}
          </p>
        </div>
      </aside>
    </div>
  );
}
