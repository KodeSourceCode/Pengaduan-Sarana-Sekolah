<script setup lang="ts" >
import { registerClientSchema } from '#shared/schemas/auth.schema'
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'

const { register } = useAuth()
type Schema = z.output<typeof registerClientSchema>

const state = reactive<Partial<Schema>>({
  nis: '',
  password: '',
  email: '',
  kelas: '',
  nama: '',
  confirmPassword: '',
})

const toast = useToast()
const loading = ref(false)
const error = ref('')
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  error.value = ''

  try {
    await register(event.data)
    toast.add({
      title: 'Registration Successful',
      color: 'success'
    })
  } catch (err: any) {
    error.value = err
    toast.add({
      title: 'Registration Failed',
      description: error.value,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <UMain>
    <template v-if="error">
      <UAlert
        color="error"
        variant="subtle"
        title="Login Failed"
        :description="error"
      />
    </template>
    <UForm :schema="registerClientSchema" :state="state" @submit="onSubmit">
      <UFormField label="NIS" name="nis">
        <UInput v-model="state.nis" />
      </UFormField>
      <UFormField label="Email" name="email">
        <UInput v-model="state.email" />
      </UFormField>
      <UFormField label="Nama" name="nama">
        <UInput v-model="state.nama" />
      </UFormField>
      <UFormField label="Kelas" name="kelas">
        <UInput v-model="state.kelas" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormField>
      <UFormField label="Confirm Password" name="confirmPassword">
        <UInput v-model="state.confirmPassword" type="password" />
      </UFormField>

      <UButton type="submit">
        Submit
      </UButton>
    </UForm>
  </UMain>
</template>

<style>

</style>
