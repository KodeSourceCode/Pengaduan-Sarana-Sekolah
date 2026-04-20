<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";
const { fetchSemuaAspirasi, aspirasi } = useAdminAspirasi();
const headers = useRequestHeaders(["cookie"]);
const displayGambar = ref("");
const openModal = ref(false);

await useAsyncData("semua-aspirasi", () => fetchSemuaAspirasi(headers));

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
    accessorKey: "_count.progressPerbaikan",
    header: "Progres Perbaikan",
    cell: ({ row }) => `${row.original._count?.progressPerbaikan ?? 0}%`,
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
  <UContainer>
    <div class="py-7 flex items-center justify-between">
      <h1 class="text-2xl font-extrabold">Semua Aspirasi</h1>
    </div>

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
        <div class="flex gap-2">
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
        </div>
      </template>
    </UTable>

    <div v-else class="py-12 text-center text-muted">
      <p>Tidak ada data aspirasi</p>
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
