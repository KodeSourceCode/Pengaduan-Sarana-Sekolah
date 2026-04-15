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

  const data = await prisma.progressPerbaikan.findMany({
    where: { aspirasiId },
    orderBy: { createdAt: 'asc' }
  })

  return {
    success: true,
    message: 'Berhasil mengambil data progress',
    data,
  } satisfies ApiResponse<typeof data>
})