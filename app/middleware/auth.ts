// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch: fetchSession } = useUserSession()

  // Pastikan session di-fetch dulu saat server side
  if (import.meta.server) {
    await fetchSession()
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})