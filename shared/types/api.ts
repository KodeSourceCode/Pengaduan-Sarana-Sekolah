import type { KategoriEnum, StatusAspirasi } from "./enums";

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PublicAspirasiListItem {
  id: string;
  judul: string;
  kategori: KategoriEnum;
  status: StatusAspirasi;
  createdAt: string;
  updatedAt: string;
  fotoUrl: string | null;
  user: {
    nama: string;
    kelas: string | null;
  };
  _count: {
    umpanBalik: number;
    progressPerbaikan: number;
  };
}

export interface PublicAspirasiPaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PublicAspirasiTransparencyStats {
  totalAspirasi: number;
  totalUmpanBalik: number;
  totalProgressPerbaikan: number;
  totalSiswa: number;
}

export interface PublicAspirasiListPayload {
  items: PublicAspirasiListItem[];
  pagination: PublicAspirasiPaginationMeta;
  stats: PublicAspirasiTransparencyStats;
  totalAllAspirasi: number;
}
