"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { ownerOnboardingSchema } from "@/lib/validation";
import { CITIES } from "@/lib/constants";

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ business_name: "", location: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = ownerOnboardingSchema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang");

      const { error } = await supabase
        .from("owners")
        .upsert(
          {
            id: user.id,
            business_name: form.business_name.trim(),
            location: form.location.trim(),
          },
          { onConflict: "id" }
        );
      if (error) throw error;

      router.push("/dashboard/owner");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal menyimpan data bisnis", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-caramel text-white">
          <Store size={26} />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-espresso">
          Data coffee shop kamu
        </h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Ini yang akan dilihat barista pada lowongan kamu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="business_name"
          label="Nama usaha / coffee shop"
          placeholder="cth. Kopi Senja"
          value={form.business_name}
          onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
          error={errors.business_name}
        />
        <Input
          name="location"
          label="Lokasi utama"
          placeholder="cth. Jakarta Selatan"
          list="owner-city-list"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          error={errors.location}
        />
        <datalist id="owner-city-list">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Menyimpan..." : "Simpan & Buka Lowongan"}
        </Button>
      </form>
    </div>
  );
}
