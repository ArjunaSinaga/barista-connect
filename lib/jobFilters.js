// Filter & ranking khusus halaman /jobs (UI-05, JOBSRCH H-12..H-18, H-04).
// - Gaji hanya tersimpan sebagai salary_text ("Rp 2.500.000 – 4.000.000/bulan", "80.000/shift"),
//   jadi band gaji dihitung dengan parse angka + normalisasi shift -> setara bulanan (x26 hari).
// - Shift tidak ada kolom sendiri -> cocokkan kata kunci pagi/siang/malam/fleksibel di judul+deskripsi.

export function parseSalaryRange(text) {
  if (!text) return null;
  const nums = (text.match(/[\d.]+/g) ?? [])
    .map((s) => Number(s.replace(/\./g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;
  const isShift = /shift/i.test(text);
  const factor = isShift ? 26 : 1;
  const vals = nums.map((n) => (n < 1000 ? n * 1000 : n) * factor);
  return { min: Math.min(...vals), max: Math.max(...vals), period: isShift ? "shift" : "bulan" };
}

// Band: "lt3" (<3jt), "3-5" (3–5jt), "gt5" (>5jt) — bandingkan rentang gaji vs band (irisan).
export function matchPayBand(text, band) {
  if (!band) return true;
  const r = parseSalaryRange(text);
  if (!r) return false;
  const Jt = 1000000;
  if (band === "lt3") return r.min < 3 * Jt;
  if (band === "35") return r.max >= 3 * Jt && r.min <= 5 * Jt;
  if (band === "gt5") return r.max > 5 * Jt;
  return true;
}

const SHIFT_WORDS = {
  pagi: ["pagi", "morning"],
  siang: ["siang", "sore"],
  malam: ["malam", "night"],
  fleksibel: ["fleksibel", "flexible", "fleksibel", "shift bergilir", "bergilir"],
};

export function matchShift(job, shift) {
  if (!shift) return true;
  const hay = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  return (SHIFT_WORDS[shift] ?? []).some((w) => hay.includes(w));
}

// Rekomendasi (H-04): skor = irisan skill barista dgn judul+deskripsi. Stabil, tanpa backend baru.
export function recoScore(job, skills) {
  if (!skills?.length) return 0;
  const hay = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  return skills.filter((s) => s && hay.includes(String(s).toLowerCase())).length;
}
