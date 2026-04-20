<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});
const { fetchAspirasiSaya, aspirasi, hapusAspirasi, loading, error } =
  useAspirasi();
const headers = useRequestHeaders(["cookie"]);
const displayGambar = ref("");
const openModal = ref(false);
await useAsyncData("aspirasi-saya", () => fetchAspirasiSaya(headers));

const ALL_FILTER = "ALL" as const;

const statusFilter = ref<Aspirasi["status"] | typeof ALL_FILTER>(ALL_FILTER);
const kategoriFilter = ref<Aspirasi["kategori"] | typeof ALL_FILTER>(
  ALL_FILTER,
);
const searchQuery = ref("");

const statusOptions = [
  { label: "Semua status", value: ALL_FILTER },
  { label: "Menunggu", value: "MENUNGGU" },
  { label: "Diproses", value: "DIPROSES" },
  { label: "Selesai", value: "SELESAI" },
  { label: "Ditolak", value: "DITOLAK" },
];

const kategoriOptions = computed(() => {
  const uniqueKategori = [
    ...new Set(aspirasi.value.map((item) => item.kategori)),
  ];

  return [
    { label: "Semua kategori", value: ALL_FILTER },
    ...uniqueKategori.map((kategori) => ({ label: kategori, value: kategori })),
  ];
});

const filteredAspirasi = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  return aspirasi.value.filter((item) => {
    const statusMatch =
      statusFilter.value === ALL_FILTER || item.status === statusFilter.value;
    const kategoriMatch =
      kategoriFilter.value === ALL_FILTER ||
      item.kategori === kategoriFilter.value;
    const keywordMatch =
      normalizedQuery.length === 0 ||
      item.judul.toLowerCase().includes(normalizedQuery) ||
      item.deskripsi.toLowerCase().includes(normalizedQuery);

    return statusMatch && kategoriMatch && keywordMatch;
  });
});

const hasActiveFilter = computed(
  () =>
    statusFilter.value !== ALL_FILTER ||
    kategoriFilter.value !== ALL_FILTER ||
    searchQuery.value.trim().length > 0,
);

const getStatusColor = (status: Aspirasi["status"]) => {
  switch (status) {
    case "SELESAI":
      return "success";
    case "DITOLAK":
      return "error";
    case "DIPROSES":
      return "primary";
    default:
      return "warning";
  }
};

const getStatusLabel = (status: Aspirasi["status"]) => {
  switch (status) {
    case "MENUNGGU":
      return "Menunggu";
    case "DIPROSES":
      return "Diproses";
    case "SELESAI":
      return "Selesai";
    case "DITOLAK":
      return "Ditolak";
    default:
      return status;
  }
};

const resetFilter = () => {
  statusFilter.value = ALL_FILTER;
  kategoriFilter.value = ALL_FILTER;
  searchQuery.value = "";
};

const openModalImage = (fotoUrl: string) => {
  openModal.value = true;
  displayGambar.value = fotoUrl;
};

const onDeleteClick = async (id: string) => {
  if (!window.confirm("Yakin ingin menghapus aspirasi ini?")) {
    return;
  }

  try {
    await hapusAspirasi(id);
  } catch {
    // error sudah diisi oleh composable
  }
};
</script>

