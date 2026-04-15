// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    nis: string
    nama: string
    role: 'SISWA' | 'ADMIN'
    kelas: string
  }

  interface UserSession {
    loggedInAt: Date
  }
}

export {}