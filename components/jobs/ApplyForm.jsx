"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, FileText, Trash2, Upload, ArrowRight, LoaderCircle } from "lucide-react";
import { Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { EMPLOYMENT_LABELS, PORTFOLIO_MIME_TYPES, PORTFOLIO_MAX_BYTES } from "@/lib/constants";
import { compressImage } from "@/lib/image";
import { friendlyUpload } from "@/lib/errors";

// UI-07 form lamaran penuh (APPFORM-01..14+): cover note + profil/CV + screening generik
// + portofolio opsional + persetujuan. Screening & portofolio disimpan sebagai teks
// terstruktur di kolom message (tidak ada kolom/tabel screening per-job di DB).
export default function ApplyForm({ jobId, jobTypes, profile, portfolio, existingApp, jobActive }) {
  const toast = useToast();
  const cvRef = useRef(null);
  const pfRef = useRef(null);
  const draftKey = `apply-draft-${jobId}`;

  function loadDraft() {
    try {
      const raw = sessionStorage.getItem(`apply-draft-${jobId}`);
      if (raw && !existingApp) return JSON.parse(raw);
    } catch { /* abaikan */ }
    return null;
  }
  const [draft] = useState(loadDraft);
  const d0 = draft ?? {};

  const [cover, setCover] = useState(d0.cover ?? "");
  const [message, setMessage] = useState(d0.message ?? "");
  const [types, setTypes] = useState(d0.types ?? (jobTypes?.length === 1 ? [...jobTypes] : []));
  const [exp, setExp] = useState(d0.exp ?? "");
  const [avail, setAvail] = useState(d0.avail ?? "Segera");
  const [shiftOk, setShiftOk] = useState(d0.shiftOk ?? "");
  const [cvFile, setCvFile] = useState(null);
  const [pfPicked, setPfPicked] = useState([]);
  const [pfNew, setPfNew] = useState([]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(existingApp ? { id: existingApp.id } : null);

  // Draft: cover/pesan/jawaban/tipe bertahan bila halaman ditinggal (APPFORM-01).
  useEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ cover, message, types, exp, avail, shiftOk }));
    } catch { /* abaikan */ }
  }, [cover, message, types, exp, avail, shiftOk, done, draftKey]);

  if (done) {
    const code = `APP-${String(done.id).slice(0, 8).toUpperCase()}`;
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckCircle2 size={26} />
        </span>
        <h2 className="mt-3 text-lg font-extrabold text-espresso">Lamaran Berhasil Dikirim!</h2>
        <p className="mt-1 text-sm text-espresso-soft">
          Nomor tracking <span className="font-bold text-espresso">{code}</span> — pantau statusnya di halaman Lamaran Saya.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/dashboard/barista/applications" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-coffee px-6 text-sm font-bold text-white hover:bg-[#2e2015]">
            Lihat Status Lamaran
          </Link>
          <Link href="/jobs" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#e0d5bd] bg-white px-6 text-sm font-bold text-espresso hover:border-coffee">
            Kembali ke Lowongan
          </Link>
        </div>
      </section>
    );
  }

  if (!jobActive) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-base font-extrabold text-red-700">Lowongan ini sudah ditutup</h2>
        <p className="mt-1 text-sm text-espresso-soft">Lamaran tidak lagi diterima.</p>
        <Link href="/jobs" className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-sm font-bold text-white">
          Lihat Lowongan Serupa
        </Link>
      </section>
    );
  }

  function pickCv(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { toast("CV harus PDF", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("CV maksimal 5MB", "error"); return; }
    setCvFile(file);
  }

  function togglePf(id) {
    setPfPicked((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : arr.length >= 3 ? arr : [...arr, id]));
  }

  async function submit() {
    const e = {};
    if (cover.trim().length < 20) e.cover = "Cover note minimal 20 karakter";
    if (cover.length > 500) e.cover = "Cover note maksimal 500 karakter";
    if (types.length === 0) e.types = "Pilih minimal 1 tipe pekerjaan";
    if (!exp) e.exp = "Jawab pengalaman kerjamu";
    if (!shiftOk) e.shiftOk = "Jawab kesediaan shift";
    let cvUrl = profile?.cv_url || null;
    if (cvFile) {
      if (cvFile.type !== "application/pdf") e.cv = "CV harus PDF";
      else if (cvFile.size > 5 * 1024 * 1024) e.cv = "CV maksimal 5MB";
    }
    if (!cvUrl && !cvFile) e.cv = "CV wajib — pakai CV profil atau upload PDF";
    if (!consent) e.consent = "Centang persetujuan dulu";
    if (Object.keys(e).length) { setErrors(e); toast(Object.values(e)[0], "error"); return; }
    setErrors({});
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");

      if (cvFile) {
        const path = `${user.id}/${Date.now()}-${cvFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("cvs").upload(path, cvFile, { contentType: "application/pdf", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("cvs").getPublicUrl(path);
        cvUrl = pub.publicUrl;
        await supabase.from("barista_profiles").update({ cv_url: cvUrl }).eq("id", user.id);
      }

      // Portofolio baru: upload + catat (opsional, tak blokir bila kosong).
      const newUrls = [];
      for (const f of pfNew) {
        const blob = await compressImage(f);
        const path = `${user.id}/portfolio-${Date.now()}-${Math.floor(Math.random() * 1e4)}.jpg`;
        const { error: upErr } = await supabase.storage.from("portfolio").upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
        await supabase.from("barista_portfolio").insert({ barista_id: user.id, image_url: pub.publicUrl });
        newUrls.push(pub.publicUrl);
      }
      const pickedUrls = portfolio.filter((p) => pfPicked.includes(p.id)).map((p) => p.image_url);

      const screening = `Pengalaman: ${exp}; Ketersediaan: ${avail}; Bersedia shift: ${shiftOk}`;
      const pfLine = [...pickedUrls, ...newUrls].length ? `Portofolio: ${[...pickedUrls, ...newUrls].join(", ")}` : "";
      const fullMessage = [message.trim(), `Screening — ${screening}`, pfLine].filter(Boolean).join("\n").slice(0, 2000);

      const filtered = types.filter((t) => jobTypes.includes(t));
      const { data: app, error } = await supabase.from("applications").insert({
        job_post_id: jobId,
        barista_id: user.id,
        message: fullMessage || null,
        cover_letter: cover.trim(),
        cv_url: cvUrl,
        employment_types: filtered,
      }).select("id").single();
      if (error) {
        if (error.code === "23505") { toast("Kamu sudah pernah melamar lowongan ini"); return; }
        throw error;
      }
      try { sessionStorage.removeItem(draftKey); } catch { /* abaikan */ }
      setDone({ id: app.id });
    } catch (err) {
      toast(friendlyUpload(err.message || err), "error");
    } finally {
      setBusy(false);
    }
  }

  const sec = "rounded-2xl border border-[#e8e0cf] bg-white p-5";
  const num = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coffee text-xs font-extrabold text-white";

  return (
    <div className="min-w-0 space-y-4">
      {/* 1. Cover Note */}
      <section className={sec} aria-label="Cover note">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><span className={num}>1</span> Cover Note</h2>
        <Textarea
          name="cover"
          label=""
          placeholder="Ceritakan singkat mengapa Anda cocok untuk posisi ini. Tulis motivasi, pengalaman relevan, dan hal unik tentang Anda."
          value={cover}
          maxLength={500}
          onChange={(e) => setCover(e.target.value)}
          error={errors.cover}
        />
        <p className="mt-1 text-right text-[11px] text-espresso-soft tabular-nums">{cover.length}/500 (min 20)</p>
      </section>

      {/* 2. Profil & CV */}
      <section className={sec} aria-label="Profil dan CV">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><span className={num}>2</span> Profil & CV</h2>
        <div className="mt-3 flex items-center gap-3">
          <Avatar src={profile?.profile_picture_url} name={profile?.full_name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-espresso">{profile?.full_name ?? "-"}</p>
            <p className="truncate text-xs text-espresso-soft">{profile?.location_place ?? "-"}</p>
          </div>
          <Link href="/dashboard/barista/profile" className="shrink-0 rounded-full border border-[#e0d5bd] px-4 py-2 text-xs font-bold text-espresso hover:border-coffee">
            Lihat Profil
          </Link>
        </div>
        <div className="mt-3 rounded-xl border border-[#e0d5bd] bg-[#faf7ef] px-4 py-3">
          {cvFile ? (
            <p className="flex items-center gap-2 text-sm">
              <FileText size={15} className="shrink-0 text-caramel" />
              <span className="truncate font-bold">{cvFile.name} — {(cvFile.size / 1024).toFixed(0)} KB (file baru)</span>
              <button type="button" onClick={() => setCvFile(null)} className="ml-auto flex shrink-0 items-center gap-1 text-xs font-bold text-red-500 hover:underline">
                <Trash2 size={13} /> Batal
              </button>
            </p>
          ) : profile?.cv_url ? (
            <p className="flex items-center gap-2 text-sm">
              <FileText size={15} className="shrink-0 text-caramel" />
              <a href={profile.cv_url} target="_blank" rel="noreferrer" className="truncate font-bold text-caramel hover:underline">CV profil (klik untuk lihat)</a>
              <button type="button" onClick={() => cvRef.current?.click()} className="ml-auto shrink-0 rounded-lg bg-coffee px-3 py-1.5 text-xs font-bold text-white">
                Ganti File
              </button>
            </p>
          ) : (
            <p className="text-sm text-espresso-soft">Belum ada CV — upload PDF dulu.</p>
          )}
          <input ref={cvRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => pickCv(e.target.files?.[0])} aria-label="Upload CV PDF" />
          {(!profile?.cv_url || !cvFile) && (
            <button type="button" onClick={() => cvRef.current?.click()} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#d8cbb2] px-3 py-1.5 text-xs font-bold text-espresso-soft hover:border-coffee">
              <Upload size={13} /> {profile?.cv_url ? "Upload CV baru" : "Pilih PDF"}
            </button>
          )}
        </div>
        {errors.cv && <p className="mt-1 text-xs font-medium text-red-500">{errors.cv}</p>}

        {jobTypes?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-bold text-espresso">Tipe yang ditawarkan <span className="text-red-500">*</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {jobTypes.map((t) => (
                <label key={t} className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold ${types.includes(t) ? "border-coffee bg-coffee text-white" : "border-[#e0d5bd] text-espresso-soft"}`}>
                  <input type="checkbox" className="sr-only" checked={types.includes(t)} onChange={(e) => setTypes((s) => (e.target.checked ? [...s, t] : s.filter((v) => v !== t)))} />
                  {EMPLOYMENT_LABELS[t] ?? t}
                </label>
              ))}
            </div>
            {errors.types && <p className="mt-1 text-xs font-medium text-red-500">{errors.types}</p>}
          </div>
        )}
      </section>

      {/* 3. Pertanyaan Seleksi */}
      <section className={sec} aria-label="Pertanyaan seleksi">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><span className={num}>3</span> Pertanyaan Seleksi</h2>
        <div className="mt-3 space-y-4">
          <fieldset>
            <legend className="text-[13px] font-bold text-espresso">Berapa lama pengalaman Anda di bidang F&B? <span className="text-red-500">*</span></legend>
            <div className="mt-1.5 space-y-1.5">
              {["Ya, lebih dari 1 tahun", "Ya, kurang dari 1 tahun", "Tidak, tapi saya siap belajar"].map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm text-espresso-soft">
                  <input type="radio" name="screen-exp" checked={exp === o} onChange={() => setExp(o)} className="h-4 w-4 accent-[#4a2f1d]" />{o}
                </label>
              ))}
            </div>
            {errors.exp && <p className="mt-1 text-xs font-medium text-red-500">{errors.exp}</p>}
          </fieldset>
          <div>
            <label htmlFor="screen-avail" className="text-[13px] font-bold text-espresso">Kapan Anda bisa mulai?</label>
            <select id="screen-avail" value={avail} onChange={(e) => setAvail(e.target.value)} className="mt-1.5 w-full cursor-pointer rounded-xl border border-[#e0d5bd] bg-white px-3 py-2.5 text-sm outline-none sm:w-64">
              {["Segera", "Dalam 2 minggu", "Dalam 1 bulan"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="text-[13px] font-bold text-espresso">Bersedia jadwal shift bergilir? <span className="text-red-500">*</span></legend>
            <div className="mt-1.5 space-y-1.5">
              {["Ya, bersedia", "Tidak"].map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm text-espresso-soft">
                  <input type="radio" name="screen-shift" checked={shiftOk === o} onChange={() => setShiftOk(o)} className="h-4 w-4 accent-[#4a2f1d]" />{o}
                </label>
              ))}
            </div>
            {errors.shiftOk && <p className="mt-1 text-xs font-medium text-red-500">{errors.shiftOk}</p>}
          </fieldset>
          <div>
            <Textarea name="app-message" label="Pesan tambahan (opsional)" placeholder="Contoh: Halo, saya berpengalaman 2 tahun di espresso bar dan bisa latte art..." value={message} maxLength={300} onChange={(e) => setMessage(e.target.value)} />
            <p className="mt-1 text-right text-[11px] text-espresso-soft tabular-nums">{message.length}/300</p>
          </div>
        </div>
      </section>

      {/* 4. Portofolio */}
      <section className={sec} aria-label="Portofolio pendukung">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><span className={num}>4</span> Portofolio / Bukti Pendukung <span className="font-medium text-espresso-soft">(Opsional)</span></h2>
        {portfolio.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {portfolio.map((p) => (
              <button
                key={p.id} type="button" onClick={() => togglePf(p.id)}
                aria-pressed={pfPicked.includes(p.id)}
                className={`relative h-24 overflow-hidden rounded-xl border-2 ${pfPicked.includes(p.id) ? "border-coffee" : "border-transparent"}`}
                title={p.caption || "Portofolio"}
              >
                <Image src={p.image_url} alt={p.caption || "Portofolio"} fill className="object-cover" sizes="120px" />
                {pfPicked.includes(p.id) && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-coffee text-white">
                    <CheckCircle2 size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-espresso-soft">Belum ada portofolio di profil — boleh upload langsung di bawah.</p>
        )}
        <input ref={pfRef} type="file" accept={PORTFOLIO_MIME_TYPES.join(",")} multiple className="hidden" aria-label="Upload portofolio"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            const ok = files.filter((f) => PORTFOLIO_MIME_TYPES.includes(f.type) && f.size <= PORTFOLIO_MAX_BYTES);
            if (ok.length !== files.length) toast("Hanya JPG/PNG/WebP maks 10MB per foto", "error");
            setPfNew((arr) => [...arr, ...ok].slice(0, 3));
          }} />
        {pfNew.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {pfNew.map((f, i) => (
              <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#efe9d9] px-3 py-1.5 text-xs font-bold">
                {f.name}
                <button type="button" onClick={() => setPfNew((a) => a.filter((_, j) => j !== i))} aria-label="Hapus file"><Trash2 size={13} /></button>
              </span>
            ))}
          </div>
        )}
        <button type="button" onClick={() => pfRef.current?.click()} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#d8cbb2] px-4 py-2 text-xs font-bold text-espresso-soft hover:border-coffee">
          <Upload size={13} /> Tambah Foto (maks 3)
        </button>
      </section>

      {/* 5. Persetujuan */}
      <section className={sec} aria-label="Persetujuan dan pengiriman">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-espresso"><span className={num}>5</span> Persetujuan dan Pernyataan</h2>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] leading-6 text-espresso-soft">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#4a2f1d]" />
          Saya menyatakan bahwa semua informasi yang saya berikan adalah benar. Saya memberikan izin kepada perusahaan untuk memproses profil dan lamaran saya.
        </label>
        {errors.consent && <p className="mt-1 text-xs font-medium text-red-500">{errors.consent}</p>}
        <Button onClick={submit} full disabled={busy} className="mt-4 min-h-[48px]">
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <>Kirim Lamaran <ArrowRight size={16} /></>}
        </Button>
      </section>
    </div>
  );
}
