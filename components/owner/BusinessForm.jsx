"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Store } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { ownerOnboardingSchema } from "@/lib/validation";
import { CITIES } from "@/lib/constants";

export default function BusinessForm({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    business_name: initial?.business_name ?? "",
    location: initial?.location ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = ownerOnboardingSchema.safeParse(form);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Periksa isian", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("owners")
        .update(parsed.data)
        .eq("id", user.id);
      if (error) throw error;
      toast("Data bisnis tersimpan ✓");
      router.refresh();
    } catch {
      toast("Gagal menyimpan", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-caramel text-white">
          <Store size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-espresso">
          Data Bisnis
        </h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Nama ini yang dilihat barista pada lowongan kamu.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl card-dark p-6"
      >
        <Input
          name="business_name"
          label="Nama usaha"
          value={form.business_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, business_name: e.target.value }))
          }
        />
        <Input
          name="location"
          label="Lokasi utama"
          list="biz-city-list"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <datalist id="biz-city-list">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Button type="submit" full size="lg" disabled={busy}>
          <Save size={16} /> {busy ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </div>
  );
}
