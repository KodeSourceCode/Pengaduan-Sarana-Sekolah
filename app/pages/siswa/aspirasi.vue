<script lang="ts" setup>
import { z } from "zod";
import { buatAspirasiSchema } from "#shared/schemas/aspirasi.schema";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

type Schema = z.output<typeof buatAspirasiSchema>;

const kategoriItems = Object.values(KategoriEnum) as KategoriEnum[];

const {
  buatAspirasi,
  loading: aspirasiLoading,
  error: aspirasiError,
} = useAspirasi();
const {
  uploadGambar,
  loading: uploadLoading,
  error: uploadError,
} = useUpload();

const selectedFile = ref<File | null>(null);
const previewUrl = ref("");
const state = reactive<Partial<Schema>>({
  judul: "",
  deskripsi: "",
});
const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    let fotoUrl: string | undefined;
    if (selectedFile.value) {
      fotoUrl = await uploadGambar(selectedFile.value, "aspirasi");
    }

    await buatAspirasi({ ...event.data, fotoUrl });
    toast.add({
      title: "Berhasil membuat aspirasi",
    });
    await navigateTo("/siswa/histori");
  } catch {
    toast.add({
      title: "Terjadi kesalahan dalam upload",
      description: aspirasiError.value,
    });
  }
}
</script>

<template>
  <UCard class="max-w-[90vw] mx-auto my-14">
    <template #header>
      <h1 class="text-2xl font-extrabold">Form Aspirasi</h1>
      <p class="text-neutral-400">Sampaikan keluhanmu mengenai masalah yang ada di sekolah!</p>
    </template>
    <UForm :schema="buatAspirasiSchema" :state="state" @submit="onSubmit" class="flex flex-col gap-3.5">
      <UFormField label="Judul Aspirasi" name="judul" hint="Required">
        <UInput
          v-model="state.judul"
          type="text"
          placeholder="Contoh: Meja kelas rusak"
          class="w-full"
          />
        </UFormField>
        <UFormField label="Deskripsi" name="deskripsi" hint="Required">
          <UInput
          v-model="state.deskripsi"
          type="text"
          placeholder="Masukkan rincian aspirasi"
          class="w-full"
          />
        </UFormField>
        <UFormField label="Kategori" name="kategori" hint="Required">
          <USelect
            v-model="state.kategori" 
            :items="kategoriItems" 
            placeholder="Pilih kategori"
            class="w-full"
          />
      </UFormField>
      <UFormField label="Foto" name="fotoUrl" hint="Optional">
        <UFileUpload 
          label="Drop your image here"
          description="PNG, JPG or WEBP"
          accept="image/png, image/jpg, image/webp"
          position="inside"
          layout="list"
          v-model="selectedFile" 
        />
      </UFormField>

      <UButton 
        type="submit"
        icon="i-lucide-upload"
        :ui="{
          base:'justify-center',
        }"
      >
        {{ uploadLoading ? 'Upload Gambar...' : aspirasiLoading ? 'Menyimpan...' : 'Kirim Aspirasi' }}
      </UButton>
    </UForm>
  </UCard>
</template>

<style></style>
