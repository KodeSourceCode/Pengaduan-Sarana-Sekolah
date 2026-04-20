<script lang="ts" setup>
const route = useRoute();
const id = route.params.id as string;
const headers = useRequestHeaders(["cookie"]);
const { fetchDetail, detail } = useAspirasi();
const displayGambar = ref("");
const openModal = ref(false);
await useAsyncData("aspirasi-siswa-detail", () => fetchDetail(id, headers));

const openModalImage = (fotoUrl: string) => {
  openModal.value = true
  displayGambar.value = fotoUrl
}
console.log(detail.value);
</script>

<template>
  <UContainer
    class="mt-2.5"
  >
    <UButton
      icon="i-lucide-arrow-left"
      to="/siswa/histori"
      variant="link"
      class="underline"
      size="xl"
    >
      Kembali
    </UButton>
  </UContainer>
  <UPageSection
    :title="detail?.judul"
    :description="detail?.deskripsi"
    :headline="detail?.kategori"
  >
    <NuxtImg
      v-if="detail?.fotoUrl"
      :src="detail?.fotoUrl"
      class="h-90 w-auto mx-auto"
    />
  </UPageSection>

  <UContainer class="mb-10">
    <div
      class="flex justify-between items-center"
    >
      <h2 class="text-2xl flex items-center gap-1.5 font-extrabold mb-5">
        <UIcon name="i-lucide-message-circle-dashed" class="text-primary" /> Umpan
        Balik
      </h2>
      <UBadge size="lg" variant="outline" color="warning">
        Status: {{ detail?.status }}
      </UBadge>
    </div>
    <UChatMessages v-if="detail?.umpanBalik?.length">
      <UChatMessage
        v-for="item in detail.umpanBalik"
        :avatar="{
          icon: 'i-lucide-user-star',
        }"
        :parts="[{
          type: 'text',
          id: item.id,
          text: item.pesan,
        }]"
        variant="subtle"
        role="admin"
        :id="item.id"
      />
    </UChatMessages>
    <UEmpty
      v-else
      size="xl"
      icon="i-lucide-message-circle-x"
      title="Tidak ada umpan balik yang tersedia"
      description="Admin belum menanggapi aspirasi kamu atau tidak memberikan sama sekali umpan balik"
    />
  </UContainer>
  <UContainer class="mb-10">
    <h2 class="text-2xl flex items-center gap-1.5 font-extrabold mb-5">
      <UIcon name="i-lucide-list-check" class="text-primary" /> Progres
      Perbaikan
    </h2>
    <UPageList v-if="detail?.progressPerbaikan?.length">
      <UPageCard
        v-for="(item, index) in detail.progressPerbaikan"
        :key="item.id"
        :ui="{
          footer: 'flex justify-between items-center'
        }"
      >
        <template #title> Progress {{ index }} </template>

        <template #description>
          {{ item.keterangan }}
        </template>

        <template #footer>
          <span class="text-neutral-300">{{
            useTimeAgo(new Date(item.createdAt))
          }}</span>
          <UButton v-if="item.fotoUrl" @click="openModalImage(item.fotoUrl)"> Lihat gambar </UButton>
        </template>
      </UPageCard>
    </UPageList>
    <UEmpty 
      v-else
      size="xl"
      icon="i-lucide-list-x"
      title="Belum ada progres yang diberikan"
      description="Admin belum memberikan progres perbaikan untuk aspirasi kamu"
    />
  </UContainer>

  <UModal
    v-model:open="openModal"
    :ui="{
      content: 'max-w-3xl',
    }"
    scrollable
  >
    <!-- Nuxt UI v3 butuh slot default dengan template -->
  <template #content>
    <div class="p-4">
      <NuxtImg 
        v-if="displayGambar" 
        :src="displayGambar" 
        placeholder
        class="w-full h-auto"
      />
    </div>
  </template>
  </UModal>
</template>

<style></style>
