// Cek sudah login saja
export const requireAuth = async (event: any) => {
  try {
    const session = await getUserSession(event)
    // console.log('session:', JSON.stringify(session))
    
    if (!session.user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    return session.user
  } catch (err) {
    // console.error('requireAuth error:', err) // ← ini yang penting
    throw err
  }
}

// Cek harus admin
export const requireAdmin = async (event: any) => {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  return user
}

// Cek harus siswa
export const requireSiswa = async (event: any) => {
  const user = await requireAuth(event)

  if (user.role !== 'SISWA') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  return user
}