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

      const res = await $fetch<ApiResponse<Aspirasi[]>>('/api/aspirasi', {
        query
      })
      aspirasi.value = res.data ?? []
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil data aspirasi'
    }finally{
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
    }finally{
      loading.value = false
    }
  }

  const updateStatus = async (id: string, status: StatusAspirasi) => {
    loading.value = true
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<Aspirasi>>('/api/aspirasi/:id',{
        method: 'PATCH',
        body: { status }
      })

      const index = aspirasi.value.findIndex((a) => a.id === id)
      const item = aspirasi.value[index]
      if (index !== -1 && item) item.status = status

      if (detail.value?.id === id) detail.value.status = status
    } catch (err: any) {
      
    }
  }

  const resetFilter = () => {
    filter.status = ''
    filter.kategori = ''
    filter.userId = ''
    filter.dari = ''
    filter.sampai = ''
  }

  return {
    aspirasi,
    detail,
    loading,
    error,
    filter,
    fetchSemuaAspirasi,
    fetchDetail,
    updateStatus,
    resetFilter,
  }
}
