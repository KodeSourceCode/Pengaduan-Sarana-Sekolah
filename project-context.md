# Context Project: Aplikasi Pengaduan Sarana Sekolah

## Stack Teknologi
- **Frontend & Backend:** Nuxt 4
- **ORM:** Prisma
- **Database:** PostgreSQL (lokal)
- **Auth:** nuxt-auth-utils
- **UI Component:** Nuxt UI
- **Storage Gambar:** Cloudinary
- **Validasi:** Zod
- **Runtime:** tsx (bukan ts-node)

---

## Struktur Folder

```
app/
  pages/
    index.vue               # landing page
    login.vue               # login
    register.vue            # register siswa
    siswa/
      index.vue             # dashboard siswa
      aspirasi.vue          # form aspirasi
      histori.vue           # histori aspirasi siswa
      [id].vue              # detail aspirasi siswa
    admin/
      index.vue             # dashboard admin
      aspirasi.vue          # list semua aspirasi
      [id].vue              # detail + umpan balik + progress
      laporan.vue           # filter & rekap
  components/
    aspirasi/
      FormAspirasi.vue
      KartuAspirasi.vue
      BadgeStatus.vue
      TimelineProgress.vue
    admin/
      TabelAspirasi.vue
      FormUmpanBalik.vue
      FormProgress.vue
      FilterPanel.vue
    ui/
      AppHeader.vue
      AppSidebar.vue
      LoadingSpinner.vue
  layouts/
    default.vue
    admin.vue
    auth.vue
  middleware/
    auth.ts                 # cek sudah login
    admin.ts                # cek role admin
  composables/
    useAuth.ts
    useAspirasi.ts
    useAdminAspirasi.ts
    useUmpanBalik.ts
    useProgress.ts
    useUpload.ts

server/
  api/
    auth/
      login.post.ts
      register.post.ts
    aspirasi/
      index.get.ts          # list semua (admin)
      index.post.ts         # buat baru (siswa)
      saya.get.ts           # list milik siswa login
      [id].get.ts           # detail
      [id].patch.ts         # update status (admin)
    umpan-balik/
      index.get.ts
      index.post.ts
    progress/
      index.get.ts
      index.post.ts
      [id].patch.ts
      [id].delete.ts
    upload/
      index.post.ts         # upload gambar ke Cloudinary
  middleware/
    auth.ts                 # proteksi semua /api/* kecuali public routes
  utils/
    db.ts                   # Prisma singleton
    guard.ts                # requireAuth, requireAdmin, requireSiswa
    cloudinary.ts           # uploadGambar, hapusGambar

shared/
  types/                    # auto-import
    api.ts                  # ApiResponse<T>
    auth.ts                 # AuthUser, LoginRequest, RegisterRequest
    aspirasi.ts             # Aspirasi, UmpanBalik, ProgressPerbaikan
    enums.ts                # StatusAspirasi, KategoriEnum, Role
  schemas/                  # manual import via #shared
    auth.schema.ts
    aspirasi.schema.ts
    umpan-balik.schema.ts
    progress.schema.ts

prisma/
  schema.prisma
  migrations/
```

---

## Database (Prisma Schema)

