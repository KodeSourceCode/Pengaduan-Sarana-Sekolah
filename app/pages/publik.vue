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

type BadgeColor =
  | "error"
  | "success"
  | "info"
  | "neutral"
  | "primary"
  | "secondary"
  | "warning";

const { data, status, error, refresh, pending } = await useAsyncData(
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

const pagination = computed(() => data.value?.data?.pagination);
const totalItems = computed(() => pagination.value?.total ?? 0);
const currentPage = computed(() => pagination.value?.page ?? 1);
const perPage = computed(() => pagination.value?.perPage ?? 20);
const fromItem = computed(() => {
  if (!items.value.length) {
    return 0;
  }
  return (currentPage.value - 1) * perPage.value + 1;
});
const toItem = computed(() => {
  if (!items.value.length) {
    return 0;
  }
  return fromItem.value + items.value.length - 1;
});

const isInitialLoading = computed(() => status.value === "pending" && !data.value?.data);
const isTableRefreshing = computed(() => status.value === "pending" && Boolean(data.value?.data));

const getStatusMeta = (
  status: PublicAspirasiListItem["status"],
): { color: BadgeColor; icon: string; label: string } => {
  if (status === "SELESAI") {
    return { color: "success", icon: "i-lucide-circle-check", label: "Selesai" };
  }

  if (status === "DITOLAK") {
    return { color: "error", icon: "i-lucide-circle-x", label: "Ditolak" };
  }

  if (status === "DIPROSES") {
    return { color: "warning", icon: "i-lucide-loader-circle", label: "Diproses" };
  }

  return { color: "neutral", icon: "i-lucide-clock-3", label: "Menunggu" };
};

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
  <UContainer class="public-page py-6 md:py-10 space-y-5 md:space-y-6">
    <UCard class="hero-card border border-muted bg-elevated">
      <div class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            color="neutral"
            variant="soft"
            icon="i-lucide-earth"
            class="font-medium"
          >
            Transparansi Publik
          </UBadge>
          <UBadge
            color="neutral"
            variant="outline"
            icon="i-lucide-shield-check"
            class="font-medium"
          >
            Data Baca-Saja
          </UBadge>
        </div>

        <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div class="space-y-2">
            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-default">
              Aspirasi Sarana Sekolah
            </h1>
            <p class="text-sm md:text-base text-muted max-w-3xl">
              Ringkasan aspirasi, progres perbaikan, dan umpan balik yang dapat
              diakses publik secara terbuka.
            </p>
          </div>

          <div class="hero-anchor rounded-xl border border-muted bg-elevated px-4 py-3">
            <p class="text-xs text-muted">Total Aspirasi Tercatat</p>
            <p class="text-2xl md:text-3xl font-semibold text-default leading-tight">
              {{ data?.data?.totalAllAspirasi ?? 0 }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <UPageGrid class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <UCard class="metric-card border border-muted bg-elevated">
        <p class="text-xs uppercase tracking-wide text-muted">Total Aspirasi</p>
        <p class="mt-2 text-2xl md:text-3xl font-semibold text-default leading-tight">
          {{ data?.data?.stats.totalAspirasi ?? 0 }}
        </p>
      </UCard>
      <UCard class="metric-card border border-muted bg-elevated">
        <p class="text-xs uppercase tracking-wide text-muted">Total Umpan Balik</p>
        <p class="mt-2 text-2xl md:text-3xl font-semibold text-default leading-tight">
          {{ data?.data?.stats.totalUmpanBalik ?? 0 }}
        </p>
      </UCard>
      <UCard class="metric-card border border-muted bg-elevated">
        <p class="text-xs uppercase tracking-wide text-muted">
          Total Progress Perbaikan
        </p>
        <p class="mt-2 text-2xl md:text-3xl font-semibold text-default leading-tight">
          {{ data?.data?.stats.totalProgressPerbaikan ?? 0 }}
        </p>
      </UCard>
      <UCard class="metric-card border border-muted bg-elevated">
        <p class="text-xs uppercase tracking-wide text-muted">Total Siswa</p>
        <p class="mt-2 text-2xl md:text-3xl font-semibold text-default leading-tight">
          {{ data?.data?.stats.totalSiswa ?? 0 }}
        </p>
      </UCard>
    </UPageGrid>

    <UCard class="border border-muted bg-elevated">
      <div class="space-y-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-base md:text-lg font-semibold text-default">
              Daftar Aspirasi Publik
            </h2>
            <p class="text-sm text-muted">
              Menampilkan {{ fromItem }} - {{ toItem }} dari {{ totalItems }} data.
            </p>
          </div>

          <UBadge color="neutral" variant="soft" icon="i-lucide-table-properties">
            20 data per halaman
          </UBadge>
        </div>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Gagal memuat data publik"
          :description="error.message"
          class="rounded-xl"
        />

        <UButton
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-refresh-cw"
          class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          @click="() => refresh()"
        >
          Coba lagi
        </UButton>

        <div v-if="isInitialLoading" class="space-y-3 animate-fade-in">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <USkeleton class="h-20 w-full rounded-xl" />
            <USkeleton class="h-20 w-full rounded-xl" />
            <USkeleton class="h-20 w-full rounded-xl" />
            <USkeleton class="h-20 w-full rounded-xl" />
          </div>
          <UCard class="border border-muted bg-elevated">
            <div class="space-y-2">
              <USkeleton class="h-9 w-full rounded-lg" />
              <USkeleton class="h-9 w-full rounded-lg" />
              <USkeleton class="h-9 w-full rounded-lg" />
              <USkeleton class="h-9 w-full rounded-lg" />
              <USkeleton class="h-9 w-full rounded-lg" />
            </div>
          </UCard>
          <div class="flex justify-end gap-2">
            <USkeleton class="h-8 w-8 rounded-md" />
            <USkeleton class="h-8 w-8 rounded-md" />
            <USkeleton class="h-8 w-8 rounded-md" />
          </div>
        </div>

        <template v-else-if="!error">
          <div
            v-if="items.length"
            class="table-shell relative rounded-xl border border-muted bg-elevated overflow-hidden"
            :aria-busy="isTableRefreshing"
          >
            <UTable :data="items" :columns="columns" class="public-table">
              <template #nomor-cell="{ row }">
                <span class="text-muted text-xs font-medium">{{ getNomorBaris(row.index) }}</span>
              </template>

              <template #judul-cell="{ row }">
                <p class="font-medium text-default leading-snug">
                  {{ row.original.judul }}
                </p>
              </template>

              <template #kategori-cell="{ row }">
                <UBadge variant="soft" color="neutral" class="font-medium">
                  {{ row.original.kategori }}
                </UBadge>
              </template>

              <template #status-cell="{ row }">
                <UBadge
                  :label="getStatusMeta(row.original.status).label"
                  :icon="getStatusMeta(row.original.status).icon"
                  variant="subtle"
                  :color="getStatusMeta(row.original.status).color"
                  class="font-medium"
                />
              </template>

              <template #user.nama-cell="{ row }">
                <p class="font-medium text-default">
                  {{ row.original.user.nama }}
                </p>
              </template>

              <template #user.kelas-cell="{ row }">
                <span class="text-sm text-muted">
                  {{ row.original.user.kelas }}
                </span>
              </template>

              <template #createdAt-cell="{ row }">
                <span class="text-sm text-muted">
                  {{ formatTanggal(row.original.createdAt) }}
                </span>
              </template>

              <template #_count.progressPerbaikan-cell="{ row }">
                <span class="font-medium text-default">
                  {{ row.original._count.progressPerbaikan }}
                </span>
              </template>

              <template #_count.umpanBalik-cell="{ row }">
                <span class="font-medium text-default">
                  {{ row.original._count.umpanBalik }}
                </span>
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
                  class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Lihat
                </UButton>
                <span v-else class="text-muted">-</span>
              </template>
            </UTable>

            <div
              v-if="isTableRefreshing"
              class="absolute inset-0 z-10 flex items-center justify-center bg-elevated/75 backdrop-blur-[1px]"
            >
              <div class="flex items-center gap-2 rounded-lg border border-muted bg-elevated px-3 py-2 text-sm text-muted">
                <UIcon name="i-lucide-loader-circle" class="animate-spin text-default" />
                <span>Memuat data halaman...</span>
              </div>
            </div>
          </div>

          <UEmpty
            v-else
            icon="i-lucide-inbox"
            title="Belum ada data aspirasi"
            description="Data aspirasi akan muncul di halaman ini saat tersedia."
            class="rounded-xl border border-dashed border-muted bg-elevated py-10"
          />

          <div
            v-if="items.length"
            class="rounded-xl border border-muted bg-elevated px-4 py-3 md:px-5 md:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            :class="isTableRefreshing ? 'opacity-70 pointer-events-none select-none' : ''"
          >
            <p class="text-xs sm:text-sm text-muted">
              Halaman {{ currentPage }} • Menampilkan {{ fromItem }} - {{ toItem }}
              dari {{ totalItems }} data aspirasi.
            </p>

            <UPagination
              :page="currentPage"
              :items-per-page="perPage"
              :total="totalItems"
              class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              @update:page="goToPage"
            />
          </div>
        </template>
      </div>
    </UCard>
  </UContainer>
</template>

<style scoped>
.public-page {
  animation: page-enter 220ms ease-out;
}

.hero-card {
  background-image:
    radial-gradient(circle at 14% 18%, color-mix(in oklab, var(--ui-text-muted), transparent 88%) 0%, transparent 50%),
    radial-gradient(circle at 84% 10%, color-mix(in oklab, var(--ui-border), transparent 72%) 0%, transparent 42%);
}

.hero-anchor {
  min-width: 13rem;
}

.metric-card {
  min-height: 7.25rem;
}

.table-shell :deep(th),
.table-shell :deep(td) {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

.table-shell :deep(thead th) {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--ui-text-muted), white 8%);
}

.table-shell :deep(tbody tr:hover) {
  background-color: color-mix(in oklab, var(--ui-bg-elevated), white 3%);
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
