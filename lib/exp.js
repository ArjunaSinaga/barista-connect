// ponytail: pengalaman = total bulan (kolom experience_months). 1 helper, semua display ikut.
export function toMonths(years = 0, months = 0) {
  const y = Math.max(0, Math.min(50, Number(years) || 0));
  const m = Math.max(0, Math.min(11, Number(months) || 0));
  return Math.round(y * 12 + m);
}

export function splitMonths(total = 0) {
  const t = Math.max(0, Number(total) || 0);
  return { years: Math.floor(t / 12), months: t % 12 };
}

// "1 thn 2 bln" • "3 bln" • "2 thn" • "Belum ada pengalaman"
export function formatExp(totalMonths = 0, fallbackYears = 0) {
  let t = Number(totalMonths) || 0;
  if (!t && fallbackYears) t = Number(fallbackYears) * 12;
  if (!t) return "Belum ada pengalaman";
  const { years, months } = splitMonths(t);
  if (years && months) return `${years} thn ${months} bln`;
  if (years) return `${years} thn`;
  return `${months} bln`;
}

// Badge ringkas: "1 thn 2 bln" • "3 bln" • "Baru mulai"
export function formatExpShort(totalMonths = 0, fallbackYears = 0) {
  const s = formatExp(totalMonths, fallbackYears);
  return s === "Belum ada pengalaman" ? "Baru mulai" : s;
}
