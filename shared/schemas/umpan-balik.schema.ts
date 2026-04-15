import { z } from 'zod'

export const buatUmpanBalikSchema = z.object({
  pesan: z.string().min(5, 'Pesan minimal 5 karakter'),
  statusBaru: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK']),
})