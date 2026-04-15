import { z } from 'zod'

export const buatAspirasiSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  kategori: z.enum(KategoriEnum),
  fotoUrl: z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK']),
})

export const filterAspirasiSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK']).optional(),
  kategori: z.enum([
    'KEBERSIHAN',
    'KEAMANAN',
    'FASILITAS_BELAJAR',
    'INFRASTRUKTUR',
    'LAINNYA'
  ]).optional(),
  userId: z.string().optional(),
  dari: z.string().optional(), // tanggal mulai
  sampai: z.string().optional(), // tanggal akhir
})