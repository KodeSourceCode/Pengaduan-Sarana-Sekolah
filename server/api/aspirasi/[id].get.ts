export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const data = await prisma.aspirasi.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          nis: true,
          nama: true,
          kelas: true,
        }
      },
      umpanBalik: {
        include: {
          admin: {
            select: { nama: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      progressPerbaikan: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if(!data){
    throw createError({statusCode: 404, message: 'Aspirasi tidak ditemukan'})
  }

  if (user.role === 'SISWA' && data.userId !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  return {
    success: true,
    message: 'Berhasil mengambil detail aspirasi',
    data,
  }satisfies ApiResponse<typeof data>
})
