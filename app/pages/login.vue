<script setup lang="ts">
import { loginSchema } from "#shared/schemas/auth.schema";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({
  layout: false,
});

const { login } = useAuth();
type Schema = z.output<typeof loginSchema>;

const state = reactive<Partial<Schema>>({
  nis: "",
  password: "",
});

const toast = useToast();
const loading = ref(false);
const error = ref("");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  error.value = "";

  try {
    await login(event.data);
    toast.add({
      title: "Login berhasil",
      description: "Anda sedang diarahkan ke halaman utama.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (err: any) {
    error.value = err;
    toast.add({
      title: "Login gagal",
      description: error.value,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    loading.value = false;
  }
}

const showPassword = ref(false);
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center px-4 py-10">
    <UCard
      class="w-full max-w-md border border-muted/60 bg-elevated/90 shadow-xl backdrop-blur"
    >
      <template #header>
        <div class="space-y-3 text-center">
          <div
            class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-school" class="size-6" />
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-default">Masuk akun</h1>
            <p class="mt-1 text-sm text-muted">
              Gunakan NIS dan password untuk melanjutkan.
            </p>
          </div>
        </div>
      </template>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Login gagal"
        :description="error"
        class="mb-4"
      />

      <UForm
        :schema="loginSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField name="nis" label="NIS" required>
          <UInput
            v-model="state.nis"
            icon="i-lucide-id-card"
            placeholder="Masukkan NIS"
            class="w-full"
          />
        </UFormField>

        <UFormField name="password" label="Password" required>
          <UInput
            v-model="state.password"
            icon="i-lucide-lock"
            placeholder="Masukkan password"
            :type="showPassword ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                aria-controls="password"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" block icon="i-lucide-log-in" :loading="loading">
          Masuk
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
