<script setup lang="ts">
import { registerSiswaByAdminSchema } from "#shared/schemas/auth.schema";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import type { AdminSiswaItem } from "~/composables/useAdminSiswa";
import { z } from "zod";

definePageMeta({
  middleware: "admin",
});

type Schema = z.output<typeof registerSiswaByAdminSchema>;

const state = reactive<Partial<Schema>>({
  nis: "",
  nama: "",
  email: "",
  kelas: "",
});

const toast = useToast();
const headers = useRequestHeaders(["cookie"]);
const { siswa, loading, error, fetchSiswa, registerSiswa } = useAdminSiswa();

await useAsyncData("admin-siswa-list", () => fetchSiswa(headers));

const columns: TableColumn<AdminSiswaItem>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nis",
    header: "NIS",
    cell: ({ row }) => row.original.nis,
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => row.original.nama,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "kelas",
    header: "Kelas",
    cell: ({ row }) => row.original.kelas ?? "-",
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("id-ID", {
        dateStyle: "medium",
      }),
  },
];

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await registerSiswa(event.data);

    toast.add({
      title: "Berhasil",
      description: "Akun siswa berhasil dibuat",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    state.nis = "";
    state.nama = "";
    state.email = "";
    state.kelas = "";

    await fetchSiswa(headers);
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err.data?.message ?? "Gagal membuat akun siswa",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};
</script>

<template>
  <UContainer class="space-y-6 py-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-default">Kelola Akun Siswa</h1>
      <p class="text-sm text-muted">
        Admin dapat membuat akun siswa baru dan melihat daftar akun siswa
        terdaftar.
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-base font-semibold text-default">Tambah Akun Siswa</h2>
      </template>

      <UAlert
        icon="i-lucide-info"
        color="info"
        variant="subtle"
        title="Password otomatis"
        description="Password siswa otomatis diset ke pengaduanSiswa#123 oleh sistem."
        class="mb-4"
      />

      <UAlert
        v-if="error"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        title="Terjadi kesalahan"
        :description="error"
        class="mb-4"
      />

      <UForm
        :schema="registerSiswaByAdminSchema"
        :state="state"
        class="grid gap-4 md:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField name="nis" label="NIS" required>
          <UInput
            v-model="state.nis"
            placeholder="Masukkan NIS"
            icon="i-lucide-id-card"
            class="w-full"
            maxlength="10"
          />
        </UFormField>

        <UFormField name="nama" label="Nama" required>
          <UInput
            v-model="state.nama"
            placeholder="Masukkan nama siswa"
            icon="i-lucide-user"
            class="w-full"
          />
        </UFormField>

        <UFormField name="email" label="Email" required>
          <UInput
            v-model="state.email"
            placeholder="nama@email.com"
            icon="i-lucide-mail"
            class="w-full"
          />
        </UFormField>

        <UFormField name="kelas" label="Kelas" required>
          <UInput
            v-model="state.kelas"
            placeholder="Contoh: X IPA 1"
            icon="i-lucide-graduation-cap"
            class="w-full"
          />
        </UFormField>

        <div class="md:col-span-2">
          <UButton type="submit" icon="i-lucide-user-plus" :loading="loading">
            Tambah Siswa
          </UButton>
        </div>
      </UForm>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-base font-semibold text-default">Daftar Akun Siswa</h2>
      </template>

      <UTable
        v-if="siswa.length"
        :data="siswa"
        :columns="columns"
        :ui="{
          th: 'px-4 py-3.5 text-default',
          td: 'px-4 py-3.5',
        }"
      />

      <div v-else class="py-8 text-center text-muted">
        Belum ada akun siswa.
      </div>
    </UCard>
  </UContainer>
</template>
