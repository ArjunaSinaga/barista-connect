import Link from "next/link";
import { BadgeCheck, Check } from "lucide-react";
import { getSessionSafe } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { VERIFY_PRODUCTS } from "@/lib/midtrans";
import VerifyCheckout from "@/components/verify/VerifyCheckout";

export const metadata = { title: "Centang Biru" };

const PERKS = [
  "Badge centang biru di profil publikmu",
  "Badge di setiap lowongan & lamaran atas namamu",
  "Terlihat lebih dipercaya calon rekan kerja",
  "Bayar sekali, berlaku selamanya",
];

export default async function VerifyPage() {
  const { user, profile } = await getSessionSafe();
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-espresso-soft">Login dulu untuk mendapatkan centang biru.</p>
        <Link href="/login" className="mt-4 inline-block rounded-xl bg-caramel px-6 py-2.5 text-sm font-bold text-white">Masuk</Link>
      </div>
    );
  }
  const isOwner = profile?.role === "owner";
  const product = isOwner ? "verified_owner" : "verified_barista";
  const { amount, label } = VERIFY_PRODUCTS[product];
  const table = isOwner ? "owners" : "barista_profiles";

  const supabase = await createClient();
  const { data: row } = await supabase.from(table).select("is_verified").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-2xl card-dark p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10">
          <BadgeCheck size={30} className="text-sky-500" />
        </span>
        <h1 className="mt-4 text-2xl font-black text-espresso">{label}</h1>
        <p className="mt-1 text-3xl font-black text-caramel">Rp{amount.toLocaleString("id-ID")}</p>
        <p className="text-xs font-semibold text-espresso-soft">sekali bayar, selamanya</p>
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
            <VerifyCheckout amount={amount} label={label} />
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-espresso-soft">
        Bayar via QRIS (GoPay, OVO, DANA, m-banking). QR berlaku 10 menit.
      </p>
    </div>
  );
}
