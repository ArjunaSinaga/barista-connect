export const APP_NAME = "BaristaConnect";

export const SKILL_PRESETS = [
  "Latte Art",
  "Manual Brew",
  "Espresso Bar",
  "Roasting",
  "Cupping",
  "Cold Brew",
  "Tea & Non-Coffee",
  "Customer Service",
  "Cashier POS",
  "Bar Back",
];

export const CITIES = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Utara",
  "Jakarta Timur",
  "Tangerang",
  "Bekasi",
  "Depok",
  "Bogor",
  "Bandung",
  "Yogyakarta",
  "Semarang",
  "Surabaya",
  "Malang",
  "Medan",
  "Palembang",
  "Makassar",
  "Denpasar / Bali",
];

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "casual", label: "Casual / Harian" },
];

export const EMPLOYMENT_LABELS = Object.fromEntries(
  EMPLOYMENT_TYPES.map((t) => [t.value, t.label])
);

export const STATUS_META = {
  pending: { label: "Terkirim", classes: "bg-gray-100 text-gray-600" },
  viewed: { label: "Dilihat", classes: "bg-blue-100 text-blue-700" },
  accepted: { label: "Diterima", classes: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak", classes: "bg-red-100 text-red-700" },
};

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
