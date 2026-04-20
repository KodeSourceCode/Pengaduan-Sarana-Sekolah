export const useAdminAspirasi = () => {
  const aspirasi = useState<Aspirasi[]>("semua-aspirasi", () => []);
  const detail = useState<Aspirasi | null>("detail-aspirasi", () => null);

  // Granular loading/error states
  const listLoading = ref(false);
  const detailLoading = ref(false);
  const updateStatusLoading = ref(false);

  const listError = ref("");
  const detailError = ref("");
  const updateStatusError = ref("");

  // Backward compatibility computed
  const loading = computed(
    () => listLoading.value || detailLoading.value || updateStatusLoading.value,
  );
  const error = computed(
    () => listError.value || detailError.value || updateStatusError.value,
  );

  const filter = reactive({
    judul: "",
    createdAt: "",
    updatedAt: "",
    userId: "",
    kategori: "" as KategoriEnum | "",
    status: "" as StatusAspirasi | "",
  });

  const fetchSemuaAspirasi = async (headers?: Record<string, string>) => {
    listLoading.value = true;
    listError.value = "";

    try {
      const query: Record<string, string> = {};

      if (filter.judul.trim()) query.judul = filter.judul.trim();
      if (filter.createdAt) query.createdAt = filter.createdAt;
      if (filter.updatedAt) query.updatedAt = filter.updatedAt;
      if (filter.userId) query.userId = filter.userId;
      if (filter.kategori) query.kategori = filter.kategori;
      if (filter.status) query.status = filter.status;

      const res = await $fetch<ApiResponse<Aspirasi[]>>("/api/aspirasi", {
        query,
        headers,
      });
      aspirasi.value = res.data ?? [];
      return res;
    } catch (err: any) {
      listError.value = err.data?.message ?? "Gagal mengambil data aspirasi";
    } finally {
      listLoading.value = false;
    }
  };

  const fetchDetail = async (id: string, headers?: Record<string, string>) => {
    detailLoading.value = true;
    detailError.value = "";

    try {
      const res = await $fetch<ApiResponse<Aspirasi>>(`/api/aspirasi/${id}`, {
        headers,
      });
      detail.value = res.data ?? null;
      return res;
    } catch (err: any) {
      detailError.value =
        err.data?.message ?? "Gagal mengambil detail aspirasi";
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const updateStatus = async (id: string, status: StatusAspirasi) => {
    updateStatusLoading.value = true;
    updateStatusError.value = "";

    try {
      const res = await $fetch<ApiResponse<Aspirasi>>(`/api/aspirasi/${id}`, {
        method: "PATCH",
        body: { status },
      });

      const index = aspirasi.value.findIndex((a) => a.id === id);
      const item = aspirasi.value[index];
      if (index !== -1 && item) item.status = status;

      if (detail.value?.id === id) detail.value.status = status;

      return res;
    } catch (err: any) {
      updateStatusError.value =
        err.data?.message ?? "Gagal memperbarui status aspirasi";
      throw err;
    } finally {
      updateStatusLoading.value = false;
    }
  };

  const resetFilter = () => {
    filter.judul = "";
    filter.createdAt = "";
    filter.updatedAt = "";
    filter.userId = "";
    filter.kategori = "";
    filter.status = "";
  };

  return {
    aspirasi,
    detail,
    loading,
    error,
    listLoading,
    detailLoading,
    updateStatusLoading,
    listError,
    detailError,
    updateStatusError,
    filter,
    fetchSemuaAspirasi,
    fetchDetail,
    updateStatus,
    resetFilter,
  };
};
