<script setup lang="ts" >
import { loginSchema } from '#shared/schemas/auth.schema'
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'

const { login } = useAuth()
type Schema = z.output<typeof loginSchema>

const state = reactive<Partial<Schema>>({
  nis: undefined,
  password: undefined
})

const toast = useToast()
const loading = ref(false)
const error = ref('')
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  error.value = ''

  try {
    await login(event.data)
    toast.add({
      title: 'Login Successful',
      color: 'success'
    })
  } catch (err: any) {
    error.value = err
    toast.add({
      title: 'Login Failed',
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
    <UForm :schema="loginSchema" :state="state" @submit="onSubmit">
      <UFormField label="NIS" name="nis">
        <UInput v-model="state.nis" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormField>

      <UButton type="submit">
        Submit
      </UButton>
    </UForm>
  </UMain>
</template>

<style>

</style>
