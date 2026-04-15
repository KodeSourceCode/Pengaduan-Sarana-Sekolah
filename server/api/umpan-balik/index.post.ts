import { buatUmpanBalikSchema } from "#shared/schemas/umpan-balik.schema";

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)

  const body = await readBody(event)
  const result = buatUmpanBalikSchema.safeParse(body)

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

  const aspirasi = await prisma.aspirasi.findUnique({
    where: { id: aspirasiId }
  })

  if (!aspirasi) {
    throw createError({
      statusCode: 404,
      message: 'Aspirasi tidak ditemukan',
    })
  }

  const [umpanBalik] = await prisma.$transaction([
    prisma.umpanBalik.create({
      data: {
        pesan: result.data.pesan,
        statusBaru: result.data.statusBaru,
        aspirasiId,
        adminId: user.id
      }
    }),
    prisma.aspirasi.update({
      where: { id: aspirasiId },
      data: {
        status: result.data.statusBaru
      }
    })
  ])

    return {
    success: true,
    message: 'Umpan balik berhasil dikirim',
    data: umpanBalik,
  } satisfies ApiResponse<typeof umpanBalik>
})
