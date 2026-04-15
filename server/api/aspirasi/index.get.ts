import { filterAspirasiSchema } from '#shared/schemas/aspirasi.schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const filter = filterAspirasiSchema.safeParse(query)

  const where:any = {}

  if (filter.success){
    if (filter.data.status) where.status = filter.data.status
    if (filter.data.kategori) where.kategori = filter.data.kategori
    if (filter.data.userId) where.userId = filter.data.userId
    if (filter.data.dari || filter.data.sampai) {
      where.createdAt = {
        ...(filter.data.dari && {gte: new Date(filter.data.dari)}),
        ...(filter.data.sampai && {lte: new Date(filter.data.sampai)})
      }
    }
  }

  const data = await prisma.aspirasi.findMany({
    where,
    include: {
      user: {
        select:{
          nis: true,
          nama: true,
          kelas: true,
        }
      },
      _count: {
        select: {
          umpanBalik: true,
          progressPerbaikan: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return {
    success: true,
    message: 'Berhasil mengambil data aspirasi',
    data,
  }satisfies ApiResponse<typeof data>
})
