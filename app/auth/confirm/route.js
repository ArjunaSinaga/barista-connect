import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Penukaran karcis email (recovery / signup / magic link) jadi sesi login.
 * Supabase mengirim ?code= ke sini, lalu kita arahkan ke halaman `next`.
 * Contoh: /auth/confirm?code=xxx&next=/update-password
 */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") || "/update-password";

  // Hanya izinkan redirect internal biar tak bisa dibajak ke situs lain
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/update-password";
  const redirect = (path) => NextResponse.redirect(new URL(path, url.origin));

  if (!code) {
    return redirect(`/forgot-password?error=${encodeURIComponent("Tautan tidak lengkap. Minta tautan baru di bawah.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect(
      `/forgot-password?error=${encodeURIComponent("Tautan sudah kedaluwarsa atau sudah dipakai. Minta tautan baru di bawah.")}`
    );
  }

  return redirect(next);
}
