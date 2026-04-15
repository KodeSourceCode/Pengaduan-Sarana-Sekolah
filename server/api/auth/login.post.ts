import { loginSchema } from '#shared/schemas/auth.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    })
  }

  const user = await prisma.user.findUnique({
    where: { nis: result.data.nis },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'NIS atau password salah',
    })
  }

  // Ganti bcrypt.compare dengan verifyPassword
  const passwordMatch = await verifyPassword(user.password, result.data.password)
  if (!passwordMatch) {
    throw createError({
      statusCode: 401,
      message: 'NIS atau password salah',
    })
  }

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
    message: 'Login berhasil',
    data: {
      id: user.id,
      nis: user.nis,
      email: user.email,
      nama: user.nama,
      role: user.role,
      kelas: user.kelas,
      createdAt: user.createdAt.toISOString(),
    },
  } satisfies ApiResponse<AuthUser>
})