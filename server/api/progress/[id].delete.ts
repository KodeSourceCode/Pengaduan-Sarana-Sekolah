export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')

  const existing = await prisma.progressPerbaikan.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Progress tidak ditemukan',
    })
  }

  await prisma.progressPerbaikan.delete({ where: { id } })

  return {
    success: true,
    message: 'Progress berhasil dihapus',
    data: null,
  } satisfies ApiResponse
})