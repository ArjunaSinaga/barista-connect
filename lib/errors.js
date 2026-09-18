// ponytail: 1 penerjemah error storage/supabase ke Bahasa santai. Dipakai semua upload.
export function friendlyUpload(err) {
  const msg = String(err?.message || err || "");
  if (/exceeded|too large|5MB|2MB|maximum/i.test(msg)) return "Filenya kegedean — maksimal 5MB untuk CV, 2MB untuk foto";
  if (/mime|type|format|pdf|image/i.test(msg)) return "Format salah — CV harus PDF, foto harus JPG/PNG/WebP";
  if (/bucket|not found|No such/i.test(msg)) return "Server penyimpanan lagi gangguan, coba lagi sebentar";
  if (/row-level|policy|permission|unauthorized|JWT/i.test(msg)) return "Sesi habis atau belum berhak — login ulang lalu coba lagi";
  if (/network|fetch|failed/i.test(msg)) return "Koneksi putus — cek internet lalu coba lagi";
  return msg || "Gagal mengunggah, coba lagi";
}
