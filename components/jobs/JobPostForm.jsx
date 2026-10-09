"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
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

const STEPS = ["Basics", "Role & Pay", "Schedule", "Preview"];
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DRAFT_KEY = "postjob-draft";

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
  return { min: String(snap(Math.min(...nums))), max: String(snap(Math.max(...nums))), period };
}

// Seksi terstruktur digabung ke description (tidak ada kolomnya di DB):
// "Tanggung Jawab:\n- a\n\nPersyaratan:\n- x\n\nJadwal: ...". Parse kembali saat edit.
function splitSections(desc) {
  const out = { base: desc ?? "", resp: [], req: [], sched: "" };
  const schedIdx = out.base.lastIndexOf("\nJadwal:");
  if (schedIdx >= 0) {
    out.sched = out.base.slice(schedIdx + "\nJadwal:".length).trim();
    out.base = out.base.slice(0, schedIdx);
  }
  for (const [key, marker] of [["resp", "Tanggung Jawab:"], ["req", "Persyaratan:"]]) {
    const i = out.base.lastIndexOf(`\n${marker}`);
    if (i >= 0) {
      const tail = out.base.slice(i + marker.length + 1);
      const nextMarker = tail.search(/\n(Tanggung Jawab|Persyaratan):/);
      const section = nextMarker >= 0 ? tail.slice(0, nextMarker) : tail;
      out[key] = section.split("\n").map((l) => l.replace(/^-\s*/, "").trim()).filter(Boolean);
      out.base = (out.base.slice(0, i) + (nextMarker >= 0 ? tail.slice(nextMarker) : "")).trim();
    }
  }
  out.base = out.base.trim();
  return out;
}

function composeDescription(base, resp, req, schedLine) {
  let d = (base ?? "").trim();
  if (resp.length) d += `\n\nTanggung Jawab:\n${resp.map((r) => `- ${r}`).join("\n")}`;
  if (req.length) d += `\n\nPersyaratan:\n${req.map((r) => `- ${r}`).join("\n")}`;
  if (schedLine) d += `\n\nJadwal: ${schedLine}`;
  return d;
}

function schedLine(days, shifts, start, end, openFilled) {
  const parts = [];
  if (days.length) parts.push(days.join(", "));
  const valid = shifts.filter((s) => s.start && s.end && s.start < s.end);
  if (valid.length) parts.push(`(${valid.map((s) => `${s.start}–${s.end}`).join(", ")})`);
  if (start) parts.push(`Mulai: ${start}`);
  if (end) parts.push(`Selesai: ${end}`);
  if (openFilled) parts.push("Buka sampai terisi: Ya");
  return parts.join(" ");
}

