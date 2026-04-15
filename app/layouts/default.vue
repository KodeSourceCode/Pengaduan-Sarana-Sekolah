<script lang="ts" setup>
const { clear } = useUserSession()
async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <UHeader :toggle="false">
    <template #title>
      <h1>Pengaduan Sarana Sekolah</h1>
    </template>
    <template #right>
      <AuthState>
        <template #default="{ loggedIn, user }">
          <UPopover
            arrow
            :ui="{
              content: 'p-2 w-35',
            }"
            v-if="loggedIn"
          >
            <div
              class="flex gap-1 items-center cursor-pointer hover:bg-accented/60 px-1 py-0.5 rounded-sm group"
            >
              <UUser :name="user?.nama" :description="user?.kelas" />
              <UIcon
                name="i-lucide-chevron-down"
                class="group-data-[state=open]:rotate-180 transition-transform"
              />
            </div>

            <template #content>
              <UButton
                icon="i-lucide-log-out"
                color="error"
                variant="subtle"
                class="w-full"
                loading-auto
                @click="logout"
              >
                Logout
              </UButton>
            </template>
          </UPopover>
          <UButton 
            v-else 
            to="/login"
          >
            Sign In
          </UButton>
        </template>
        <template #placeholder>
          <UButton loading>
            Loading
          </UButton>
        </template>
      </AuthState>
    </template>
  </UHeader>
  <slot />
</template>

<style></style>
