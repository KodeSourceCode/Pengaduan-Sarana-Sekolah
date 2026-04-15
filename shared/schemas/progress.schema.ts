import { z } from 'zod'

export const buatProgressSchema = z.object({
  keterangan: z.string().min(5, 'Keterangan minimal 5 karakter'),
  persentase: z.number()
    .min(0, 'Persentase minimal 0')
    .max(100, 'Persentase maksimal 100'),
  fotoUrl: z.string().optional(),
})