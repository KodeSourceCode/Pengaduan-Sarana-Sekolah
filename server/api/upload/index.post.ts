export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<{file: string, folder?: string}>(event)

  if (!body.file) {
    throw createError({
      statusCode: 400,
      message: 'File wajib diisi'
    })
  }

  const isBase64 = body.file.startsWith('data:image/')
  if(!isBase64){
    throw createError({
      statusCode: 400,
      message: 'Format file tidak valid'
    })
  }

  const folder = body.folder ?? 'misc'

  const url = await uploadGambar(body.file, folder)
  
  return {
    success: true,
    message: 'Gambar berhasil diupload',
    data: { url }
  }satisfies ApiResponse<{ url: string }>
})
