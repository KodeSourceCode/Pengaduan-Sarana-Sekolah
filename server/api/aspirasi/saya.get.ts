import { ApiResponse } from "~~/shared/types/api"

export default defineEventHandler(async (event) => {
  try {

    const user = await requireAuth(event)
    // console.log('user:', user) ← tambah ini
  
    const data = await prisma.aspirasi.findMany({
      where: { userId: user.id },
      include: {
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
  } catch (err) {
    console.error('API error:', err) // ← dan ini
    throw err
  }
})
