"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { jobPostSchema } from "@/lib/validation";
import { EMPLOYMENT_LABELS, EMPLOYMENT_TYPES } from "@/lib/constants";
import { focusFirstError } from "@/lib/focusFirstError";

const TYPE_CLASSES = {
  full_time: "bg-caramel/10 text-caramel",
  part_time: "bg-blue-100 text-blue-700",
  casual: "bg-purple-100 text-purple-700",
};

// Pilihan gaji: kelipatan 500rb (bulanan) / 50rb (per shift).
const RUPIAH = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const MONTH_STEPS = [];
for (let v = 500000; v <= 10000000; v += 500000) MONTH_STEPS.push(v);
const SHIFT_STEPS = [];
for (let v = 50000; v <= 500000; v += 50000) SHIFT_STEPS.push(v);

function salarySteps(period) {
  return period === "shift" ? SHIFT_STEPS : MONTH_STEPS;
}

function composeSalary(min, max, period) {
  if (!min) return "";
  const per = period === "shift" ? "shift" : "bulan";
  if (!max || max === min) return `${RUPIAH(min)}/${per}`;
  const [a, b] = [Number(min), Number(max)].sort((x, y) => x - y);
  return `${RUPIAH(a)} – ${RUPIAH(b)}/${per}`;
}

// Parse teks gaji lama (cth. "80000/shift", "Rp 2.500.000 – 4.000.000/bulan")
// ke pilihan terdekat agar data lama tidak hilang saat edit.
function parseSalary(text) {
  const empty = { min: "", max: "", period: "bulan" };
  if (!text) return empty;
  const period = /shift/i.test(text) ? "shift" : "bulan";
  const steps = salarySteps(period);
  const nums = (text.match(/[\d.]+/g) ?? [])
    .map((s) => parseInt(s.replace(/\./g, ""), 10))
    .filter((n) => !isNaN(n));
  if (!nums.length) return empty;
  const snap = (n) => steps.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), steps[0]);
  if (nums.length === 1) return { min: String(snap(nums[0])), max: "", period };
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return { min: String(snap(lo)), max: String(snap(hi)), period };
}

