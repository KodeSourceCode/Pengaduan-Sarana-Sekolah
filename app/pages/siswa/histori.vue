<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});

const { fetchAspirasiSaya, aspirasi, hapusAspirasi, error } = useAspirasi();
const headers = useRequestHeaders(["cookie"]);
const displayGambar = ref("");
const openImageModal = ref(false);
const openDeleteModal = ref(false);
const deletingId = ref<string | null>(null);
const pendingDeleteId = ref<string | null>(null);
const pendingDeleteTitle = ref("");

await useAsyncData("aspirasi-saya", () => fetchAspirasiSaya(headers));

const ALL_FILTER = "ALL" as const;
const SORT_NEWEST = "NEWEST" as const;
const SORT_OLDEST = "OLDEST" as const;

const statusFilter = ref<Aspirasi["status"] | typeof ALL_FILTER>(ALL_FILTER);
const kategoriFilter = ref<Aspirasi["kategori"] | typeof ALL_FILTER>(
  ALL_FILTER,
);
const searchQuery = ref("");
const sortOrder = ref<typeof SORT_NEWEST | typeof SORT_OLDEST>(SORT_NEWEST);

const statusOptions = [
  { label: "Semua status", value: ALL_FILTER },
  { label: "Menunggu", value: "MENUNGGU" },
  { label: "Diproses", value: "DIPROSES" },
  { label: "Selesai", value: "SELESAI" },
  { label: "Ditolak", value: "DITOLAK" },
];

const summaryStatusOptions: Array<{
  label: string;
  value: Aspirasi["status"];
}> = [
  { label: "Menunggu", value: "MENUNGGU" as Aspirasi["status"] },
  { label: "Diproses", value: "DIPROSES" as Aspirasi["status"] },
  { label: "Selesai", value: "SELESAI" as Aspirasi["status"] },
  { label: "Ditolak", value: "DITOLAK" as Aspirasi["status"] },
];

const sortOptions = [
  { label: "Terbaru", value: SORT_NEWEST },
  { label: "Terlama", value: SORT_OLDEST },
];

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

const statusMetaMap: Record<
  Aspirasi["status"],
  {
    label: string;
    color: "warning" | "primary" | "success" | "error";
    icon: string;
    ribbonClass: string;
    marker: string;
  }
> = {
  MENUNGGU: {
    label: "Menunggu",
    color: "warning",
    icon: "i-lucide-hourglass",
    ribbonClass: "status-ribbon-waiting",
    marker: "W",
  },
  DIPROSES: {
    label: "Diproses",
    color: "primary",
    icon: "i-lucide-cog",
    ribbonClass: "status-ribbon-progress",
    marker: "P",
  },
  SELESAI: {
    label: "Selesai",
    color: "success",
    icon: "i-lucide-check-check",
    ribbonClass: "status-ribbon-done",
    marker: "S",
  },
  DITOLAK: {
    label: "Ditolak",
    color: "error",
    icon: "i-lucide-octagon-x",
    ribbonClass: "status-ribbon-rejected",
    marker: "R",
  },
};

const formatDateLabel = (value: string) =>
  dateFormatter.format(new Date(value));

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

const sortedAspirasi = computed(() => {
  const sorted = [...filteredAspirasi.value].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();

    return sortOrder.value === SORT_NEWEST ? bTime - aTime : aTime - bTime;
  });

  return sorted.map((item) => ({
    ...item,
    createdLabel: formatDateLabel(item.createdAt),
    updatedLabel: formatDateLabel(item.updatedAt),
    statusMeta: statusMetaMap[item.status],
  }));
});

const summaryCards = computed(() => {
  const total = aspirasi.value.length;

  return summaryStatusOptions.map((option) => {
    const count = aspirasi.value.filter(
      (item) => item.status === option.value,
    ).length;
    const ratio =
      total > 0 ? Math.max(10, Math.round((count / total) * 100)) : 10;
    const statusMeta = statusMetaMap[option.value] ?? statusMetaMap.MENUNGGU;

    return {
      ...option,
      count,
      ratio,
      icon: statusMeta.icon,
      marker: statusMeta.marker,
      ribbonClass: statusMeta.ribbonClass,
    };
  });
});

