// Resize foto di edge Supabase (CDN transform), bukan di server Vercel.
// URL publik bucket storage gardepan ?width=&quality= biar byte kecil.
// URL non-Supabase dikembalikan apa adanya (tak bisa di-transform).
export function thumb(url, { w = 640, q = 70 } = {}) {
  if (typeof url !== "string" || !url) return url;
  if (!url.includes("/storage/v1/object/public/")) return url;
  if (/[?&]width=\d+/.test(url)) return url; // sudah di-resize
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${w}&quality=${q}`;
}

// Cek apakah foto DB benar-benar gambar (bukan file placeholder kecil).
// Placeholder hasil upload uji selalu berukuran sangat kecil (<15KB) dan tampil
// sebagai blok warna polos di kartu. Kalau gitu, pakai foto lokal repo.
export async function photoLooksReal(url, { minBytes = 15000 } = {}) {
  if (typeof url !== "string" || !url) return false;
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!res.ok) return false;
    const len = Number(res.headers.get("content-length") || 0);
    return len === 0 || len >= minBytes;
  } catch {
    return false;
  }
}
