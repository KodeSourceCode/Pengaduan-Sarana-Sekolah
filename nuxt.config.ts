// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/image", "nuxt-auth-utils"],
  css: ["~/assets/css/main.css"],
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'zod',
      ],
    },
  },
  imports: {
    dirs: ["./schemas"],
  },
  runtimeConfig: {
    session: {
      name: 'pengaduan-session',
      password: process.env.NUXT_SESSION_PASSWORD!,
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    }
  }
});
