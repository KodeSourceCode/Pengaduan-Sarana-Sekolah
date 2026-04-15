<script lang="ts" setup>
definePageMeta({
  middleware: ['auth']
})
const { fetchAspirasiSaya, aspirasi } = useAspirasi();
const headers = useRequestHeaders(['cookie'])

await useAsyncData('aspirasi-saya', () => fetchAspirasiSaya(headers))
console.log(aspirasi.value);
</script>

<template>
  <UContainer>
    <h1 class="text-2xl font-extrabold mt-7">Histori Aspirasi saya</h1>
    <UPageList v-if="aspirasi.length" class="my-7 gap-3.5">
      <UPageCard
        v-for="item in aspirasi"
        :key="item.id"
        spotlight
        :ui="{
          header: 'w-full flex items-center justify-between'
        }"
      >
        <template #header>
            <h2 class="text-xl font-bold">{{ item.judul }}</h2>
            <span class="text-lg text-neutral-300">{{ item.kategori }}</span>
        </template>

        <template #description>
          <p class="text-neutral-400">{{ item.deskripsi }}</p>
          
        </template>
        <template #footer>
          <p>Progres Perbaikan: {{ item._count?.progressPerbaikan }}%</p> 
          <p>Umpan Balik: {{ item._count?.umpanBalik }}</p>
        </template>
      </UPageCard>
    </UPageList>
  </UContainer>
</template>

<style></style>
