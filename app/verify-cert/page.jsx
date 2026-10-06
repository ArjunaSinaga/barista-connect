import { BadgeCheck, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Verifikasi Sertifikat" };

// ponytail: verifikasi publik — cari nama barista → sertif + penerbit + tanggal.
// Sumber tunggal: certificate_issues (audit log penerbitan).
export default async function VerifyCertPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q ?? "").toString().trim();
  const supabase = await createClient();

  let rows = [];
  let searched = false;
  if (q) {
    searched = true;
    const { data: baristas } = await supabase
      .from("baristas_public")
      .select("id, full_name")
      .ilike("full_name", `%${q}%`)
      .limit(5);
    const ids = (baristas ?? []).map((b) => b.id);
    const names = Object.fromEntries((baristas ?? []).map((b) => [b.id, b.full_name]));
    if (ids.length) {
      const { data: issues } = await supabase
        .from("certificate_issues")
        .select("label, barista_id, issuer_id, created_at")
        .in("barista_id", ids)
        .order("created_at", { ascending: false })
        .limit(30);
      const issuerIds = [...new Set((issues ?? []).map((i) => i.issuer_id))];
      let issuerNames = {};
      if (issuerIds.length) {
        const { data: academies } = await supabase.from("academy_profiles").select("id, name").in("id", issuerIds);
        issuerNames = Object.fromEntries((academies ?? []).map((a) => [a.id, a.name]));
        const missing = issuerIds.filter((id) => !issuerNames[id]);
        if (missing.length) {
          const { data: owners } = await supabase.from("owners_public").select("id, business_name").in("id", missing);
          for (const o of owners ?? []) issuerNames[o.id] = o.business_name;
        }
      }
      rows = (issues ?? []).map((i) => ({
        ...i,
        barista: names[i.barista_id] ?? "Barista",
        issuer: issuerNames[i.issuer_id] ?? "Penerbit",
      }));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
        <BadgeCheck size={13} /> Cek keaslian
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-espresso sm:text-3xl">
        Verifikasi sertifikat
      </h1>
      <p className="mt-1 max-w-xl text-sm leading-6 text-espresso-soft">
        Setiap sertifikat yang diterbitkan lewat BarisCon tercatat permanen. Cari nama barista untuk memeriksa.
      </p>
      <form action="/verify-cert" method="GET" role="search" className="mt-4 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2">
          <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
          <label htmlFor="vc-q" className="sr-only">Cari nama barista</label>
          <input
            id="vc-q"
            name="q"
            defaultValue={q}
            placeholder="cth. Budi Santoso"
            autoComplete="off"
            className="h-6 w-full bg-transparent text-sm text-espresso placeholder:text-[#b6a98f] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[36px] shrink-0 items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Cek
        </button>
      </form>

      <div className="mt-6">
        {!searched && (
          <EmptyState
            icon={<BadgeCheck size={20} />}
            title="Belum ada pencarian"
            subtitle="Masukkan nama barista untuk melihat sertifikatnya yang tercatat."
          />
        )}
        {searched && rows.length === 0 && (
          <EmptyState
            icon={<Search size={20} />}
            title="Tidak ditemukan"
            subtitle="Tidak ada sertifikat tercatat untuk nama ini. Pastikan ejaan benar."
          />
        )}
        {rows.length > 0 && (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li key={`${r.barista_id}-${r.label}-${i}`} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
                <p className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
                  <BadgeCheck size={15} className="shrink-0 text-matcha" /> {r.label}
                </p>
                <p className="mt-1 text-xs text-espresso-soft">
                  {r.barista} · diterbitkan oleh {r.issuer} · {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
