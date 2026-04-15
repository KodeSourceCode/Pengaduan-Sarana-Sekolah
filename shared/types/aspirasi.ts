import type { KategoriEnum, StatusAspirasi } from "./enums";

export interface Aspirasi {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: KategoriEnum;
  status: StatusAspirasi;
  fotoUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    nis: string;
    nama: string;
    kelas: string | null;
  };
  umpanBalik?: UmpanBalik[];
  progressPerbaikan?: ProgressPerbaikan[];
  _count?: {
    umpanBalik: number;
    progressPerbaikan: number;
  };
}

export interface UmpanBalik {
  id: string;
  pesan: string;
  statusBaru: StatusAspirasi;
  aspirasiId: string;
  adminId: string;
  createdAt: string;
  admin?: {
    nama: string;
  };
}

export interface ProgressPerbaikan {
  id: string;
  keterangan: string;
  persentase: number;
  fotoUrl: string | null;
  aspirasiId: string;
  adminId: string;
  createdAt: string;
}
