export const useUmpanBalik = () => {
  const umpanBalik = ref<UmpanBalik[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchUmpanBalik = async (aspirasiId: string) => {
    loading.value = false
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<UmpanBalik[]>>('/api/umpan-balik', {
        query: { aspirasiId }
      })

      umpanBalik.value = res.data ?? []
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil umpan balik'
    }finally{
      loading.value = false
    }
  }

  const buatUmpanBalik = async (
    aspirasiId: string,
    body: {
      pesan: string,
      statusBaru: StatusAspirasi
    }
  ) => {
    loading.value = false
    error.value = ''
    
    try {
      const res = await $fetch<ApiResponse<UmpanBalik>>('/api/umpan-balik', {
        method: 'POST',
        query: { aspirasiId },
        body
      })

      if(res.data) umpanBalik.value.push(res.data)

      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengirim umpan balik'
      throw error.value
    }finally{
      loading.value = false
    }
  }

  return {
    umpanBalik,
    loading,
    error,
    fetchUmpanBalik,
    buatUmpanBalik,
  }
}
