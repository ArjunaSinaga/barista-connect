/**
 * Alamat website live — dipakai untuk link di email Supabase
 * (reset password, konfirmasi daftar). Jangan pakai window.location.origin
 * karena link yang diminta dari laptop (localhost) bakal mati di user lain.
 * Bisa dioverride via env NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://barista-connect.vercel.app";
