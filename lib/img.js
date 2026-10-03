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
