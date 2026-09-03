import { z } from "zod";

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "casual"];
export const EMPLOYMENT_LABELS = { full_time: "Full-Time", part_time: "Part-Time", casual: "Panggilan / Harian" };

// id WA 08... 10-15 digits, allow +62 prefix
export const waSchema = z
  .string()
  .min(9, "WA minimal 9 digit")
  .max(20)
  .regex(/^\+?[0-9\s-]+$/, "WA hanya angka")
  .transform((v) => v.replace(/[\s-]/g, ""));

export const panggilanSalaryRegex = /^\s*(Rp\s*)?\d[\d\s.,]*\s*\/\s*shift\s*$/i;

export const signUpSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const baristaStep1Schema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  age: z.coerce.number().int().min(15, "Minimal usia 15 tahun").max(90),
  location_place: z.string().min(2, "Lokasi wajib diisi"),
  whatsapp: waSchema.optional().or(z.literal("")),
});

export const skillsShape = {
  skills: z.array(z.string().min(1)).min(1, "Tambahkan minimal 1 skill").max(10, "Maksimal 10 skill"),
  certificates: z.array(z.string().min(1)).max(5).optional().default([]),
  ideas_plus: z.string().max(500, "Maksimal 500 karakter").optional().default(""),
};

export const skillsSchema = z.object(skillsShape);

export const baristaStep2Schema = z.object({
  ...skillsShape,
  // multi tipe yang diinginkan
  open_to_types: z.array(z.enum(EMPLOYMENT_TYPES)).min(1, "Pilih minimal 1 tipe kerja"),
  // CV PDF wajib (url dari storage cvs/<uid>/...)
  cv_url: z.string().min(10, "CV PDF wajib di-upload").refine((v) => v.endsWith(".pdf") || v.includes("/cvs/"), "CV harus PDF"),
  cover_letter: z.string().min(20, "Cover letter minimal 20 karakter").max(2000),
  is_open_to_work: z.boolean().optional().default(true),
});

// legacy helper
export const baristaCvSchema = baristaStep2Schema;

export const ownerOnboardingSchema = z.object({
  business_name: z.string().min(2, "Nama bisnis minimal 2 karakter").max(120),
  // lokasi dipilih via OSM Leaflet+Nominatim
  address: z.string().min(5, "Pilih titik di peta / isi alamat minimal 5 karakter"),
  location: z.string().min(2, "Kota / lokasi teks wajib diisi"), // kota free text fallback
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const ownerWaSchema = z.object({
  whatsapp: waSchema,
});

export const jobPostSchema = z
  .object({
    title: z.string().min(5, "Judul minimal 5 karakter").max(120),
    description: z.string().max(2000).optional().default(""),
    location: z.string().min(2, "Lokasi wajib diisi"),
    // multi-select tipe kerja yg ditawarkan
    employment_types: z.array(z.enum(EMPLOYMENT_TYPES)).min(1, "Pilih minimal 1 tipe kerja"),
    // kompat: single deprecated
    employment_type: z.enum(EMPLOYMENT_TYPES).optional(),
    salary_text: z.string().max(80).optional().default("").or(z.literal("")),
    // lat/lng optional but disarankan via picker
    lat: z.coerce.number().min(-90).max(90).optional().nullable(),
    lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  })
  .superRefine((v, ctx) => {
    const hasCasual = v.employment_types?.includes("casual");
    const txt = (v.salary_text || "").trim();
    if (hasCasual && txt) {
      if (!panggilanSalaryRegex.test(txt)) {
        ctx.addIssue({ code: "custom", path: ["salary_text"], message: "Untuk Panggilan format wajib \"<nominal>/shift\" mis: 80000/shift atau Rp 80000/shift" });
      }
    }
  });

export const applicationSchema = z
  .object({
    // barista pilih tipe yang dilamar dari yang ditawarkan
    employment_types: z.array(z.enum(EMPLOYMENT_TYPES)).min(1, "Pilih minimal 1 tipe yang ditawarkan"),
    cv_url: z.string().min(10, "CV PDF wajib").refine((v) => v.endsWith(".pdf") || v.includes("/cvs/"), "CV harus PDF"),
    cover_letter: z.string().min(20, "Cover letter minimal 20 karakter").max(2000),
    message: z.string().max(600).optional().default(""),
  })
  .strict();

export const profileUpdateSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  age: z.coerce.number().int().min(15).max(90),
  location_place: z.string().min(2, "Lokasi wajib diisi"),
  years_of_experience: z.coerce.number().int().min(0).max(50),
  whatsapp: waSchema.optional().or(z.literal("")),
  ...skillsShape,
  open_to_types: z.array(z.enum(EMPLOYMENT_TYPES)).optional().default([]),
  cv_url: z.string().optional().default(""),
  cover_letter: z.string().max(2000).optional().default(""),
});
