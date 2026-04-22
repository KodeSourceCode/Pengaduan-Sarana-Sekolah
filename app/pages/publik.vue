<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type {
  ApiResponse,
  PublicAspirasiListItem,
  PublicAspirasiListPayload,
} from "#shared/types/api";

definePageMeta({
  auth: false,
});

const route = useRoute();

const page = computed(() => {
  const raw = Array.isArray(route.query.page)
    ? route.query.page[0]
    : route.query.page;
  const parsed = Number.parseInt(String(raw ?? "1"), 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
});

const getNomorBaris = (index: number) => {
  const pagination = data.value?.data?.pagination;
  const currentPage = pagination?.page ?? 1;
  const perPage = pagination?.perPage ?? 20;
  return (currentPage - 1) * perPage + index + 1;
};

const columns: TableColumn<PublicAspirasiListItem>[] = [
  {
    id: "nomor",
    header: "No",
    cell: ({ row }) => String(getNomorBaris(row.index)),
  },
  { accessorKey: "judul", header: "Judul" },
  { accessorKey: "kategori", header: "Kategori" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "user.nama", header: "Siswa" },
  { accessorKey: "user.kelas", header: "Kelas" },
  { accessorKey: "createdAt", header: "Tanggal" },
  { accessorKey: "fotoUrl", header: "Gambar" },
  { accessorKey: "_count.progressPerbaikan", header: "Progress" },
  { accessorKey: "_count.umpanBalik", header: "Umpan Balik" },
];

const formatTanggal = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("id-ID", { dateStyle: "medium" });
};

const { data, status, error, refresh } = await useAsyncData(
  () => `publik-aspirasi-${page.value}`,
  () =>
    $fetch<ApiResponse<PublicAspirasiListPayload>>("/api/aspirasi/publik", {
      query: {
        page: page.value,
        perPage: 20,
      },
    }),
  {
    watch: [page],
  },
);

const items = computed(() => data.value?.data?.items ?? []);

const goToPage = async (nextPage: number) => {
  await navigateTo(
    {
      path: "/publik",
      query: {
        ...route.query,
        page: String(nextPage),
      },
    },
    { replace: true },
  );
};
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <UCard class="border border-muted bg-elevated">
      <div class="space-y-4">
        <UBadge color="neutral" variant="soft" icon="i-lucide-earth">
          Transparansi Sekolah
        </UBadge>
        <div class="space-y-2">
          <h1 class="text-2xl md:text-3xl font-bold text-default">
            Halaman Publik Aspirasi Sekolah
          </h1>
          <p class="text-sm md:text-base text-muted">
            Data pada halaman ini bersifat baca-saja dan dapat diakses publik
            sebagai bagian dari keterbukaan informasi perbaikan sarana sekolah.
          </p>
        </div>
      </div>
    </UCard>

    <UPageGrid class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard class="border border-muted bg-elevated">
        <p class="text-sm text-muted">Total Aspirasi</p>
        <p class="mt-2 text-2xl font-semibold text-default">
          {{ data?.data?.stats.totalAspirasi ?? 0 }}
        </p>
      </UCard>
      <UCard class="border border-muted bg-elevated">
        <p class="text-sm text-muted">Total Umpan Balik</p>
        <p class="mt-2 text-2xl font-semibold text-default">
          {{ data?.data?.stats.totalUmpanBalik ?? 0 }}
        </p>
      </UCard>
      <UCard class="border border-muted bg-elevated">
        <p class="text-sm text-muted">Total Progress Perbaikan</p>
        <p class="mt-2 text-2xl font-semibold text-default">
          {{ data?.data?.stats.totalProgressPerbaikan ?? 0 }}
        </p>
      </UCard>
      <UCard class="border border-muted bg-elevated">
        <p class="text-sm text-muted">Total Siswa</p>
        <p class="mt-2 text-2xl font-semibold text-default">
          {{ data?.data?.stats.totalSiswa ?? 0 }}
        </p>
      </UCard>
    </UPageGrid>

    <UCard class="border border-muted bg-elevated">
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Total seluruh aspirasi tercatat:
          <span class="font-semibold text-default">
            {{ data?.data?.totalAllAspirasi ?? 0 }}
          </span>
        </p>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Gagal memuat data publik"
          :description="error.message"
        />

        <UButton
          v-if="error"
          color="error"
          variant="soft"
          @click="() => refresh()"
        >
          Coba lagi
        </UButton>

        <div v-if="status === 'pending'" class="space-y-4">
          <USkeleton class="h-10 w-48" />
          <div class="space-y-2">
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-10 w-full" />
          </div>
        </div>

        <template v-else-if="!error">
          <UTable v-if="items.length" :data="items" :columns="columns">
            <template #kategori-cell="{ row }">
              <UBadge variant="soft" color="info">
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
                      : row.original.status === 'DIPROSES'
                        ? 'warning'
                        : 'neutral'
                "
              />
            </template>

            <template #createdAt-cell="{ row }">
              {{ formatTanggal(row.original.createdAt) }}
            </template>

            <template #fotoUrl-cell="{ row }">
              <UButton
                v-if="row.original.fotoUrl"
                :to="row.original.fotoUrl"
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-image"
              >
                Lihat
              </UButton>
              <span v-else>-</span>
            </template>
          </UTable>

          <UEmpty
            v-else
            icon="i-lucide-inbox"
            title="Belum ada data aspirasi"
            description="Data aspirasi akan muncul di halaman ini saat tersedia."
          />

          <div
            v-if="items.length"
            class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="text-xs text-muted">
              Halaman ini menampilkan 20 data aspirasi per halaman.
            </p>

            <UPagination
              :page="data?.data?.pagination.page ?? 1"
              :items-per-page="data?.data?.pagination.perPage ?? 20"
              :total="data?.data?.pagination.total ?? 0"
              @update:page="goToPage"
            />
          </div>
        </template>
      </div>
    </UCard>
  </UContainer>
</template>
