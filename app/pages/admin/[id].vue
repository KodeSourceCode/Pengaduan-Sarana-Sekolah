<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { buatUmpanBalikSchema } from "#shared/schemas/umpan-balik.schema";
import { buatProgressSchema } from "#shared/schemas/progress.schema";

definePageMeta({ middleware: "admin" });

// ==================== Composables & Refs ====================
const route = useRoute();
const aspirasiId = route.params.id as string;
const toast = useToast();

const {
  detail,
  loading: detailLoading,
  fetchDetail,
  updateStatus,
} = useAdminAspirasi();
const {
  umpanBalik,
  loading: umpanBalikLoading,
  fetchUmpanBalik,
  buatUmpanBalik,
} = useUmpanBalik();
const {
  progress,
  loading: progressLoading,
  persentaseTerakhir,
  fetchProgress,
  buatProgress,
  hapusProgress,
} = useProgress();
const { uploadGambar, loading: uploadLoading } = useUpload();

// Photo modal state
const photoModal = reactive({
  isOpen: false,
  imageUrl: "",
});

const openPhotoModal = (url: string) => {
  photoModal.imageUrl = url;
  photoModal.isOpen = true;
};

// ==================== Fetch Data on Mount ====================
onMounted(async () => {
  try {
    await Promise.all([
      fetchDetail(aspirasiId),
      fetchUmpanBalik(aspirasiId),
      fetchProgress(aspirasiId),
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// ==================== Status Update ====================
const statusLoading = ref(false);
const statusItems = Object.values(StatusAspirasi) as StatusAspirasi[];

const handleStatusUpdate = async (newStatus: StatusAspirasi) => {
  if (!newStatus) return;
  statusLoading.value = true;
  try {
    await updateStatus(aspirasiId, newStatus);
    toast.add({ title: "Status aspirasi berhasil diperbarui" });
  } catch (error) {
    toast.add({ title: "Gagal memperbarui status", color: "error" });
  } finally {
    statusLoading.value = false;
  }
};

// ==================== Umpan Balik Form ====================
type UmpanBalikSchema = z.output<typeof buatUmpanBalikSchema>;
const umpanBalikState = reactive<Partial<UmpanBalikSchema>>({
  pesan: "",
});

watch(
  () => detail.value?.status,
  (status) => {
    if (status) {
      umpanBalikState.statusBaru = status;
    }
  },
  { immediate: true },
);

const handleUmpanBalikSubmit = async (
  event: FormSubmitEvent<UmpanBalikSchema>,
) => {
  try {
    await buatUmpanBalik(aspirasiId, event.data);
    toast.add({ title: "Umpan balik berhasil ditambahkan" });
    umpanBalikState.pesan = "";
    umpanBalikState.statusBaru = undefined;
  } catch (error) {
    toast.add({ title: "Gagal menambahkan umpan balik", color: "error" });
  }
};

// ==================== Progress Form ====================
type ProgressSchema = z.output<typeof buatProgressSchema>;
const progressFile = ref<File | null>(null);
const progressState = reactive<Partial<ProgressSchema>>({
  keterangan: "",
  persentase: 0,
});

const handleProgressSubmit = async (event: FormSubmitEvent<ProgressSchema>) => {
  try {
    let fotoUrl: string | undefined;
    if (progressFile.value) {
      fotoUrl = await uploadGambar(progressFile.value, "progress");
    }

    await buatProgress(aspirasiId, {
      ...event.data,
      fotoUrl,
    });

    toast.add({ title: "Progress berhasil ditambahkan" });
    progressState.keterangan = "";
    progressState.persentase = 0;
    progressFile.value = null;
  } catch (error) {
    toast.add({ title: "Gagal menambahkan progress", color: "error" });
  }
};

// ==================== Delete Progress ====================
const handleDeleteProgress = async (id: string) => {
  if (confirm("Yakin ingin menghapus progress ini?")) {
    try {
      await hapusProgress(id);
      toast.add({ title: "Progress berhasil dihapus" });
    } catch (error) {
      toast.add({ title: "Gagal menghapus progress", color: "error" });
    }
  }
};

// ==================== Status Badge Color ====================
const getStatusColor = (
  status: StatusAspirasi,
): "warning" | "primary" | "success" | "error" => {
  switch (status) {
    case "MENUNGGU":
      return "warning";
    case "DIPROSES":
      return "primary";
    case "SELESAI":
      return "success";
    case "DITOLAK":
      return "error";
    default:
      return "warning";
  }
};
</script>
<template>
  <!-- Back Button -->
  <UContainer class="mt-2.5">
    <UButton
      icon="i-lucide-arrow-left"
      to="/admin"
      variant="link"
      class="underline"
      size="xl"
    >
      Kembali
    </UButton>
  </UContainer>

  <!-- ==================== ASPIRASI INFO SECTION ==================== -->
  <UContainer class="mb-10">
    <div v-if="detailLoading" class="space-y-4">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-40" />
    </div>

    <UCard v-else-if="detail" class="bg-card">
      <template #header>
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <h1 class="text-3xl font-extrabold mb-2">{{ detail.judul }}</h1>
            <div class="flex gap-2 flex-wrap mb-4">
              <UBadge v-if="detail.kategori" size="lg">{{
                detail.kategori
              }}</UBadge>
              <UBadge :color="getStatusColor(detail.status)" size="lg">
                {{ detail.status }}
              </UBadge>
            </div>
          </div>
          <NuxtImg
            v-if="detail.fotoUrl"
            :src="detail.fotoUrl"
            class="h-40 w-40 rounded-lg object-cover cursor-pointer hover:opacity-80"
            @click="openPhotoModal(detail.fotoUrl!)"
          />
        </div>
      </template>

      <!-- Aspirasi Description & Student Info -->
      <div class="space-y-6">
        <div>
          <h3 class="font-semibold text-lg mb-2">Deskripsi</h3>
          <p class="text-neutral-300">{{ detail.deskripsi }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">Data Siswa</h3>
            <div class="space-y-2 text-neutral-300">
              <p>
                <span class="font-medium">Nama:</span> {{ detail.user?.nama }}
              </p>
              <p>
                <span class="font-medium">NIS:</span> {{ detail.user?.nis }}
              </p>
              <p>
                <span class="font-medium">Kelas:</span> {{ detail.user?.kelas }}
              </p>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-lg mb-2">Informasi Aspirasi</h3>
            <div class="space-y-2 text-neutral-300">
              <p>
                <span class="font-medium">Dibuat:</span>
                {{
                  new Date(detail.createdAt).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })
                }}
              </p>
              <p v-if="detail.updatedAt !== detail.createdAt">
                <span class="font-medium">Diperbarui:</span>
                {{
                  new Date(detail.updatedAt).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 items-center">
          <div class="flex-1">
            <label class="text-sm font-medium block mb-2">Update Status</label>
            <USelect
              v-model="detail.status"
              :items="statusItems"
              placeholder="Pilih status baru"
              class="w-full"
            />
          </div>
          <UButton
            :loading="statusLoading"
            @click="handleStatusUpdate(detail.status)"
            class="mt-6"
          >
            Perbarui Status
          </UButton>
        </div>
      </template>
    </UCard>
  </UContainer>

  <!-- ==================== UMPAN BALIK SECTION ==================== -->
  <UContainer class="mb-10">
    <h2 class="text-2xl flex items-center gap-1.5 font-extrabold mb-5">
      <UIcon name="i-lucide-message-circle-dashed" class="text-primary" /> Umpan
      Balik
    </h2>

    <!-- Loading Skeleton -->
    <div v-if="umpanBalikLoading" class="space-y-4">
      <USkeleton v-for="i in 2" :key="i" class="h-24" />
    </div>

    <!-- Timeline Display -->
    <div v-else-if="umpanBalik.length > 0" class="space-y-4 mb-8">
      <UChatMessages>
        <UChatMessage
          v-for="item in [...umpanBalik].reverse()"
          :key="item.id"
          :avatar="{ icon: 'i-lucide-user-check' }"
          :parts="[
            {
              type: 'text',
              id: item.id,
              text: item.pesan,
            },
          ]"
          variant="subtle"
          role="assistant"
        >
          <template #footer>
            <div class="flex gap-2 items-center text-sm">
              <span class="text-neutral-400">{{
                item.admin?.nama || "Admin"
              }}</span>
              <UBadge :color="getStatusColor(item.statusBaru)" size="sm">
                {{ item.statusBaru }}
              </UBadge>
              <span class="text-neutral-500">
                {{
                  new Date(item.createdAt).toLocaleDateString("id-ID", {
                    dateStyle: "short",
                  })
                }}
              </span>
            </div>
          </template>
        </UChatMessage>
      </UChatMessages>
    </div>

    <!-- Empty State -->
    <UEmpty
      v-else
      size="lg"
      icon="i-lucide-message-circle-x"
      title="Belum ada umpan balik"
      description="Tambahkan umpan balik pertama untuk aspirasi ini"
      class="mb-8"
    />

    <!-- Umpan Balik Form -->
    <UCard class="bg-card">
      <template #header>
        <h3 class="text-lg font-semibold">Tambah Umpan Balik</h3>
      </template>

      <UForm
        :schema="buatUmpanBalikSchema"
        :state="umpanBalikState"
        @submit="handleUmpanBalikSubmit"
        class="space-y-4"
      >
        <UFormField label="Pesan" name="pesan">
          <UInput
            v-model="umpanBalikState.pesan"
            type="text"
            placeholder="Masukkan pesan umpan balik"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" :loading="umpanBalikLoading">
          Simpan Umpan Balik
        </UButton>
      </UForm>
    </UCard>
  </UContainer>

  <!-- ==================== PROGRESS SECTION ==================== -->
  <UContainer class="mb-10">
    <h2 class="text-2xl flex items-center gap-1.5 font-extrabold mb-5">
      <UIcon name="i-lucide-trending-up" class="text-primary" /> Progress
      Perbaikan
    </h2>

    <!-- Progress Bar -->
    <div v-if="!progressLoading" class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium"
          >Persentase Terbaru: {{ persentaseTerakhir }}%</span
        >
      </div>
      <div class="w-full bg-neutral-700 rounded-full h-3">
        <div
          class="bg-primary h-3 rounded-full transition-all"
          :style="{ width: `${persentaseTerakhir}%` }"
        />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="progressLoading" class="space-y-4">
      <USkeleton v-for="i in 2" :key="i" class="h-24" />
    </div>

    <!-- Timeline Display -->
    <div v-else-if="progress.length > 0" class="mb-8">
      <UPageList>
        <UPageCard
          v-for="(item, index) in [...progress].reverse()"
          :key="item.id"
          :ui="{ footer: 'flex justify-between items-center' }"
        >
          <template #title>
            <span class="font-semibold">{{ item.keterangan }}</span>
          </template>

          <template #description>
            <div class="flex items-center gap-2">
              <UBadge color="primary" size="sm">{{ item.persentase }}%</UBadge>
              <span class="text-neutral-400" v-if="item.fotoUrl"
                >Foto tersedia</span
              >
            </div>
          </template>

          <template #footer>
            <span class="text-neutral-400 text-sm">
              {{
                new Date(item.createdAt).toLocaleDateString("id-ID", {
                  dateStyle: "long",
                })
              }}
            </span>
            <div class="flex gap-2">
              <UButton
                v-if="item.fotoUrl"
                size="sm"
                variant="ghost"
                icon="i-lucide-image"
                @click="openPhotoModal(item.fotoUrl!)"
              >
                Lihat Gambar
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                @click="handleDeleteProgress(item.id)"
              />
            </div>
          </template>
        </UPageCard>
      </UPageList>
    </div>

    <!-- Empty State -->
    <UEmpty
      v-else
      size="lg"
      icon="i-lucide-list-x"
      title="Belum ada progress"
      description="Tambahkan progress perbaikan pertama untuk aspirasi ini"
      class="mb-8"
    />

    <!-- Progress Form -->
    <UCard class="bg-card">
      <template #header>
        <h3 class="text-lg font-semibold">Tambah Progress</h3>
      </template>

      <UForm
        :schema="buatProgressSchema"
        :state="progressState"
        @submit="handleProgressSubmit"
        class="space-y-4"
      >
        <UFormField label="Keterangan" name="keterangan">
          <UInput
            v-model="progressState.keterangan"
            type="text"
            placeholder="Jelaskan progress perbaikan"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Persentase (0-100)" name="persentase">
          <UInput
            v-model.number="progressState.persentase"
            type="number"
            min="0"
            max="100"
            placeholder="Masukkan persentase"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Foto" name="fotoUrl">
          <UFileUpload
            label="Drop gambar progress di sini"
            description="PNG, JPG atau WEBP"
            accept="image/png, image/jpg, image/webp"
            position="inside"
            layout="list"
            v-model="progressFile"
          />
        </UFormField>

        <UButton type="submit" :loading="uploadLoading || progressLoading">
          {{
            uploadLoading
              ? "Upload Gambar..."
              : progressLoading
                ? "Menyimpan..."
                : "Simpan Progress"
          }}
        </UButton>
      </UForm>
    </UCard>
  </UContainer>

  <!-- ==================== PHOTO MODAL ==================== -->
  <UModal
    v-model:open="photoModal.isOpen"
    scrollable
    :ui="{ content: 'max-w-3xl' }"
  >
    <template #content>
      <div class="p-4">
        <NuxtImg
          v-if="photoModal.imageUrl"
          :src="photoModal.imageUrl"
          class="w-full h-auto"
        />
      </div>
    </template>
  </UModal>
</template>