<template>
  <UContainer class="py-7">
    <div class="max-w-3xl space-y-3">
      <UBadge variant="soft" color="primary">Riwayat aspirasi</UBadge>
      <div class="space-y-2">
        <h1
          class="text-3xl font-extrabold tracking-tight text-default sm:text-4xl"
        >
          Histori Aspirasi Saya
        </h1>
        <p class="max-w-2xl text-sm leading-6 text-muted">
          Pantau semua aspirasi yang pernah kamu kirim, lengkap dengan status,
          progres perbaikan, dan umpan balik dari admin.
        </p>
      </div>
    </div>

    <div class="mt-8">
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-alert-triangle"
        :title="error"
        class="mb-4"
      />

      <div
        class="mb-5 grid gap-3 rounded-xl border border-muted bg-elevated/30 p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          placeholder="Pilih status"
        />

        <USelect
          v-model="kategoriFilter"
          :items="kategoriOptions"
          value-key="value"
          label-key="label"
          placeholder="Pilih kategori"
        />

        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Cari judul atau deskripsi"
          class="sm:col-span-2 lg:col-span-1"
        />

        <UButton
          variant="soft"
          color="neutral"
          icon="i-lucide-filter-x"
          class="justify-center"
          @click="resetFilter"
        >
          Reset
        </UButton>
      </div>

      <UPageList v-if="filteredAspirasi.length" class="gap-4">
        <UPageCard
          v-for="item in filteredAspirasi"
          :key="item.id"
          spotlight
          :ui="{
            header: 'w-full',
            footer: 'pt-4',
          }"
        >
          <template #header>
            <div
              class="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-xl font-bold leading-tight text-default">
                    {{ item.judul }}
                  </h2>
                  <UBadge size="sm" variant="soft" color="primary">
                    {{ item.kategori }}
                  </UBadge>
                </div>
                <p class="max-w-2xl text-sm leading-6 text-muted">
                  {{ item.deskripsi }}
                </p>
              </div>

              <UBadge
                size="sm"
                variant="subtle"
                :color="getStatusColor(item.status)"
                class="shrink-0"
              >
                {{ getStatusLabel(item.status) }}
              </UBadge>
            </div>
          </template>

          <template #description>
            <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>Dibuat {{ useTimeAgo(new Date(item.createdAt)) }}</span>
              <span class="text-border">•</span>
              <span>
                {{
                  new Date(item.createdAt).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })
                }}
              </span>
            </div>
          </template>

          <template #footer>
            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div class="grid gap-3 sm:grid-cols-2">
                <div
                  class="rounded-xl border border-muted bg-elevated/40 px-4 py-3"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-[0.2em] text-muted"
                  >
                    Progres perbaikan
                  </p>
                  <p class="mt-1 text-lg font-semibold text-default">
                    {{ item._count?.progressPerbaikan ?? 0 }} update
                  </p>
                </div>

                <div
                  class="rounded-xl border border-muted bg-elevated/40 px-4 py-3"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-[0.2em] text-muted"
                  >
                    Umpan balik
                  </p>
                  <p class="mt-1 text-lg font-semibold text-default">
                    {{ item._count?.umpanBalik ?? 0 }} pesan
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  :to="`/siswa/${item.id}`"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-eye"
                >
                  Lihat detail
                </UButton>
                <UButton
                  v-if="item.status === 'MENUNGGU'"
                  variant="soft"
                  color="error"
                  icon="i-lucide-trash-2"
                  :loading="loading"
                  @click="onDeleteClick(item.id)"
                >
                  Hapus
                </UButton>
                <UButton
                  v-if="item.fotoUrl"
                  variant="ghost"
                  color="primary"
                  icon="i-lucide-image"
                  @click="openModalImage(item.fotoUrl)"
                >
                  Lihat gambar
                </UButton>
              </div>
            </div>
          </template>
        </UPageCard>
      </UPageList>

      <UEmpty
        v-else
        class="py-16"
        size="xl"
        :icon="hasActiveFilter ? 'i-lucide-search-x' : 'i-lucide-inbox'"
        :title="
          hasActiveFilter
            ? 'Tidak ada aspirasi yang cocok dengan filter'
            : 'Belum ada histori aspirasi'
        "
        :description="
          hasActiveFilter
            ? 'Coba ubah filter status, kategori, atau kata kunci pencarian.'
            : 'Saat ini belum ada aspirasi yang kamu kirim. Setelah membuat aspirasi pertama, semua riwayat akan tampil di sini.'
        "
      />
    </div>
  </UContainer>

  <UModal
    v-model:open="openModal"
    scrollable
    :ui="{
      content: 'max-w-3xl',
    }"
  >
    <template #content>
      <div class="p-4 sm:p-6">
        <NuxtImg
          v-if="displayGambar"
          :src="displayGambar"
          placeholder
          class="h-auto w-full rounded-lg"
        />
      </div>
    </template>
  </UModal>
</template>

<style></style>