const hasActiveFilter = computed(
  () =>
    statusFilter.value !== ALL_FILTER ||
    kategoriFilter.value !== ALL_FILTER ||
    searchQuery.value.trim().length > 0 ||
    sortOrder.value !== SORT_NEWEST,
);

const applyStatusFilter = (status: Aspirasi["status"]) => {
  statusFilter.value = statusFilter.value === status ? ALL_FILTER : status;
};

const resetFilter = () => {
  statusFilter.value = ALL_FILTER;
  kategoriFilter.value = ALL_FILTER;
  searchQuery.value = "";
  sortOrder.value = SORT_NEWEST;
};

const openModalImage = (fotoUrl: string) => {
  openImageModal.value = true;
  displayGambar.value = fotoUrl;
};

const requestDelete = (item: Aspirasi) => {
  pendingDeleteId.value = item.id;
  pendingDeleteTitle.value = item.judul;
  openDeleteModal.value = true;
};

const closeDeleteModal = () => {
  if (deletingId.value) {
    return;
  }

  openDeleteModal.value = false;
  pendingDeleteId.value = null;
  pendingDeleteTitle.value = "";
};

const isDeleting = (id: string) => deletingId.value === id;

const onDeleteConfirm = async () => {
  if (!pendingDeleteId.value) {
    return;
  }

  deletingId.value = pendingDeleteId.value;

  try {
    await hapusAspirasi(pendingDeleteId.value);
    closeDeleteModal();
  } catch {
    // error sudah diisi oleh composable
  } finally {
    deletingId.value = null;
  }
};
</script>

