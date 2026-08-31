import { z } from "zod";

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
});

export const skillsShape = {
  skills: z
    .array(z.string().min(1))
    .min(1, "Tambahkan minimal 1 skill")
    .max(10, "Maksimal 10 skill"),
  certificates: z.array(z.string().min(1)).max(5).optional().default([]),
  ideas_plus: z.string().max(500, "Maksimal 500 karakter").optional().default(""),
};

export const skillsSchema = z.object(skillsShape);

export const ownerOnboardingSchema = z.object({
  business_name: z.string().min(2, "Nama bisnis minimal 2 karakter").max(120),
  location: z.string().min(2, "Lokasi wajib diisi"),
});

export const jobPostSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(120),
  description: z.string().max(2000).optional().default(""),
  location: z.string().min(2, "Lokasi wajib diisi"),
  employment_type: z.enum(["full_time", "part_time", "casual"], {
    message: "Pilih tipe pekerjaan",
  }),
});

export const applicationSchema = z.object({
  message: z.string().max(300, "Maksimal 300 karakter").optional().default(""),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  age: z.coerce.number().int().min(15).max(90),
  location_place: z.string().min(2, "Lokasi wajib diisi"),
  years_of_experience: z.coerce.number().int().min(0).max(50),
  ...skillsShape,
});
