import { redirect } from "next/navigation";

// Satu pintu pendaftaran: /register ala UI-02 adalah kanonis.
// /signup/check-email tetap hidup sebagai langkah verifikasi (REG-16).
export default async function SignupRedirect({ searchParams }) {
  const sp = await searchParams;
  const role = sp?.role;
  redirect(role ? `/register?role=${encodeURIComponent(role)}` : "/register");
}