// Wizard pasang lowongan 4 langkah (POST-00..40). Langkah Payment tidak ada:
// tidak ada ledger kredit di backend — publikasi langsung aktif tanpa biaya.
// Kategori & jumlah bukaan tidak ada kolomnya -> tidak dibuat (tidak dikarang).
export default function JobPostForm({ initial = null }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!initial?.id;

  const initSections = splitSections(initial?.description ?? "");
  const initialTypes = initial?.employment_types?.length
    ? initial.employment_types
    : initial?.employment_type
      ? [initial.employment_type]
      : [];
  const initDays = DAYS.filter((d) => (initSections.sched ?? "").includes(d));

  function loadDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* abaikan */ }
    return null;
  }

  const [step, setStep] = useState(0);
  // Draft browser + hari dari deskripsi lama: lazy init agar tanpa setState di effect.
  const [draft] = useState(() => (isEdit ? null : loadDraft()));
  const d0 = draft ?? {};
  const [form, setForm] = useState({
    cafe_id: initial?.cafe_id ?? d0.cafe_id ?? "",
    location: initial?.location ?? d0.location ?? "",
    emp_type: initialTypes[0] ?? d0.emp_type ?? "",
    description: initSections.base || d0.description || "",
    resp: initSections.resp.length ? initSections.resp : (d0.resp ?? []),
    req: initSections.req.length ? initSections.req : (d0.req ?? []),
    salary_min: d0.salary_min ?? parseSalary(initial?.salary_text ?? "").min,
    salary_max: d0.salary_max ?? parseSalary(initial?.salary_text ?? "").max,
    salary_period: d0.salary_period ?? parseSalary(initial?.salary_text ?? "").period,
    days: initDays.length ? initDays : (d0.days ?? []),
    shifts: d0.shifts ?? [{ start: "", end: "" }],
    start_date: d0.start_date ?? "",
    end_date: d0.end_date ?? "",
    open_filled: d0.open_filled ?? false,
  });
  const [respInput, setRespInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [cafes, setCafes] = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    async function loadCafes() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: scopeIds } = await supabase.rpc("my_scope_cafes");
      const ids = (scopeIds ?? []).filter(Boolean);
      const { data } = ids.length
        ? await supabase.from("cafes").select("id, name, location, owner_id").in("id", ids).eq("is_active", true).order("created_at", { ascending: true })
        : await supabase.from("cafes").select("id, name, location, owner_id").eq("owner_id", user.id).eq("is_active", true).order("created_at", { ascending: true });
      setCafes(data ?? []);
    }
    loadCafes();
  }, []);

  // Draft browser (baru saja) — DB tidak punya status DRAFT.
  useEffect(() => {
    if (isEdit) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* abaikan */ }
  }, [form, isEdit]);

  const kafe = cafes.find((c) => c.id === form.cafe_id) ?? null;
  const autoTitle = kafe ? `Barista — ${kafe.name}`.slice(0, 120) : "";
  const liveSalary = composeSalary(form.salary_min, form.salary_max, form.salary_period);
  const line = schedLine(form.days, form.shifts, form.start_date, form.end_date, form.open_filled);
  const dirty = form.cafe_id || form.description || form.emp_type || form.resp.length || form.req.length;

  function validStep(s) {
    if (s === 0) {
      if (!form.cafe_id) return "Pilih outlet dulu";
      if (!form.emp_type) return "Pilih 1 tipe pekerjaan";
      return null;
    }
    if (s === 1) {
      if (form.description.trim().length < 20) return "Deskripsi minimal 20 karakter";
      if (!form.resp.length) return "Tambahkan minimal 1 tanggung jawab";
      if (!form.req.length) return "Tambahkan minimal 1 persyaratan";
      if (form.salary_min && form.salary_max && Number(form.salary_max) < Number(form.salary_min)) return "Gaji maks harus >= gaji min";
      if (form.emp_type === "casual" && form.salary_min && form.salary_period !== "shift") return "Untuk Harian gunakan periode Per shift";
      return null;
    }
    if (s === 2) {
      if (!form.days.length) return "Pilih minimal 1 hari kerja";
      const valid = form.shifts.filter((x) => x.start && x.end);
      if (!valid.length) return "Isi minimal 1 shift (jam mulai & selesai)";
      if (valid.some((x) => x.start >= x.end)) return "Jam selesai harus setelah jam mulai";
      const today = new Date().toISOString().slice(0, 10);
      if (!form.start_date) return "Isi tanggal mulai";
      if (!isEdit && form.start_date < today) return "Tanggal mulai tidak boleh masa lalu";
      if (form.end_date && form.end_date <= form.start_date) return "Tanggal selesai harus setelah tanggal mulai";
      return null;
    }
    return null;
  }

  function next() {
    const err = validStep(step);
    if (err) { toast(err, "error"); return; }
    setStep((s) => Math.min(s + 1, 3));
  }

  function cancel() {
    if (dirty && !confirm("Tinggalkan wizard? Data yang belum diterbitkan akan hilang dari halaman ini (draft browser tetap tersimpan).")) return;
    router.push("/dashboard/owner?tab=active");
  }

  async function publish() {
    for (const s of [0, 1, 2]) {
      const err = validStep(s);
      if (err) { toast(`Langkah ${s + 1}: ${err}`, "error"); setStep(s); return; }
    }
    if (!kafe?.location?.trim() && !form.location) {
      toast("Kafe belum punya kota — lengkapi dulu di Kafe Saya", "error");
      return;
    }
    const withAuto = {
      cafe_id: form.cafe_id,
      title: autoTitle,
      description: composeDescription(form.description, form.resp, form.req, line),
      location: kafe?.location?.trim() || form.location,
      salary_text: liveSalary,
      employment_types: [form.emp_type],
      employment_type: form.emp_type,
    };
    if (!withAuto.title || withAuto.title.length < 5) {
      toast("Pilih outlet dulu", "error");
      return;
    }
    if (withAuto.description.length > 2000) {
      toast("Total deskripsi + daftar + jadwal melebihi 2000 karakter — persingkat dulu", "error");
      return;
    }
    const parsed = jobPostSchema.safeParse(withAuto);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const payload = { ...parsed.data, employment_type: parsed.data.employment_types[0] };
      if (isEdit) {
        const { error } = await supabase.from("job_posts").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast("Lowongan diperbarui ✓");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("job_posts").insert({
          ...payload, owner_id: kafe?.owner_id ?? user.id, is_active: true,
        });
        if (error) throw error;
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* abaikan */ }
        toast("Lowongan tayang! 🎉");
      }
      router.push("/dashboard/owner?tab=active");
      router.refresh();
    } catch {
      toast("Gagal menyimpan lowongan", "error");
    } finally {
      setBusy(false);
    }
  }

  const sec = "rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-xl font-extrabold text-espresso">{isEdit ? "Edit Lowongan" : "Pasang Lowongan"}</h1>

      {/* Stepper */}
      <div className="mt-3 flex items-center rounded-2xl bg-white px-4 py-4 shadow-sm">
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

      <div className="mt-4">
        {step === 0 && (
          <section className={sec} aria-label="Job basics">
            <h2 className="text-base font-extrabold text-espresso">1. Job Basics</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="job-kafe" className="text-sm font-bold text-espresso">Outlet / Lokasi <span className="text-red-500">*</span></label>
                <select id="job-kafe" value={form.cafe_id} onChange={(e) => set("cafe_id", e.target.value)} className="mt-1 w-full rounded-xl border border-latte bg-white px-4 py-3 text-sm text-espresso focus:border-caramel focus:outline-none">
                  <option value="">— Pilih outlet —</option>
                  {cafes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.location ? ` • ${c.location}` : ""}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-espresso-soft">
                  {cafes.length === 0 ? <>Belum ada outlet. <Link href="/dashboard/owner/cafes/new" className="font-bold text-caramel hover:underline">Daftarkan outlet dulu →</Link></> : <Link href="/dashboard/owner?tab=cafes" className="font-bold text-caramel hover:underline">Kelola outlet →</Link>}
                  {" "}Lokasi & alamat diwarisi dari profil outlet.
                </p>
              </div>
              <div className="rounded-xl bg-[#faf7ef] px-4 py-3 text-sm">
                <p className="text-xs text-espresso-soft">Judul otomatis</p>
                <p className="font-extrabold text-espresso">{autoTitle || "Pilih outlet dulu"}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-espresso">Tipe pekerjaan <span className="text-red-500">*</span></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMPLOYMENT_TYPES.map((t) => (
                    <label key={t.value} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${form.emp_type === t.value ? "border-coffee bg-coffee text-white" : "border-[#e0d5bd] text-espresso-soft"}`}>
                      <input type="radio" name="emp-type" className="sr-only" checked={form.emp_type === t.value} onChange={() => {
                        set("emp_type", t.value);
                        if (t.value === "casual") { set("salary_period", "shift"); set("salary_min", ""); set("salary_max", ""); }
                      }} />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button type="button" onClick={cancel} className="text-sm font-bold text-espresso-soft hover:text-espresso">Batal</button>
              <Button onClick={next}>Simpan & Lanjut <ArrowRight size={15} /></Button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className={sec} aria-label="Role dan gaji">
            <h2 className="text-base font-extrabold text-espresso">2. Role & Pay</h2>
            <div className="mt-3 space-y-4">
              <div>
                <Textarea name="description" label="Deskripsi pekerjaan" rows={4} placeholder="Ceritakan peran ini..." value={form.description} maxLength={2000} onChange={(e) => set("description", e.target.value)} />
                <p className="mt-1 text-right text-[11px] text-espresso-soft tabular-nums">{form.description.length}/2000</p>
              </div>
              <div>
                <p className="text-sm font-bold text-espresso">Tanggung jawab utama <span className="text-red-500">*</span></p>
                <ul className="mt-2 space-y-1.5">
                  {form.resp.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-xl bg-[#faf7ef] px-3.5 py-2 text-sm">
                      <span className="flex-1">{r}</span>
                      <button type="button" onClick={() => set("resp", form.resp.filter((_, j) => j !== i))} aria-label="Hapus" className="text-espresso-soft hover:text-red-500"><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <input value={respInput} onChange={(e) => setRespInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (respInput.trim()) { set("resp", [...form.resp, respInput.trim()]); setRespInput(""); } } }} placeholder="cth. Menyajikan espresso standar" className="w-full rounded-xl border border-[#e0d5bd] bg-white px-4 py-2.5 text-sm outline-none" />
                  <Button variant="secondary" onClick={() => { if (respInput.trim()) { set("resp", [...form.resp, respInput.trim()]); setRespInput(""); } }}><Plus size={15} /></Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-espresso">Persyaratan <span className="text-red-500">*</span></p>
                <ul className="mt-2 space-y-1.5">
                  {form.req.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-xl bg-[#faf7ef] px-3.5 py-2 text-sm">
                      <span className="flex-1">{r}</span>
                      <button type="button" onClick={() => set("req", form.req.filter((_, j) => j !== i))} aria-label="Hapus" className="text-espresso-soft hover:text-red-500"><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <input value={reqInput} onChange={(e) => setReqInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (reqInput.trim()) { set("req", [...form.req, reqInput.trim()]); setReqInput(""); } } }} placeholder="cth. Pengalaman min 1 tahun" className="w-full rounded-xl border border-[#e0d5bd] bg-white px-4 py-2.5 text-sm outline-none" />
                  <Button variant="secondary" onClick={() => { if (reqInput.trim()) { set("req", [...form.req, reqInput.trim()]); setReqInput(""); } }}><Plus size={15} /></Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-espresso">Gaji</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="job-salary-min" className="text-xs font-semibold text-espresso-soft">Minimal</label>
                    <select id="job-salary-min" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)} className="mt-1 w-full rounded-xl border border-latte bg-white px-4 py-3 text-sm focus:border-caramel focus:outline-none">
                      <option value="">— Min —</option>
                      {salarySteps(form.salary_period).map((v) => <option key={v} value={v}>{RUPIAH(v)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="job-salary-max" className="text-xs font-semibold text-espresso-soft">Maksimal (opsional)</label>
                    <select id="job-salary-max" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)} className="mt-1 w-full rounded-xl border border-latte bg-white px-4 py-3 text-sm focus:border-caramel focus:outline-none">
                      <option value="">— Maks —</option>
                      {salarySteps(form.salary_period).map((v) => <option key={v} value={v}>{RUPIAH(v)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {[["bulan", "Per bulan"], ["shift", "Per shift"]].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => { set("salary_period", v); set("salary_min", ""); set("salary_max", ""); }} aria-pressed={form.salary_period === v} className={`rounded-full border px-4 py-2 text-xs font-bold ${form.salary_period === v ? "border-coffee bg-coffee text-white" : "border-[#e0d5bd] text-espresso-soft"}`}>{l}</button>
                  ))}
                </div>
                {liveSalary && <p className="mt-1.5 text-xs font-bold text-espresso">Tampil sebagai: {liveSalary}</p>}
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(0)}><ArrowLeft size={15} /> Kembali</Button>
              <Button onClick={next}>Simpan & Lanjut <ArrowRight size={15} /></Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className={sec} aria-label="Jadwal">
            <h2 className="text-base font-extrabold text-espresso">3. Schedule</h2>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-sm font-bold text-espresso">Hari kerja <span className="text-red-500">*</span></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <label key={d} className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold ${form.days.includes(d) ? "border-coffee bg-coffee text-white" : "border-[#e0d5bd] text-espresso-soft"}`}>
                      <input type="checkbox" className="sr-only" checked={form.days.includes(d)} onChange={(e) => set("days", e.target.checked ? [...form.days, d] : form.days.filter((x) => x !== d))} />{d.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-espresso">Shift <span className="text-red-500">*</span></p>
                <div className="mt-2 space-y-2">
                  {form.shifts.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-espresso-soft">Shift {i + 1}</span>
                      <input type="time" value={s.start} onChange={(e) => set("shifts", form.shifts.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className="rounded-xl border border-[#e0d5bd] bg-white px-3 py-2 text-sm" aria-label={`Shift ${i + 1} mulai`} />
                      <span className="text-espresso-soft">–</span>
                      <input type="time" value={s.end} onChange={(e) => set("shifts", form.shifts.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className="rounded-xl border border-[#e0d5bd] bg-white px-3 py-2 text-sm" aria-label={`Shift ${i + 1} selesai`} />
                      {form.shifts.length > 1 && (
                        <button type="button" onClick={() => set("shifts", form.shifts.filter((_, j) => j !== i))} aria-label="Hapus shift" className="text-espresso-soft hover:text-red-500"><Trash2 size={15} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => set("shifts", [...form.shifts, { start: "", end: "" }])} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-link hover:underline">
                  <Plus size={13} /> Tambah shift
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="start_date" type="date" label="Tanggal mulai" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
                <Input name="end_date" type="date" label="Tanggal selesai (opsional)" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-espresso-soft">
                <input type="checkbox" checked={form.open_filled} onChange={(e) => set("open_filled", e.target.checked)} className="h-4 w-4 accent-[#4a2f1d]" />
                Tetap buka sampai kebutuhan terpenuhi
              </label>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft size={15} /> Kembali</Button>
              <Button onClick={next}>Simpan & Lanjut <ArrowRight size={15} /></Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className={sec} aria-label="Preview">
            <h2 className="text-base font-extrabold text-espresso">4. Preview</h2>
            <div className="mt-3 rounded-2xl border border-[#e8e0cf] p-5">
              <p className="text-lg font-extrabold text-espresso">{autoTitle || "-"}</p>
              <p className="mt-0.5 text-xs text-espresso-soft">{kafe?.name}{kafe?.location ? ` • ${kafe.location}` : ""}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge classes={TYPE_CLASSES[form.emp_type]}>{EMPLOYMENT_LABELS[form.emp_type] ?? form.emp_type}</Badge>
              </div>
              {liveSalary && <p className="mt-2 text-sm font-extrabold text-espresso">{liveSalary}</p>}
              <p className="mt-2 text-sm leading-6 whitespace-pre-line text-espresso-soft">{form.description}</p>
              {form.resp.length > 0 && (
                <div className="mt-2 text-sm"><p className="font-extrabold text-espresso">Tanggung Jawab:</p>
                <ul className="list-disc pl-5 text-espresso-soft">{form.resp.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
              )}
              {form.req.length > 0 && (
                <div className="mt-2 text-sm"><p className="font-extrabold text-espresso">Persyaratan:</p>
                <ul className="list-disc pl-5 text-espresso-soft">{form.req.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
              )}
              {line && <p className="mt-2 text-sm text-espresso-soft"><span className="font-extrabold text-espresso">Jadwal:</span> {line}</p>}
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft size={15} /> Kembali</Button>
              <Button onClick={publish} disabled={busy}>{busy ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Terbitkan Lowongan"}</Button>
            </div>
            {isEdit && initial?.id && (
              <DeleteJob jobId={initial.id} />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function DeleteJob({ jobId }) {
  const router = useRouter();
  const toast = useToast();
  return (
    <Button type="button" variant="danger" full className="mt-3" onClick={async () => {
      if (!confirm("Hapus lowongan ini? Semua lamaran ikut terhapus.")) return;
      const supabase = createClient();
      const { error } = await supabase.from("job_posts").delete().eq("id", jobId);
      if (error) toast("Gagal hapus", "error");
      else { toast("Lowongan dihapus"); router.push("/dashboard/owner"); router.refresh(); }
    }}>Hapus Lowongan</Button>
  );
}
