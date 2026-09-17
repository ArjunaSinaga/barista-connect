import Link from "next/link";
import { BadgeCheck, Check, Sparkles } from "lucide-react";
import { getSessionSafe } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Centang Biru" };

const PERKS = [
  "Badge centang biru di profil publikmu",
  "Badge di setiap lowongan & lamaran atas namamu",
  "Terlihat lebih dipercaya calon rekan kerja",
  "Kontak terbuka antar akun terverifikasi",
];

export default async function VerifyPage() {
  const { user, profile } = await getSessionSafe();
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-espresso-soft">Login dulu untuk melihat centang biru.</p>
        <Link href="/login" className="mt-4 inline-block rounded-xl bg-caramel px-6 py-2.5 text-sm font-bold text-white">Masuk</Link>
      </div>
    );
  }
  const isOwner = profile?.role === "owner";
  const table = isOwner ? "owners" : "barista_profiles";

  const supabase = await createClient();
  const { data: row } = await supabase.from(table).select("is_verified").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-2xl card-dark p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10">
          <BadgeCheck size={30} className="text-sky-500" />
        </span>
        <h1 className="mt-4 text-2xl font-black text-espresso">Centang Biru</h1>
        <p className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-caramel/10 px-4 py-1.5 text-xs font-bold text-caramel">
          <Sparkles size={13} /> Hadir di BaristaConnect v2
        </p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm font-semibold text-espresso">
              <Check size={16} className="mt-0.5 shrink-0 text-matcha" />{p}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {row?.is_verified ? (
            <p className="rounded-xl bg-matcha/10 px-4 py-3 text-sm font-bold text-matcha">
              Akunmu sudah terverifikasi. Mantap!
            </p>
          ) : (
            <p className="rounded-xl bg-[#faf7ef] border border-dashed border-[#e0d5bd] px-4 py-3 text-sm font-semibold text-espresso-soft">
              Pembayaran dibuka saat v2 rilis. Akunmu tetap bisa dipakai full gratis sekarang.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