```prisma
enum Role {
  SISWA
  ADMIN
}

enum StatusAspirasi {
  MENUNGGU
  DIPROSES
  SELESAI
  DITOLAK
}

enum KategoriEnum {
  KEBERSIHAN
  KEAMANAN
  FASILITAS_BELAJAR
  INFRASTRUKTUR
  LAINNYA
}

model User {
  id        String   @id @default(uuid())
  nis       String   @unique
  nama      String
  email     String   @unique
  password  String
  kelas     String?
  role      Role     @default(SISWA)
  createdAt DateTime @default(now())

  aspirasi          Aspirasi[]
  umpanBalik        UmpanBalik[]
  progressPerbaikan ProgressPerbaikan[]
}

model Aspirasi {
  id        String         @id @default(uuid())
  judul     String
  deskripsi String
  kategori  KategoriEnum
  status    StatusAspirasi @default(MENUNGGU)
  fotoUrl   String?
  userId    String
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  user              User                @relation(fields: [userId], references: [id])
  umpanBalik        UmpanBalik[]
  progressPerbaikan ProgressPerbaikan[]
}

model UmpanBalik {
  id         String         @id @default(uuid())
  pesan      String
  statusBaru StatusAspirasi
  aspirasiId String
  adminId    String
  createdAt  DateTime       @default(now())

  aspirasi Aspirasi @relation(fields: [aspirasiId], references: [id])
  admin    User     @relation(fields: [adminId], references: [id])
}

model ProgressPerbaikan {
  id         String   @id @default(uuid())
  keterangan String
  persentase Int      @default(0)
  fotoUrl    String?
  aspirasiId String
  adminId    String
  createdAt  DateTime @default(now())

  aspirasi Aspirasi @relation(fields: [aspirasiId], references: [id])
  admin    User     @relation(fields: [adminId], references: [id])
}
```

---

## Environment Variables (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pengaduan_sekolah"
NUXT_SESSION_PASSWORD="random-string-minimal-32-karakter"
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

---

## nuxt.config.ts

```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    'nuxt-auth-utils',
  ],
  auth: {
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    }
  }
})
```

---

## Shared Types

### `shared/types/api.ts`
```ts
export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
}
```

### `shared/types/auth.ts`
```ts
export interface LoginRequest {
  nis: string
  password: string
}

export interface RegisterRequest {
  nis: string
  nama: string
  email: string
  password: string
  kelas?: string
}

export interface AuthUser {
  id: string
  nis: string
  nama: string
  role: 'SISWA' | 'ADMIN'
  kelas: string | null
}
```

### `shared/types/enums.ts`
```ts
export enum Role {
  SISWA = 'SISWA',
  ADMIN = 'ADMIN',
}

export enum StatusAspirasi {
  MENUNGGU = 'MENUNGGU',
  DIPROSES = 'DIPROSES',
  SELESAI = 'SELESAI',
  DITOLAK = 'DITOLAK',
}

export enum KategoriEnum {
  KEBERSIHAN = 'KEBERSIHAN',
  KEAMANAN = 'KEAMANAN',
  FASILITAS_BELAJAR = 'FASILITAS_BELAJAR',
  INFRASTRUKTUR = 'INFRASTRUKTUR',
  LAINNYA = 'LAINNYA',
}
```

### `shared/types/aspirasi.ts`
```ts
export interface Aspirasi {
  id: string
  judul: string
  deskripsi: string
  kategori: KategoriEnum
  status: StatusAspirasi
  fotoUrl: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user?: {
    nis: string
    nama: string
    kelas: string | null
  }
  umpanBalik?: UmpanBalik[]
  progressPerbaikan?: ProgressPerbaikan[]
  _count?: {
    umpanBalik: number
    progressPerbaikan: number
  }
}

export interface UmpanBalik {
  id: string
  pesan: string
  statusBaru: StatusAspirasi
  aspirasiId: string
  adminId: string
  createdAt: string
  admin?: {
    nama: string
  }
}

export interface ProgressPerbaikan {
  id: string
  keterangan: string
  persentase: number
  fotoUrl: string | null
  aspirasiId: string
  adminId: string
  createdAt: string
}
```

---

## Auth Declaration (auth.d.ts — root project)

```ts
declare module '#auth-utils' {
  interface User {
    id: string
    nis: string
    nama: string
    role: 'SISWA' | 'ADMIN'
    kelas: string | null
  }

  interface UserSession {
    loggedInAt: Date
  }
}

export {}
```

---

## Server Utils

### `server/utils/db.ts`
```ts
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client"

const prismaClientSingleton = () => {
  const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter: pool })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### `server/utils/guard.ts`
```ts
export const requireAuth = async (event: any) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return session.user
}

export const requireAdmin = async (event: any) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return user
}

