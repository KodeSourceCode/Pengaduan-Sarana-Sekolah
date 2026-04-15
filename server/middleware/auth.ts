const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
]

export default defineEventHandler(async (event) => {
  const isApiRoute = event.path.startsWith('/api/')
  const isPublic = publicRoutes.includes(event.path)

  if (isApiRoute && !isPublic) {
    const session = await getUserSession(event)

    if (!session.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }
})