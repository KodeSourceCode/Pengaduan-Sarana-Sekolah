import { z } from "zod";

export const buatAspirasiSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  kategori: z.enum(KategoriEnum),
  fotoUrl: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["MENUNGGU", "DIPROSES", "SELESAI", "DITOLAK"]),
});

export const PUBLIC_ASPIRASI_PER_PAGE = 20 as const;

export const publicAspirasiQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // Keep public page size capped for endpoint stability.
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(PUBLIC_ASPIRASI_PER_PAGE)
    .default(PUBLIC_ASPIRASI_PER_PAGE),
});

const exactMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const filterAspirasiSchema = z.object({
  judul: z.string().min(1).optional(),
  createdMonth: z
    .string()
    .regex(exactMonthRegex, "Format bulan harus YYYY-MM")
    .optional(),
  createdDay: z.coerce.number().int().min(1).max(31).optional(),
  updatedMonth: z
    .string()
    .regex(exactMonthRegex, "Format bulan harus YYYY-MM")
    .optional(),
  updatedDay: z.coerce.number().int().min(1).max(31).optional(),
  userId: z.string().optional(),
  kategori: z
    .enum([
      "KEBERSIHAN",
      "KEAMANAN",
      "FASILITAS_BELAJAR",
      "INFRASTRUKTUR",
      "LAINNYA",
    ])
    .optional(),
  status: z.enum(["MENUNGGU", "DIPROSES", "SELESAI", "DITOLAK"]).optional(),
});
