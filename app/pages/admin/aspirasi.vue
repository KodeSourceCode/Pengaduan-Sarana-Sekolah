<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";
const headers = useRequestHeaders(["cookie"]);
const { fetchSemuaAspirasi, aspirasi, filter, resetFilter } =
  useAdminAspirasi();
const { siswa, fetchSiswa } = useAdminSiswa();
const displayGambar = ref("");
const openModal = ref(false);

await useAsyncData("semua-aspirasi", () => fetchSemuaAspirasi(headers));
await useAsyncData("admin-siswa-opsi", () => fetchSiswa(headers));

const userOptions = computed(() =>
  siswa.value.map((item) => ({
    label: `${item.nama} (${item.nis})`,
    value: item.id,
  })),
);

const kategoriOptions = [
  { label: "KEBERSIHAN", value: "KEBERSIHAN" },
  { label: "KEAMANAN", value: "KEAMANAN" },
  { label: "FASILITAS_BELAJAR", value: "FASILITAS_BELAJAR" },
  { label: "INFRASTRUKTUR", value: "INFRASTRUKTUR" },
  { label: "LAINNYA", value: "LAINNYA" },
];

const statusOptions = [
  { label: "MENUNGGU", value: "MENUNGGU" },
  { label: "DIPROSES", value: "DIPROSES" },
  { label: "SELESAI", value: "SELESAI" },
  { label: "DITOLAK", value: "DITOLAK" },
];

const applyFilter = async () => {
  await fetchSemuaAspirasi(headers);
};

const clearFilter = async () => {
  resetFilter();
  await fetchSemuaAspirasi(headers);
};

const hasActiveFilter = computed(() => {
  return Boolean(
    filter.judul.trim() ||
    filter.createdAt ||
    filter.updatedAt ||
    filter.userId ||
    filter.kategori ||
    filter.status,
  );
});

const formatTanggal = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", { dateStyle: "medium" });

const openModalImage = (fotoUrl: string) => {
  openModal.value = true;
  displayGambar.value = fotoUrl;
};

const columns: TableColumn<Aspirasi>[] = [
  {
    accessorKey: "judul",
    header: "Judul",
    cell: ({ row }) => row.original.judul,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => row.original.kategori,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status,
  },
  {
    accessorKey: "user.nama",
    header: "Nama Siswa",
    cell: ({ row }) => row.original.user?.nama ?? "-",
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) => formatTanggal(row.original.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: "Diupdate",
    cell: ({ row }) => formatTanggal(row.original.updatedAt),
  },
  {
    accessorKey: "_count.progressPerbaikan",
    header: "Progres Perbaikan",
    cell: ({ row }) => `${row.original._count?.progressPerbaikan ?? 0}`,
  },
  {
    accessorKey: "_count.umpanBalik",
    header: "Umpan Balik",
    cell: ({ row }) => row.original._count?.umpanBalik ?? 0,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => row.original,
  },
];
</script>

<template>
  <UContainer class="mb-24">
    <div class="py-7 flex items-center justify-between">
      <h1 class="text-2xl font-extrabold">Semua Aspirasi</h1>
    </div>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-base font-semibold text-default">Filter Aspirasi</h2>
      </template>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UFormField label="Judul (Kata Kunci)">
          <UInput
            v-model="filter.judul"
            placeholder="Contoh: rusak"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tanggal Dibuat">
          <UInput v-model="filter.createdAt" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Tanggal Diupdate">
          <UInput v-model="filter.updatedAt" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Siswa">
          <ClientOnly>
            <USelect
              v-model="filter.userId"
              :items="userOptions"
              placeholder="Semua siswa"
              class="w-full"
            />
            <template #fallback>
              <UInput
                value=""
                placeholder="Memuat opsi siswa..."
                class="w-full"
                disabled
              />
            </template>
          </ClientOnly>
        </UFormField>

        <UFormField label="Kategori">
          <USelect
            v-model="filter.kategori"
            :items="kategoriOptions"
            placeholder="Semua kategori"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Status">
          <USelect
            v-model="filter.status"
            :items="statusOptions"
            placeholder="Semua status"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="mt-4 flex gap-2">
        <UButton @click="applyFilter">Terapkan</UButton>
        <UButton variant="soft" @click="clearFilter">Reset</UButton>
      </div>
    </UCard>

    <UTable
      v-if="aspirasi.length"
      :data="aspirasi"
      :columns="columns"
      :ui="{
        th: 'px-4 py-3.5 text-default',
        td: 'px-4 py-3.5',
      }"
    >
      <template #kategori-cell="{ row }">
        <UBadge size="md" variant="soft" color="info">
          {{ row.original.kategori }}
        </UBadge>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          :label="row.original.status"
          variant="subtle"
          :color="
            row.original.status === 'SELESAI'
              ? 'success'
              : row.original.status === 'DITOLAK'
                ? 'error'
                : 'warning'
          "
        />
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton
            :to="`/admin/${row.original.id}`"
            size="sm"
            variant="ghost"
            color="info"
            icon="i-lucide-eye"
          >
            Detail
          </UButton>
          <UButton
            v-if="row.original.fotoUrl"
            @click="openModalImage(row.original.fotoUrl)"
            size="sm"
            variant="ghost"
            icon="i-lucide-image"
          >
            Gambar
          </UButton>
          <template
            v-else-if="!row.original.fotoUrl"
          >
            -
          </template>
        </div>
      </template>
    </UTable>

    <div v-else class="py-12 text-center text-muted">
      <p v-if="hasActiveFilter">Tidak ada data yang cocok dengan filter</p>
      <p v-else>Tidak ada data aspirasi</p>
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
