"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, MapPin, MessageCircleMore } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { ownerOnboardingSchema, ownerWaSchema } from "@/lib/validation";
import { CITIES } from "@/lib/constants";
import OsmMapPicker from "@/components/maps/OsmMapPicker";

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ business_name: "", location: "", address: "", lat: -6.208, lng: 106.83, whatsapp: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function next1() {
    const parsed = ownerOnboardingSchema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      toast("Lengkapi data bisnis & pilih titik peta — zero-cost OSM", "error");
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleFinal(e) {
    e.preventDefault();
    const wa = ownerWaSchema.safeParse({ whatsapp: form.whatsapp });
    if (!wa.success) {
      setErrors({ whatsapp: wa.error.issues[0].message });
      return;
    }
    const b = ownerOnboardingSchema.safeParse(form);
    if (!b.success) { setStep(1); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");
      const payload = {
        id: user.id,
        business_name: form.business_name.trim(),
        location: form.location.trim(),
        address: form.address.trim(),
        whatsapp: form.whatsapp.replace(/[\s-]/g, ""),
        lat: Number(form.lat),
        lng: Number(form.lng),
        business_type: "coffee_shop",
      };
      let { error } = await supabase.from("owners").upsert(payload, { onConflict: "id" });
      if (error && /column .* does not exist/i.test(error.message)) {
        // fallback legacy before migration applied
        const legacy = { id: user.id, business_name: payload.business_name, location: payload.location };
        const r2 = await supabase.from("owners").upsert(legacy, { onConflict: "id" });
        if (r2.error) throw r2.error;
        toast("Migrasi DB belum dijalankan — simpan legacy + jalankan supabase/migrations/20250903_perfection_f1.sql", "error");
      } else if (error) throw error;
      toast("Profil bisnis tersimpan", "success");
      router.push("/dashboard/owner"); router.refresh();
    } catch (err) { toast(err.message || "Gagal menyimpan", "error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-caramel text-white"><Store size={26}/></span>
        <h1 className="mt-4 text-xl font-extrabold text-espresso">Data coffee shop kamu</h1>
        <p className="mt-1 text-sm text-espresso-soft">Step {step}/2 · {step===1?"Titik peta OSM (zero-cost)":"Kontak WA"}.</p>
        <div className="mt-3 flex gap-2 rounded-full bg-[#16100d] p-1.5">
          <span className={`flex-1 rounded-full px-3 py-1.5 text-center text-xs font-bold ${step===1?"bg-caramel text-white":"text-espresso-soft"}`}><MapPin size={14} className="mr-1 inline"/> Peta & Bisnis</span>
          <span className={`flex-1 rounded-full px-3 py-1.5 text-center text-xs font-bold ${step===2?"bg-caramel text-white":"text-espresso-soft"}`}><MessageCircleMore size={14} className="mr-1 inline"/> WhatsApp</span>
        </div>
      </div>

      {step===1 && (
        <div className="space-y-4">
          <Input name="business_name" label="Nama usaha / coffee shop" placeholder="cth. Kopi Senja" value={form.business_name} onChange={(e)=>setForm(f=>({...f,business_name:e.target.value}))} error={errors.business_name} />
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#fdf6ec]">Pilih titik di peta — WAJIB (OSM, tanpa Google billing)</label>
            <OsmMapPicker value={form} onChange={(v)=>setForm(f=>({...f,lat:v.lat,lng:v.lng,address:v.address}))} />
            {errors.lat && <p className="mt-1 text-xs text-red-400">{errors.lat}</p>}
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
          </div>
          <Input name="address" label="Alamat lengkap (auto dari pin)" placeholder="Jl. …" value={form.address} onChange={(e)=>setForm(f=>({...f,address:e.target.value}))} error={errors.address} />
          <Input name="location" label="Kota / lokasi teks" placeholder="cth. Jakarta Selatan" list="owner-city-list" value={form.location} onChange={(e)=>setForm(f=>({...f,location:e.target.value}))} error={errors.location} />
          <datalist id="owner-city-list">{CITIES.map((c)=><option key={c} value={c}/>)}</datalist>
          <Button type="button" full size="lg" onClick={next1}>Lanjut ke WhatsApp</Button>
        </div>
      )}

      {step===2 && (
        <form onSubmit={handleFinal} className="space-y-4">
          <Input name="whatsapp" label="Nomor WhatsApp bisnis" placeholder="08xxxxxxxxxx" inputMode="tel" value={form.whatsapp} onChange={(e)=>setForm(f=>({...f,whatsapp:e.target.value}))} error={errors.whatsapp} />
          <p className="text-xs leading-snug text-espresso-soft">Hanya WA. Barista akan hubungi via link WA langsung — tanpa chat internal. Format 08… atau +62…</p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={()=>setStep(1)}>Kembali</Button>
            <Button type="submit" className="flex-1" disabled={busy}>{busy?"Menyimpan…":"Simpan & Buka Lowongan"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