export const requireSiswa = async (event: any) => {
  const user = await requireAuth(event)
  if (user.role !== 'SISWA') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return user
}
```

### `server/utils/cloudinary.ts`
```ts
import { v2 as cloudinary } from 'cloudinary'

// Otomatis baca CLOUDINARY_URL dari .env

export const uploadGambar = async (file: string, folder: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: `pengaduan-sekolah/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto' },
    ],
  })
  return result.secure_url
}

export const hapusGambar = async (url: string) => {
  const splits = url.split('/')
  const filename = splits[splits.length - 1]?.split('.')[0]
  const folder = splits[splits.length - 2]
  const subfolder = splits[splits.length - 3]
  const publicId = `${subfolder}/${folder}/${filename}`
  await cloudinary.uploader.destroy(publicId)
}
```

---

## Server Middleware

### `server/middleware/auth.ts`
```ts
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
]

export default defineEventHandler(async (event) => {
  const isApiRoute = event.path.startsWith('/api/')
  const isPublic = publicRoutes.includes(event.path)

  if (isApiRoute && !isPublic) {
    const session = await getUserSession(event)
    if (!session.user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
  }
})
```

---

## Client Middleware

### `app/middleware/auth.ts`
```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo('/')
  }
})
```

### `app/middleware/admin.ts`
```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo('/')
  }
  if (user.value?.role !== 'ADMIN') {
    return navigateTo('/siswa')
  }
})
```

---

## Composables

### `app/composables/useAuth.ts`
```ts
export const useAuth = () => {
  const { user, loggedIn, fetch: fetchSession, clear } = useUserSession()

  const login = async (body: LoginRequest) => {
    try {
      const res = await $fetch<ApiResponse<AuthUser>>('/api/auth/login', {
        method: 'POST',
        body,
      })
      await fetchSession()
      return res
    } catch (error: any) {
      throw error.data?.message ?? 'Terjadi kesalahan saat login'
    }
  }

  const register = async (body: RegisterRequest) => {
    try {
      const res = await $fetch<ApiResponse<AuthUser>>('/api/auth/register', {
        method: 'POST',
        body,
      })
      await fetchSession()
      return res
    } catch (error: any) {
      throw error.data?.message ?? 'Terjadi kesalahan saat registrasi'
    }
  }

  return {
    user,
    loggedIn,
    login,
    register,
    clear, // dipakai langsung untuk logout: @click="clear"
  }
}
```

### `app/composables/useAspirasi.ts`
```ts
export const useAspirasi = () => {
  const aspirasi = ref<Aspirasi[]>([])
  const detail = ref<Aspirasi | null>(null)
  const loading = ref(false)
  const error = ref('')

  const fetchAspirasiSaya = async () => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<Aspirasi[]>>('/api/aspirasi/saya')
      aspirasi.value = res.data ?? []
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil data aspirasi'
    } finally {
      loading.value = false
    }
  }

  const fetchDetail = async (id: string) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<Aspirasi>>(`/api/aspirasi/${id}`)
      detail.value = res.data ?? null
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil detail aspirasi'
    } finally {
      loading.value = false
    }
  }

  const buatAspirasi = async (body: {
    judul: string
    deskripsi: string
    kategori: KategoriEnum
    fotoUrl?: string
  }) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<Aspirasi>>('/api/aspirasi', {
        method: 'POST',
        body,
      })
      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengirim aspirasi'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return { aspirasi, detail, loading, error, fetchAspirasiSaya, fetchDetail, buatAspirasi }
}
```

### `app/composables/useAdminAspirasi.ts`
```ts
export const useAdminAspirasi = () => {
  const aspirasi = ref<Aspirasi[]>([])
  const detail = ref<Aspirasi | null>(null)
  const loading = ref(false)
  const error = ref('')

  const filter = reactive({
    status: '' as StatusAspirasi | '',
    kategori: '' as KategoriEnum | '',
    userId: '',
    dari: '',
    sampai: '',
  })

  const fetchSemuaAspirasi = async () => {
    loading.value = true
    error.value = ''
    try {
      const query: Record<string, string> = {}
      if (filter.status) query.status = filter.status
      if (filter.kategori) query.kategori = filter.kategori
      if (filter.userId) query.userId = filter.userId
      if (filter.dari) query.dari = filter.dari
      if (filter.sampai) query.sampai = filter.sampai

      const res = await $fetch<ApiResponse<Aspirasi[]>>('/api/aspirasi', { query })
      aspirasi.value = res.data ?? []
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil data aspirasi'
    } finally {
      loading.value = false
    }
  }

  const fetchDetail = async (id: string) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<Aspirasi>>(`/api/aspirasi/${id}`)
      detail.value = res.data ?? null
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil detail aspirasi'
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (id: string, status: StatusAspirasi) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<Aspirasi>>(`/api/aspirasi/${id}`, {
        method: 'PATCH',
        body: { status },
      })
      const index = aspirasi.value.findIndex((a) => a.id === id)
      const item = aspirasi.value[index]
      if (index !== -1 && item) item.status = status
      if (detail.value?.id === id) detail.value.status = status
      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengupdate status'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const resetFilter = () => {
    filter.status = ''
    filter.kategori = ''
    filter.userId = ''
    filter.dari = ''
    filter.sampai = ''
  }

  return { aspirasi, detail, loading, error, filter, fetchSemuaAspirasi, fetchDetail, updateStatus, resetFilter }
}
```

### `app/composables/useUmpanBalik.ts`
```ts
export const useUmpanBalik = () => {
  const umpanBalik = ref<UmpanBalik[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchUmpanBalik = async (aspirasiId: string) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<UmpanBalik[]>>('/api/umpan-balik', {
        query: { aspirasiId },
      })
      umpanBalik.value = res.data ?? []
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil umpan balik'
    } finally {
      loading.value = false
    }
  }

  const buatUmpanBalik = async (aspirasiId: string, body: { pesan: string; statusBaru: StatusAspirasi }) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<UmpanBalik>>('/api/umpan-balik', {
        method: 'POST',
        query: { aspirasiId },
        body,
      })
      if (res.data) umpanBalik.value.push(res.data)
      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengirim umpan balik'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return { umpanBalik, loading, error, fetchUmpanBalik, buatUmpanBalik }
}
```

### `app/composables/useProgress.ts`
```ts
export const useProgress = () => {
  const progress = ref<ProgressPerbaikan[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchProgress = async (aspirasiId: string) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<ProgressPerbaikan[]>>('/api/progress', {
        query: { aspirasiId },
      })
      progress.value = res.data ?? []
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil data progress'
    } finally {
      loading.value = false
    }
  }

  const buatProgress = async (aspirasiId: string, body: { keterangan: string; persentase: number; fotoUrl?: string }) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<ProgressPerbaikan>>('/api/progress', {
        method: 'POST',
        query: { aspirasiId },
        body,
      })
      if (res.data) progress.value.push(res.data)
      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal menambah progress'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const updateProgress = async (id: string, body: { keterangan: string; persentase: number; fotoUrl?: string }) => {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ApiResponse<ProgressPerbaikan>>(`/api/progress/${id}`, {
        method: 'PATCH',
        body,
      })
      const index = progress.value.findIndex((p) => p.id === id)
      const item = progress.value[index]
      if (index !== -1 && item) {
        item.keterangan = body.keterangan
        item.persentase = body.persentase
        item.fotoUrl = body.fotoUrl ?? null
      }
      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengupdate progress'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const hapusProgress = async (id: string) => {
    loading.value = true
    error.value = ''
    try {
      await $fetch(`/api/progress/${id}`, { method: 'DELETE' })
      progress.value = progress.value.filter((p) => p.id !== id)
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal menghapus progress'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const persentaseTerakhir = computed(() => {
    if (progress.value.length === 0) return 0
    return progress.value[progress.value.length - 1]?.persentase ?? 0
  })

  return { progress, loading, error, persentaseTerakhir, fetchProgress, buatProgress, updateProgress, hapusProgress }
}
```

### `app/composables/useUpload.ts`
```ts
export const useUpload = () => {
  const loading = ref(false)
  const error = ref('')

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const uploadGambar = async (file: File, folder: string = 'misc') => {
    loading.value = true
    error.value = ''
    try {
      const base64 = await fileToBase64(file)
      const res = await $fetch<ApiResponse<{ url: string }>>('/api/upload', {
        method: 'POST',
        body: { file: base64, folder },
      })
      return res.data?.url ?? ''
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengupload gambar'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return { loading, error, uploadGambar }
}
```

---

## API Endpoints

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| POST | `/api/auth/login` | Semua | Login |
| POST | `/api/auth/register` | Semua | Register siswa |
| POST | `/api/auth/init-admin` | - | Buat admin pertama (hapus setelah dipakai) |
| GET | `/api/aspirasi` | Admin | List semua aspirasi + filter |
| POST | `/api/aspirasi` | Siswa | Buat aspirasi baru |
| GET | `/api/aspirasi/saya` | Siswa | List aspirasi milik siswa login |
| GET | `/api/aspirasi/[id]` | Admin & Siswa | Detail aspirasi |
| PATCH | `/api/aspirasi/[id]` | Admin | Update status aspirasi |
| GET | `/api/umpan-balik` | Admin & Siswa | List umpan balik per aspirasi |
| POST | `/api/umpan-balik` | Admin | Buat umpan balik |
| GET | `/api/progress` | Admin & Siswa | List progress per aspirasi |
| POST | `/api/progress` | Admin | Tambah progress |
| PATCH | `/api/progress/[id]` | Admin | Update progress |
| DELETE | `/api/progress/[id]` | Admin | Hapus progress |
| POST | `/api/upload` | Admin & Siswa | Upload gambar ke Cloudinary |

---

## Hal Penting yang Perlu Diingat

### Shared directory
- `shared/types/` → **auto-import** (interface, type, enum)
- `shared/utils/` → **auto-import** (helper pure JS)
- `shared/schemas/` → **manual import** via `#shared/schemas/nama.schema`

### Password hashing
- Pakai `hashPassword` dan `verifyPassword` dari `nuxt-auth-utils`
- Tidak pakai bcrypt karena sudah ada bawaan nuxt-auth-utils
- `hashPassword` hanya bisa dipakai di dalam konteks Nuxt (server/)

### Session
- Simpan data minimal di session: `id, nis, nama, role, kelas`
- Logout cukup pakai `clear()` dari `useUserSession()` langsung di component
- Tidak perlu API endpoint logout

### Upload gambar
- Gambar diupload ke Cloudinary saat form di-submit, bukan saat file dipilih
- File dipilih → disimpan ke `ref<File>` → diupload saat submit
- Folder Cloudinary otomatis terbuat saat pertama upload

### Prisma
- `prisma generate` aman dijalankan berkali-kali
- `prisma migrate dev` sudah include generate otomatis
- Hapus data: urutan penting — hapus relasi dulu baru parent

### Tidak ada seed
- Data admin dibuat lewat `/api/auth/init-admin` (hapus file setelah dipakai)
- Data lain masuk lewat API normal seiring development

---

## Progress Saat Ini
- [x] Setup project (Nuxt 4, Prisma, PostgreSQL)
- [x] Prisma schema & model
- [x] Shared types & enums
- [x] Shared schemas (Zod)
- [x] Server utils (db, guard, cloudinary)
- [x] Server middleware (auth)
- [x] Client middleware (auth, admin)
- [x] API auth (login, register)
- [x] API aspirasi (CRUD)
- [x] API umpan balik
- [x] API progress
- [x] API upload gambar
- [x] Composables (useAuth, useAspirasi, useAdminAspirasi, useUmpanBalik, useProgress, useUpload)
- [ ] Halaman & UI (belum dikerjakan)
