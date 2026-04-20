<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: "admin",
});

const { user } = useUserSession();
const { aspirasi, loading, fetchSemuaAspirasi } = useAdminAspirasi();

const statusFilter = ref<StatusAspirasi | "">("");

const statusFilters: Array<{ label: string; value: StatusAspirasi | "" }> = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: StatusAspirasi.MENUNGGU },
  { label: "Diproses", value: StatusAspirasi.DIPROSES },
  { label: "Selesai", value: StatusAspirasi.SELESAI },
  { label: "Ditolak", value: StatusAspirasi.DITOLAK },
];

await fetchSemuaAspirasi();

const totalAspirasi = computed(() => aspirasi.value.length);
const totalMenunggu = computed(
  () =>
    aspirasi.value.filter((a) => a.status === StatusAspirasi.MENUNGGU).length,
);
const totalDiproses = computed(
  () =>
    aspirasi.value.filter((a) => a.status === StatusAspirasi.DIPROSES).length,
);
const totalSelesai = computed(
  () =>
    aspirasi.value.filter((a) => a.status === StatusAspirasi.SELESAI).length,
);

const aspirasiTerbaru = computed(() => {
  const filtered = statusFilter.value
    ? aspirasi.value.filter((a) => a.status === statusFilter.value)
    : aspirasi.value;

  return filtered.slice(0, 5);
});

const getStatusColor = (
  status: StatusAspirasi,
): "warning" | "primary" | "success" | "error" => {
  switch (status) {
    case StatusAspirasi.MENUNGGU:
      return "warning";
    case StatusAspirasi.DIPROSES:
      return "primary";
    case StatusAspirasi.SELESAI:
      return "success";
    case StatusAspirasi.DITOLAK:
      return "error";
    default:
      return "warning";
  }
};

const formatTanggal = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", { dateStyle: "long" });
};

const lihatDetail = (id: string) => {
  return navigateTo(`/admin/${id}`);
};

const columns: TableColumn<Aspirasi>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "user.nama",
    header: "Nama Siswa",
    cell: ({ row }) => row.original.user?.nama ?? "-",
  },
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
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => formatTanggal(row.original.createdAt),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => row.original,
  },
];

const statCards = computed(() => [
  {
    title: "Total Aspirasi",
    value: totalAspirasi.value,
    cardClass: "border-l-4 border-l-gray-500",
    badgeColor: "neutral" as const,
  },
  {
    title: "Menunggu",
    value: totalMenunggu.value,
    cardClass: "border-l-4 border-l-yellow-500",
    badgeColor: "warning" as const,
  },
  {
    title: "Diproses",
    value: totalDiproses.value,
    cardClass: "border-l-4 border-l-blue-500",
    badgeColor: "primary" as const,
  },
  {
    title: "Selesai",
    value: totalSelesai.value,
    cardClass: "border-l-4 border-l-green-500",
    badgeColor: "success" as const,
  },
]);
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-default">Dashboard Admin</h1>
        <p class="text-sm text-muted">
          Selamat datang, {{ user?.nama ?? "Admin" }}.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          to="/admin/akun-siswa"
          icon="i-lucide-users"
          variant="outline"
          color="neutral"
        >
          Kelola Akun Siswa
        </UButton>
        <UButton to="/admin/aspirasi" icon="i-lucide-list">
          Lihat Semua
        </UButton>
      </div>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <UCard v-for="idx in 4" :key="`skeleton-stat-${idx}`">
        <div class="space-y-3">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-8 w-16" />
        </div>
      </UCard>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <UCard
        v-for="card in statCards"
        :key="card.title"
        :class="card.cardClass"
      >
        <div class="space-y-2">
          <p class="text-sm text-muted">
            {{ card.title }}
          </p>
          <div class="flex items-center justify-between">
            <p class="text-2xl font-bold text-default">
              {{ card.value }}
            </p>
            <UBadge :color="card.badgeColor" variant="soft"> Data </UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            v-for="filter in statusFilters"
            :key="filter.label"
            :label="filter.label"
            size="sm"
            :variant="statusFilter === filter.value ? 'solid' : 'outline'"
            :color="statusFilter === filter.value ? 'primary' : 'neutral'"
            @click="statusFilter = filter.value"
          />
        </div>
      </template>

      <div v-if="loading" class="space-y-3">
        <USkeleton
          v-for="idx in 5"
          :key="`skeleton-row-${idx}`"
          class="h-12 w-full"
        />
      </div>

      <div v-else-if="aspirasiTerbaru.length">
        <UTable
          :data="aspirasiTerbaru"
          :columns="columns"
          :ui="{
            th: 'px-4 py-3.5 text-default',
            td: 'px-4 py-3.5 align-top',
          }"
        >
          <template #kategori-cell="{ row }">
            <UBadge color="neutral" variant="subtle">
              {{ row.original.kategori }}
            </UBadge>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="getStatusColor(row.original.status)" variant="soft">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #aksi-cell="{ row }">
            <UButton
              size="sm"
              variant="ghost"
              color="primary"
              icon="i-lucide-eye"
              @click="lihatDetail(row.original.id)"
            >
              Lihat Detail
            </UButton>
          </template>
        </UTable>

        <div class="mt-4 flex justify-end">
          <UButton
            to="/admin/aspirasi"
            variant="outline"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
          >
            Lihat Semua
          </UButton>
        </div>
      </div>

      <div v-else class="py-8 text-center text-muted">
        Tidak ada aspirasi untuk filter ini.
      </div>
    </UCard>
  </UContainer>
</template>
