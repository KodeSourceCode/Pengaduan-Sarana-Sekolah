const publicRoutes = ["/api/auth/login", "/api/aspirasi/publik"];

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const normalizedPath = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  const isPublic = publicRoutes.includes(normalizedPath);

  if (isApiRoute && !isPublic) {
    const session = await getUserSession(event);

    if (!session.user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }
  }
});
