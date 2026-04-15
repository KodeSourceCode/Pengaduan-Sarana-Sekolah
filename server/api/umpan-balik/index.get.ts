export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const aspirasiId = query.aspirasiId as string

  if (!aspirasiId) {
    throw createError({
      statusCode: 400,
      message: 'aspirasiId wajib diisi',
    })
  }

  const data = await prisma.umpanBalik.findMany({
    where: { aspirasiId },
    include: {
      admin: {
        select: {
          nama: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
  
  return {
    success: true,
    message: 'Berhasil mengambil umpan balik',
    data,
  } satisfies ApiResponse<typeof data>
})
