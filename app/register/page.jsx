import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// LP-03: satu pintu registrasi spec (/register) diteruskan ke implementasi
// tunggal /signup — pilih peran + referral param tetap utuh, tanpa duplikasi form.
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(params ?? {}).toString();
  redirect(`/signup${qs ? `?${qs}` : ""}`);
}
