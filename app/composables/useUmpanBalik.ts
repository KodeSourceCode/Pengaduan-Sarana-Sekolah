export const useUmpanBalik = () => {
  const umpanBalik = ref<UmpanBalik[]>([]);
  const loading = ref(false);
  const error = ref("");

  const fetchUmpanBalik = async (
    aspirasiId: string,
    headers?: Record<string, string>,
  ) => {
    loading.value = true;
    error.value = "";

    try {
      const res = await $fetch<ApiResponse<UmpanBalik[]>>("/api/umpan-balik", {
        query: { aspirasiId },
        headers,
      });

      umpanBalik.value = res.data ?? [];
      return res;
    } catch (err: any) {
      error.value = err.data?.message ?? "Gagal mengambil umpan balik";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const buatUmpanBalik = async (
    aspirasiId: string,
    body: {
      pesan: string;
      statusBaru: StatusAspirasi;
    },
  ) => {
    loading.value = true;
    error.value = "";

    try {
      const res = await $fetch<ApiResponse<UmpanBalik>>("/api/umpan-balik", {
        method: "POST",
        query: { aspirasiId },
        body,
      });

      if (res.data) umpanBalik.value.push(res.data);

      return res;
    } catch (err: any) {
      error.value = err.data?.message ?? "Gagal mengirim umpan balik";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    umpanBalik,
    loading,
    error,
    fetchUmpanBalik,
    buatUmpanBalik,
  };
};
