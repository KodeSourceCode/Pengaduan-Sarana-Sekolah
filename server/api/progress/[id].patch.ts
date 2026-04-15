import { buatProgressSchema } from '#shared/schemas/progress.schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const result = buatProgressSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    })
  }

  // Cek progress ada atau tidak
  const existing = await prisma.progressPerbaikan.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Progress tidak ditemukan',
    })
  }

  const data = await prisma.$transaction(async (tx) => {
    const progress = await tx.progressPerbaikan.update({
      where: { id },
      data: {
        keterangan: result.data.keterangan,
        persentase: result.data.persentase,
        fotoUrl: result.data.fotoUrl,
      }
    })

    // Kalau diupdate jadi 100 otomatis selesai
    if (result.data.persentase === 100) {
      await tx.aspirasi.update({
        where: { id: existing.aspirasiId },
        data: { status: 'SELESAI' }
      })
    }

    return progress
  })

  return {
    success: true,
    message: 'Progress berhasil diupdate',
    data,
  } satisfies ApiResponse<typeof data>
})