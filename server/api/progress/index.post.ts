import { buatProgressSchema } from '#shared/schemas/progress.schema'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)

  const body = await readBody(event)
  const result = buatProgressSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    })
  }

  const query = getQuery(event)
  const aspirasiId = query.aspirasiId as string

  if (!aspirasiId) {
    throw createError({
      statusCode: 400,
      message: 'aspirasiId wajib diisi',
    })
  }

  // Cek aspirasi ada atau tidak
  const aspirasi = await prisma.aspirasi.findUnique({
    where: { id: aspirasiId }
  })

  if (!aspirasi) {
    throw createError({
      statusCode: 404,
      message: 'Aspirasi tidak ditemukan',
    })
  }

  // Kalau persentase 100 otomatis update status aspirasi jadi SELESAI
  const data = await prisma.$transaction(async (tx) => {
    const progress = await tx.progressPerbaikan.create({
      data: {
        keterangan: result.data.keterangan,
        persentase: result.data.persentase,
        fotoUrl: result.data.fotoUrl,
        aspirasiId,
        adminId: user.id,
      }
    })

    if (result.data.persentase === 100) {
      await tx.aspirasi.update({
        where: { id: aspirasiId },
        data: { status: 'SELESAI' }
      })
    }

    return progress
  })

  return {
    success: true,
    message: 'Progress berhasil ditambahkan',
    data,
  } satisfies ApiResponse<typeof data>
})