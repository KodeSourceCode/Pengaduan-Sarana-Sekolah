export interface AdminSiswaItem {
  id: string;
  nis: string;
  nama: string;
  email: string;
  kelas: string | null;
  createdAt: string;
}

export const useAdminSiswa = () => {
  const siswa = useState<AdminSiswaItem[]>("admin-siswa", () => []);
  const loading = ref(false);
  const error = ref("");

  const fetchSiswa = async (headers?: Record<string, string>) => {
    loading.value = true;
    error.value = "";

    try {
      const res = await $fetch<ApiResponse<AdminSiswaItem[]>>(
        "/api/admin/siswa",
        {
          headers,
        },
      );

      siswa.value = res.data ?? [];
      return res;
    } catch (err: any) {
      error.value = err.data?.message ?? "Gagal mengambil data siswa";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const registerSiswa = async (body: RegisterSiswaByAdminRequest) => {
    loading.value = true;
    error.value = "";

    try {
      const res = await $fetch<ApiResponse<AuthUser>>(
        "/api/auth/register-siswa",
        {
          method: "POST",
          body,
        },
      );

      return res;
    } catch (err: any) {
      error.value = err.data?.message ?? "Gagal membuat akun siswa";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    siswa,
    loading,
    error,
    fetchSiswa,
    registerSiswa,
  };
};
