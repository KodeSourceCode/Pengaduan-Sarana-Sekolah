<script lang="ts" setup>
const { clear } = useUserSession();
async function logout() {
  await clear();
  await navigateTo("/login");
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
              content: 'p-2 w-54',
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
              <template v-if="user?.role === 'ADMIN'">
                <UButton
                  icon="i-lucide-layout-dashboard"
                  color="neutral"
                  variant="ghost"
                  class="w-full"
                  to="/admin/"
                >
                  Dashboard Admin
                </UButton>
                <UButton
                  icon="i-lucide-users"
                  color="neutral"
                  variant="ghost"
                  class="w-full"
                  to="/admin/akun-siswa"
                >
                  Kelola Akun Siswa
                </UButton>
                <UButton
                  icon="i-lucide-form"
                  color="neutral"
                  variant="ghost"
                  class="w-full"
                  to="/admin/aspirasi"
                >
                  Kelola Aspirasi
                </UButton>
              </template>
              <template v-else>
                <UButton
                  icon="i-lucide-form"
                  color="neutral"
                  variant="ghost"
                  class="w-full"
                  to="/siswa/aspirasi"
                >
                  Buat Aspirasi
                </UButton>
                <UButton
                  icon="i-lucide-history"
                  color="neutral"
                  variant="ghost"
                  class="w-full"
                  to="/siswa/histori"
                >
                  Histori Aspirasi
                </UButton>
              </template>
              <UButton
                icon="i-lucide-log-out"
                color="error"
                variant="ghost"
                class="w-full"
                loading-auto
                @click="logout"
              >
                Logout
              </UButton>
            </template>
          </UPopover>
          <UButton v-else to="/login"> Sign In </UButton>
        </template>
        <template #placeholder>
          <UButton loading> Loading </UButton>
        </template>
      </AuthState>
    </template>
  </UHeader>
  <slot />
</template>

<style></style>
