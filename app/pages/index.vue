<script lang="ts" setup>
definePageMeta({
  middleware: ['auth']
})
import type { ButtonProps } from '@nuxt/ui'

const links = ref<ButtonProps[]>([
  {
    label: 'Mulai Pengaduan',
    to: '/siswa/aspirasi',
    icon: 'i-lucide-square-play'
  }
])
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
        src="/pengaduan_sarana_sekolah.webp"  
        class="object-contain w-full h-auto rounded-sm" 
      />
  </div>
  </UPageHero>
</template>