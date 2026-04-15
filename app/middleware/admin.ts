export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/')
  }

  if (user.value?.role !== 'ADMIN') {
    return navigateTo('/siswa')
  }
})