<template>
  <UContainer class="histori-page py-6 sm:py-8">
    <section class="reveal-block" style="animation-delay: 40ms">
      <div class="hero-panel">
        <div class="hero-headline">
          <UBadge variant="soft" color="primary" class="w-fit"
            >Histori aspirasi</UBadge
          >
          <h1 class="histori-title text-default">
            Lacak laporan dalam satu kali pindai.
          </h1>
          <p class="max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Semua aspirasi kamu tersusun berdasarkan status, aktivitas terbaru,
            dan aksi lanjutan agar keputusan berikutnya bisa diambil kurang dari
            5 detik.
          </p>
        </div>

        <div class="summary-rail reveal-block" style="animation-delay: 120ms">
          <button
            v-for="card in summaryCards"
            :key="card.value"
            type="button"
            class="summary-card"
            :class="[
              card.ribbonClass,
              statusFilter === card.value ? 'summary-card-active' : '',
            ]"
            @click="applyStatusFilter(card.value)"
          >
            <div class="summary-topline">
              <span class="summary-marker">{{ card.marker }}</span>
              <span class="summary-label text-default">{{ card.label }}</span>
              <UIcon :name="card.icon" class="size-4 text-muted" />
            </div>
            <div class="summary-count text-default">{{ card.count }}</div>
            <div class="summary-meter bg-muted">
              <div
                class="summary-meter-fill"
                :style="{ width: `${card.ratio}%` }"
              />
            </div>
          </button>
        </div>
      </div>
    </section>

    <section class="mt-6">
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-alert-triangle"
        :title="error"
        class="mb-4"
      />

      <div class="filter-shell reveal-block" style="animation-delay: 180ms">
        <div class="grid gap-3 md:grid-cols-10">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Cari judul atau isi aspirasi"
            class="md:col-span-4"
            :ui="{ base: 'h-10' }"
          />

          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            value-key="value"
            label-key="label"
            placeholder="Status"
            class="md:col-span-2"
            :ui="{ base: 'h-10' }"
          />

          <USelect
            v-model="kategoriFilter"
            :items="kategoriOptions"
            value-key="value"
            label-key="label"
            placeholder="Kategori"
            class="md:col-span-2"
            :ui="{ base: 'h-10' }"
          />

          <USelect
            v-model="sortOrder"
            :items="sortOptions"
            value-key="value"
            label-key="label"
            placeholder="Urutan"
            class="md:col-span-2"
            :ui="{ base: 'h-10' }"
          />
        </div>

        <div class="mt-3 flex items-center justify-between gap-2">
          <p class="text-xs uppercase tracking-[0.2em] text-muted">
            {{ sortedAspirasi.length }} dari {{ aspirasi.length }} aspirasi
            tampil
          </p>
          <UButton
            v-if="hasActiveFilter"
            variant="soft"
            color="neutral"
            icon="i-lucide-filter-x"
            size="sm"
            @click="resetFilter"
          >
            Reset filter
          </UButton>
        </div>
      </div>

      <div v-if="sortedAspirasi.length" class="mt-5 space-y-3">
        <UCard
          v-for="(item, index) in sortedAspirasi"
          :key="item.id"
          class="list-card reveal-item"
          :style="{ animationDelay: `${260 + index * 65}ms` }"
          :ui="{ body: 'space-y-4 p-4 sm:p-5' }"
        >
          <div class="status-row">
            <div class="space-y-2">
              <h2
                class="text-lg font-semibold leading-tight text-default sm:text-xl"
              >
                {{ item.judul }}
              </h2>

              <div class="meta-row text-muted">
                <UBadge variant="soft" color="neutral" size="sm">{{
                  item.kategori
                }}</UBadge>
                <span class="meta-chip">
                  <UIcon name="i-lucide-calendar-range" class="size-3.5" />
                  Dibuat {{ item.createdLabel }}
                </span>
                <span class="meta-chip">
                  <UIcon name="i-lucide-clock-3" class="size-3.5" />
                  Update {{ item.updatedLabel }}
                </span>
              </div>
            </div>

            <div class="status-ribbon" :class="item.statusMeta.ribbonClass">
              <span class="status-marker">{{ item.statusMeta.marker }}</span>
              <UBadge
                size="sm"
                variant="soft"
                :color="item.statusMeta.color"
                class="gap-1.5 rounded-full"
              >
                <UIcon :name="item.statusMeta.icon" class="size-3.5" />
                {{ item.statusMeta.label }}
              </UBadge>
            </div>
          </div>

          <p class="desc-clamp text-sm leading-6 text-muted">
            {{ item.deskripsi }}
          </p>

          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="inline-stats text-muted">
              <span>
                <UIcon name="i-lucide-wrench" class="size-4" />
                {{ item._count?.progressPerbaikan ?? 0 }} progres
              </span>
              <span>
                <UIcon name="i-lucide-message-square-more" class="size-4" />
                {{ item._count?.umpanBalik ?? 0 }} umpan balik
              </span>
            </div>

            <div class="action-row">
              <UButton
                :to="`/siswa/${item.id}`"
                variant="solid"
                color="primary"
                icon="i-lucide-eye"
                class="action-main"
              >
                Detail
              </UButton>

              <UButton
                v-if="item.fotoUrl"
                variant="soft"
                color="neutral"
                icon="i-lucide-image"
                @click="openModalImage(item.fotoUrl)"
              >
                Gambar
              </UButton>

              <UButton
                v-if="item.status === 'MENUNGGU'"
                variant="soft"
                color="error"
                icon="i-lucide-trash-2"
                :loading="isDeleting(item.id)"
                :disabled="Boolean(deletingId && deletingId !== item.id)"
                @click="requestDelete(item)"
              >
                Hapus
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <UEmpty
        v-else
        class="py-14"
        size="xl"
        :icon="hasActiveFilter ? 'i-lucide-search-x' : 'i-lucide-inbox'"
        :title="
          hasActiveFilter
            ? 'Tidak ada hasil untuk kombinasi filter saat ini'
            : 'Histori aspirasi kamu masih kosong'
        "
        :description="
          hasActiveFilter
            ? 'Ubah kata kunci, status, kategori, atau urutan untuk memperluas hasil.'
            : 'Setelah kamu mengirim aspirasi pertama, semua rekam jejak status dan tindak lanjut akan muncul di halaman ini.'
        "
      />
    </section>
  </UContainer>

  <UModal
    v-model:open="openImageModal"
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

  <UModal
    v-model:open="openDeleteModal"
    :ui="{
      content: 'max-w-md',
    }"
  >
    <template #content>
      <div class="space-y-4 p-5 sm:p-6">
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-default">Hapus aspirasi?</h3>
          <p class="text-sm leading-6 text-muted">
            Aspirasi
            <span class="font-semibold text-default">{{
              pendingDeleteTitle
            }}</span>
            akan dihapus permanen dan tidak bisa dipulihkan.
          </p>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="Boolean(deletingId)"
            @click="closeDeleteModal"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            :loading="Boolean(deletingId)"
            @click="onDeleteConfirm"
          >
            Ya, hapus
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700&display=swap");

