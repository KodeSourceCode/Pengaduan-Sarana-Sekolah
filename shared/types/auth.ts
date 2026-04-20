// Request
export interface LoginRequest {
  nis: string;
  password: string;
}

export interface RegisterSiswaByAdminRequest {
  nis: string;
  nama: string;
  email: string;
  kelas: string;
}

// Response — pakai ApiResponse yang sudah ada
export interface AuthUser {
  id: string;
  nis: string;
  nama: string;
  email: string;
  kelas: string;
  role: "SISWA" | "ADMIN";
  createdAt: string;
}
