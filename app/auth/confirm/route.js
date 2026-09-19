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
  const rawNext = url.searchParams.get("next") || "/auth/verified";
  const role = url.searchParams.get("role") === "owner" ? "owner" : "barista";

  // Hanya izinkan redirect internal biar tak bisa dibajak ke situs lain
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/update-password";
  const redirect = (path) => NextResponse.redirect(new URL(path, url.origin));

  if (!code) {
    return redirect(`/forgot-password?error=${encodeURIComponent("Tautan tidak lengkap. Minta tautan baru di bawah.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect(
      `/forgot-password?error=${encodeURIComponent("Tautan sudah kedaluwarsa atau sudah dipakai. Minta tautan baru di bawah.")}`
    );
  }

  // Catat peran sejak verifikasi biar login tak salah peran (signup tanpa
  // sesi belum membuat baris profiles). Hanya bila belum ada — jangan
  // timpa peran user lama (mis. alur lupa password).
  try {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!existing) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        role,
        email: data.user.email,
      });
      // ponytail: prefill nama/HP dari metadata signup; abaikan gagal (onboarding yang lengkapi)
      try {
        const meta = data.user.user_metadata || {};
        const displayName = (meta.name || "").trim();
        const phone = (meta.phone || "").trim() || null;
        if (displayName) {
          if (role === "owner") {
            await supabase.from("owners").insert({ id: data.user.id, business_name: displayName, whatsapp: phone });
          } else {
            await supabase.from("barista_profiles").insert({ id: data.user.id, full_name: displayName, whatsapp: phone });
          }
        }
      } catch {
        // diam
      }
    }
  } catch {
    // diam: onboarding/login tetap jalan, peran default barista
  }

  return redirect(next);
}
