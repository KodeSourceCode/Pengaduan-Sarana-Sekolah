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

const exactDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const filterAspirasiSchema = z.object({
  judul: z.string().min(1).optional(),
  createdAt: z
    .string()
    .regex(exactDateRegex, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  updatedAt: z
    .string()
    .regex(exactDateRegex, "Format tanggal harus YYYY-MM-DD")
    .optional(),
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
