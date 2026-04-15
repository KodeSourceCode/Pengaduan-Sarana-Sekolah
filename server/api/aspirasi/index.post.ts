import { buatAspirasiSchema } from "#shared/schemas/aspirasi.schema";

export default defineEventHandler(async (event) => {
  const user = await requireSiswa(event)

  const body = await readBody(event)
  const result = buatAspirasiSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    })
  }

  const data = await prisma.aspirasi.create({
    data: {
      judul: result.data.judul,
      deskripsi: result.data.deskripsi,
      kategori: result.data.kategori,
      fotoUrl: result.data.fotoUrl,
      userId: user.id,
    }
  })
  
  return {
    success: true,
    message: 'Aspirasi berhasil dikirim',
    data,
  } satisfies ApiResponse<typeof data>
})
