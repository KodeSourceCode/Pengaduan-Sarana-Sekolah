import { registerSchema } from '#shared/schemas/auth.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validasi input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    })
  }

  // Cek NIS sudah terdaftar
  const existingNis = await prisma.user.findUnique({
    where: { nis: result.data.nis },
  })
  if (existingNis) {
    throw createError({
      statusCode: 409,
      message: 'NIS sudah terdaftar',
    })
  }

  // Cek email sudah terdaftar
  const existingEmail = await prisma.user.findUnique({
    where: { email: result.data.email },
  })
  if (existingEmail) {
    throw createError({
      statusCode: 409,
      message: 'Email sudah terdaftar',
    })
  }

  // Hash password
  const hashedPassword = await hashPassword(result.data.password)

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      nis: result.data.nis,
      nama: result.data.nama,
      email: result.data.email,
      password: hashedPassword,
      kelas: result.data.kelas,
    },
  })

  await setUserSession(event, {
    user: {
      id: user.id,
      nis: user.nis,
      nama: user.nama,
      role: user.role,
      kelas: user.kelas,
    },
    loggedInAt: new Date()
  })

  return {
    success: true,
    message: 'Registrasi berhasil',
    data: {
      id: user.id,
      nis: user.nis,
      email: user.email,
      nama: user.nama,
      role: user.role,
      kelas: user.kelas,
      createdAt: user.createdAt.toISOString()
    },
  } satisfies ApiResponse<AuthUser>
})