.histori-page {
  --hist-radius: 18px;
  --hist-gap: 0.9rem;
  --hist-shadow: 0 14px 32px -26px rgba(9, 16, 28, 0.45);
  position: relative;
  font-family: "Manrope", "Segoe UI", sans-serif;
}

.histori-page::before {
  content: "";
  position: absolute;
  inset: 1rem 0 auto;
  height: 320px;
  background:
    radial-gradient(
      circle at 10% 12%,
      rgba(120, 176, 158, 0.12),
      transparent 45%
    ),
    radial-gradient(
      circle at 88% 18%,
      rgba(126, 153, 202, 0.11),
      transparent 42%
    ),
    radial-gradient(circle at 55% 0%, rgba(28, 42, 67, 0.08), transparent 56%);
  pointer-events: none;
  border-radius: var(--hist-radius);
  z-index: -2;
}

.histori-page::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    rgba(18, 25, 36, 0.08) 0.35px,
    transparent 0.35px
  );
  background-size: 3px 3px;
  opacity: 0.12;
  pointer-events: none;
  z-index: -1;
}

.hero-panel {
  display: grid;
  gap: var(--hist-gap);
}

.hero-headline {
  display: grid;
  gap: 0.6rem;
}

.histori-title {
  margin: 0;
  font-family: "Fraunces", "Times New Roman", serif;
  font-size: clamp(1.65rem, 2.8vw, 2.55rem);
  font-weight: 700;
  line-height: 1.14;
  letter-spacing: -0.02em;
}

.summary-rail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--hist-gap);
}

.summary-card {
  display: grid;
  gap: 0.45rem;
  border: 1px solid var(--ui-border-muted);
  border-radius: 14px;
  background: color-mix(in oklab, var(--ui-bg-elevated) 82%, transparent);
  padding: 0.75rem 0.82rem;
  text-align: left;
  transition:
    transform 180ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.summary-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(
    in oklab,
    var(--ui-border-muted) 56%,
    var(--ui-text-muted)
  );
  box-shadow: var(--hist-shadow);
}

.summary-card-active {
  border-color: color-mix(in oklab, var(--ui-border-muted) 35%, var(--ui-text));
  box-shadow: var(--hist-shadow);
}

.summary-topline {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.summary-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  border: 1px solid var(--ui-border-muted);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--ui-text-muted);
}

.summary-label {
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-count {
  font-family: "Fraunces", "Times New Roman", serif;
  font-size: 1.42rem;
  line-height: 1;
}

.summary-meter {
  overflow: hidden;
  height: 4px;
  border-radius: 999px;
}

.summary-meter-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--ui-text-muted), var(--ui-text));
  opacity: 0.5;
}

.filter-shell {
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--hist-radius);
  background: color-mix(in oklab, var(--ui-bg-elevated) 72%, transparent);
  padding: 0.85rem;
}

.list-card {
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--hist-radius);
  box-shadow: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.list-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(
    in oklab,
    var(--ui-border-muted) 55%,
    var(--ui-text-muted)
  );
  box-shadow: var(--hist-shadow);
}

.status-row {
  display: grid;
  gap: 0.7rem;
}

.status-ribbon {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.2rem 0.25rem 0.2rem 0.5rem;
  border: 1px solid var(--ui-border-muted);
  border-radius: 999px;
  background: color-mix(in oklab, var(--ui-bg-elevated) 84%, transparent);
}

.status-marker {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--ui-text-muted);
}

.status-ribbon-waiting {
  border-style: dashed;
}

.status-ribbon-progress {
  border-left-width: 5px;
}

.status-ribbon-done {
  border-style: double;
}

.status-ribbon-rejected {
  text-decoration: line-through;
  text-decoration-thickness: 1.2px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.desc-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.inline-stats {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
}

.inline-stats span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.action-row {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.action-main {
  min-width: 7rem;
}

.reveal-block,
.reveal-item {
  opacity: 0;
  transform: translateY(10px);
  animation: rise-in 520ms cubic-bezier(0.2, 0.7, 0.1, 1) forwards;
}

@keyframes rise-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 640px) {
  .summary-rail {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .status-row {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .action-row {
    width: auto;
    justify-content: flex-end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-block,
  .reveal-item {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .summary-card,
  .list-card {
    transition: none;
  }
}
</style>
