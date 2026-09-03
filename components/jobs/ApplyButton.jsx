"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { EMPLOYMENT_LABELS } from "@/lib/constants";

export default function ApplyButton({ jobId, applied=false, size="md", full=false, jobTypes=[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [cover, setCover] = useState("");
  const [types, setTypes] = useState([]);
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(applied);

  async function handleClick() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/login?next=/jobs/${jobId}`); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "barista") { toast("Hanya akun barista yang bisa melamar","error"); return; }
    const ids = (jobTypes||[]).length ? jobTypes : [];
    setTypes(ids.length===1 ? ids : []);
    setOpen(true);
  }

  async function submitApplication() {
    const e={};
    if (types.length===0) e.types="Pilih minimal 1 tipe pekerjaan yang ditawarkan";
    if (!cv) e.cv="CV PDF wajib (max 5MB)";
    else if (cv.type!=="application/pdf") e.cv="CV harus PDF";
    else if (cv.size>5*1024*1024) e.cv="CV maksimal 5MB";
    if (!cover.trim() || cover.trim().length<20) e.cover="Cover letter minimal 20 karakter";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("no user");
      // upload CV to cvs bucket
      const path = `${user.id}/${Date.now()}-${cv.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, cv, { contentType:"application/pdf", upsert:false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("cvs").getPublicUrl(path);
      const cv_url = pub.publicUrl;
      // ensure types subset of jobTypes
      const jt = jobTypes?.length ? jobTypes : types;
      const filtered = types.filter(t=> jt.includes(t));
      if (filtered.length===0) throw new Error("Tipe tidak valid");
      const { error } = await supabase.from("applications").insert({
        job_post_id: jobId,
        barista_id: user.id,
        message: message.trim() || null,
        cover_letter: cover.trim(),
        cv_url,
        employment_types: filtered,
      });
      if (error) {
        if (error.code==="23505") toast("Kamu sudah pernah melamar lowongan ini");
        else throw error;
      } else toast("Lamaran terkirim!");
      setDone(true);
      setOpen(false);
      setCover(""); setMessage(""); setCv(null); setTypes([]);
    } catch (err) {
      toast(err?.message || "Gagal mengirim lamaran, coba lagi","error");
    } finally { setBusy(false); }
  }

  return (
    <>
      <Button onClick={handleClick} size={size} full={full} variant={done?"secondary":"primary"} disabled={done}>
        {done ? "✓ Terkirim" : "Lamar"}
      </Button>
      <Sheet open={open} onClose={()=>setOpen(false)} title="Kirim Lamaran">
        <div className="space-y-4">
          <p className="text-sm text-espresso-soft">Pilih tipe kerja yang kamu lamar, upload CV PDF & cover letter wajib.</p>
          {jobTypes?.length>0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-espresso">Tipe yang ditawarkan <span className="text-red-500">*</span></p>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map(t=>(
                  <label key={t} className={`px-4 py-2 rounded-full text-sm font-bold border cursor-pointer transition ${types.includes(t) ? "bg-caramel text-white border-caramel" : "card-dark border-[#2c241f] text-espresso-soft hover:border-caramel"}`}>
                    <input type="checkbox" className="sr-only" checked={types.includes(t)} onChange={e=> setTypes(s=> e.target.checked ? [...s,t] : s.filter(v=>v!==t))} />
                    {EMPLOYMENT_LABELS[t]||t}
                  </label>
                ))}
              </div>
              {errors.types && <p className="text-xs font-medium text-red-500">{errors.types}</p>}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm font-bold text-espresso">CV PDF <span className="text-red-500">*</span> <span className="font-normal text-espresso-soft">(max 5MB)</span></p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#2c241f] bg-[#16100d] px-4 py-3 text-sm hover:border-caramel">
              <input type="file" accept="application/pdf" className="hidden" onChange={e=> setCv(e.target.files?.[0]||null)} />
              <span className="rounded-lg bg-caramel px-3 py-1.5 text-xs font-bold text-white">Pilih PDF</span>
              <span className="truncate text-espresso-soft">{cv ? `${cv.name} — ${(cv.size/1024).toFixed(0)} KB` : "Belum ada file"}</span>
            </label>
            {errors.cv && <p className="text-xs font-medium text-red-500">{errors.cv}</p>}
          </div>
          <Textarea name="cover_letter" label="Cover letter" placeholder="Ceritakan kenapa kamu cocok, pengalaman relevan, & tipe shift yang kamu bisa..." value={cover} maxLength={1000} onChange={e=> setCover(e.target.value)} error={errors.cover} />
          <p className="-mt-3 text-right text-[11px] text-espresso-soft">{cover.length}/1000 (min 20)</p>
          <Textarea name="application_message" label="Pesan tambahan (opsional)" value={message} maxLength={300} onChange={e=> setMessage(e.target.value)} placeholder="Contoh: Halo, saya berpengalaman 2 tahun di espresso bar dan bisa latte art..." />
          <div className="mt-1 mb-2 text-right text-[11px] text-espresso-soft">{message.length}/300</div>
          <Button onClick={submitApplication} full disabled={busy}><Send size={16} />{busy ? "Mengirim..." : "Kirim Lamaran"}</Button>
        </div>
      </Sheet>
    </>
  );
}
