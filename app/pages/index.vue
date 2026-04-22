<script lang="ts" setup>
definePageMeta({
  middleware: ['auth']
})
import type { ButtonProps } from '@nuxt/ui'

const { user} = useUserSession()

const siswaLinks: ButtonProps[] = [
  {
    label: 'Mulai Pengaduan',
    to: '/siswa/aspirasi',
    icon: 'i-lucide-square-play'
  },
  {
    label: 'Histori Pengaduan',
    to: '/siswa/histori',
    icon: 'i-lucide-history'
  }
]

const adminLinks: ButtonProps[] = [
  {
    label: 'Dashboard Admin',
    to: '/admin/',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    label: 'Kelola Pengaduan',
    to: '/admin/aspirasi',
    icon: 'i-lucide-folder'
  }
]

const links = computed<ButtonProps[]>(() => {
  if (user.value?.role === 'ADMIN') return adminLinks
  if (user.value?.role === 'SISWA') return siswaLinks
  return []
})
</script>

<template>
  <UPageHero
    title="Selamat Datang di Pengaduan Sarana Sekolah"
    description="Laporkan masalah sarana sekolah dengan mudah dan cepat melalui platform kami."
    orientation="horizontal"
    :links="links"
  >
  <div 
    class="flex justify-center h-fit p-3.5 bg-neutral-200/7 rounded-md"
  >
      <NuxtImg 
        src="/pengaduan-sarana-sekolah-hero-section-image.png"
        format="webp"
        class="object-contain w-full h-auto rounded-sm"
      />
  </div>
  </UPageHero>
</template>