export default function JobPostForm({ initial = null }) {
  const router = useRouter();
  const toast = useToast();
  const initialTypes = initial?.employment_types?.length
    ? initial.employment_types
    : initial?.employment_type
      ? [initial.employment_type]
      : [];
  const [form, setForm] = useState({
    cafe_id: initial?.cafe_id ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    ...parseSalary(initial?.salary_text ?? ""),
    employment_types: initialTypes,
  });
  const [busy, setBusy] = useState(false);
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    async function loadCafes() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("cafes")
        .select("id, name, location")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      setCafes(data ?? []);
    }
    loadCafes();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const cafe = cafes.find((c) => c.id === form.cafe_id) ?? null;
  const autoTitle = cafe ? `Barista — ${cafe.name}`.slice(0, 120) : "";
  const liveSalary = composeSalary(form.salary_min, form.salary_max, form.salary_period);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.salary_min && form.salary_max && Number(form.salary_max) < Number(form.salary_min)) {
      toast("Gaji maks harus >= gaji min", "error");
      return;
    }
    if (form.employment_types.includes("casual") && form.salary_min && form.salary_period !== "shift") {
      toast("Untuk Casual/Harian gunakan periode Per shift", "error");
      return;
    }
    const withAuto = {
      ...form,
      title: autoTitle,
      location: cafe?.location?.trim() || form.location,
      salary_text: composeSalary(form.salary_min, form.salary_max, form.salary_period),
    };
    delete withAuto.salary_min;
    delete withAuto.salary_max;
    delete withAuto.salary_period;
    const parsed = jobPostSchema.safeParse(withAuto);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      focusFirstError({ [parsed.error.issues[0]?.path?.[0] ?? "title"]: 1 });
      return;
    }
    if (!withAuto.location) {
      toast("Cafe belum punya kota — lengkapi dulu di Cafe Saya", "error");
      return;
    }
    if (!autoTitle || autoTitle.length < 5) {
      toast("Pilih cafe dulu", "error");
      return;
    }
    if (!form.employment_types.length) {
      toast("Pilih minimal 1 tipe pekerjaan", "error");
      return;
    }
    set("location", withAuto.location);
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
        <div className="space-y-1.5">
          <label htmlFor="job-cafe" className="text-sm font-bold text-espresso">
            Cafe <span className="text-red-500">*</span>
          </label>
          <select
            id="job-cafe"
            value={form.cafe_id}
            onChange={(e) => set("cafe_id", e.target.value)}
            className="w-full rounded-xl border border-latte card-dark px-4 py-3 text-sm text-espresso focus:border-caramel focus:outline-none"
          >
            <option value="">— Pilih cafe —</option>
            {cafes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.location ? ` • ${c.location}` : ""}
              </option>
            ))}
          </select>
          {cafes.length === 0 && (
            <p className="text-xs text-espresso-soft">
              Belum ada cafe. <a href="/dashboard/owner/cafes/new" className="font-bold text-caramel hover:underline">Daftarkan cafe dulu →</a>
            </p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-espresso">Tipe pekerjaan yang ditawarkan <span className="text-red-500">*</span></p>
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map((t) => (
              <label key={t.value} className={`px-4 py-2 rounded-full text-sm font-bold border cursor-pointer transition ${form.employment_types.includes(t.value) ? "bg-caramel text-white border-caramel" : "card-dark border-[#e0d5bd] text-espresso-soft hover:border-caramel"}`}>
                <input type="checkbox" className="sr-only" checked={form.employment_types.includes(t.value)} onChange={(e) => {
                  const next = e.target.checked ? [...form.employment_types, t.value] : form.employment_types.filter((v) => v !== t.value);
                  set("employment_types", next);
                  if (e.target.checked && t.value === "casual") {
                    set("salary_period", "shift");
                    set("salary_min", "");
                    set("salary_max", "");
                  }
                }} />
                {t.label}
              </label>
            ))}
          </div>
          {form.employment_types.includes("casual") && <p className="text-xs text-espresso-soft">Untuk Casual/Harian, periode gaji otomatis Per shift.</p>}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-espresso">Gaji (pilih range)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label htmlFor="job-salary-min" className="text-xs font-semibold text-espresso-soft">Minimal</label>
              <select
                id="job-salary-min"
                value={form.salary_min}
                onChange={(e) => set("salary_min", e.target.value)}
                className="w-full rounded-xl border border-latte card-dark px-4 py-3 text-sm text-espresso focus:border-caramel focus:outline-none"
              >
                <option value="">— Min —</option>
                {salarySteps(form.salary_period).map((v) => (
                  <option key={v} value={v}>{RUPIAH(v)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="job-salary-max" className="text-xs font-semibold text-espresso-soft">Maksimal (opsional)</label>
              <select
                id="job-salary-max"
                value={form.salary_max}
                onChange={(e) => set("salary_max", e.target.value)}
                className="w-full rounded-xl border border-latte card-dark px-4 py-3 text-sm text-espresso focus:border-caramel focus:outline-none"
              >
                <option value="">— Maks —</option>
                {salarySteps(form.salary_period).map((v) => (
                  <option key={v} value={v}>{RUPIAH(v)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Periode gaji">
            {[
              { value: "bulan", label: "Per bulan (kelipatan Rp 500rb)" },
              { value: "shift", label: "Per shift (kelipatan Rp 50rb)" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { set("salary_period", p.value); set("salary_min", ""); set("salary_max", ""); }}
                aria-pressed={form.salary_period === p.value}
                className={`px-4 py-2 rounded-full text-xs font-bold border cursor-pointer transition ${form.salary_period === p.value ? "bg-caramel text-white border-caramel" : "card-dark border-[#e0d5bd] text-espresso-soft hover:border-caramel"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {composeSalary(form.salary_min, form.salary_max, form.salary_period) ? (
            <p className="text-xs font-bold text-espresso">Tersimpan sebagai: {composeSalary(form.salary_min, form.salary_max, form.salary_period)}</p>
          ) : (
            <p className="text-xs text-espresso-soft">Opsional — kosongkan bila gaji dinegosiasi langsung.</p>
          )}
        </div>
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
        {initial?.id && (
          <Button type="button" variant="danger" full onClick={async()=>{
            if(!confirm("Hapus lowongan ini? Semua lamaran ikut terhapus.")) return;
            const supabase=createClient();
            const {error}=await supabase.from("job_posts").delete().eq("id",initial.id);
            if(error) toast("Gagal hapus","error"); else { toast("Lowongan dihapus"); router.push("/dashboard/owner"); router.refresh(); }
          }}>Hapus Lowongan</Button>
        )}
      </form>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-espresso-soft">
          <Eye size={13} /> Pratinjau kartu lowongan
        </p>
        <div className="rounded-2xl card-dark p-5 shadow-sm">
          <p className="font-bold leading-snug text-espresso">
            {autoTitle || "Pilih cafe + tipe pekerjaan..."}
          </p>
          {form.employment_types.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.employment_types.map((t) => (
                <Badge key={t} classes={TYPE_CLASSES[t]}>{EMPLOYMENT_LABELS[t]}</Badge>
              ))}
            </div>
          )}
          <p className="mt-3 line-clamp-3 min-h-[3rem] text-sm text-espresso-soft">
            {form.description || "Deskripsi muncul di sini..."}
          </p>
          {liveSalary && (
            <p className="mt-3 rounded-xl bg-cream-dark px-3 py-2 text-sm font-bold text-espresso">
              💰 {liveSalary}
            </p>
          )}
          <p className="mt-3 text-xs font-semibold text-espresso-soft">
            📍 {cafe ? `${cafe.name}${cafe.location ? ` • ${cafe.location}` : ""}` : "Pilih cafe dulu"}
          </p>
        </div>
      </aside>
    </div>
  );
}
