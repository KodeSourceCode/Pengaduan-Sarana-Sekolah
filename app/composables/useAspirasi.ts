export const useAspirasi = () => {
  const aspirasi = useState<Aspirasi[]>('aspirasi-saya', () => [])
  const detail = useState<Aspirasi | null>('aspirasi-detail', () => null)
  const loading = ref(false)
  const error = ref('')

  const fetchAspirasiSaya = async (headers?: Record<string, string>) => {
    loading.value = true
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<Aspirasi[]>>('/api/aspirasi/saya', {headers})
      aspirasi.value = res.data ?? []
      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil data aspirasi'
    } finally{
      loading.value = false
    }
  }

  const fetchDetail = async (id: string, headers?: Record<string, string>) => {
    loading.value = true
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<Aspirasi>>(`/api/aspirasi/${id}`, {headers})
      detail.value = res.data ?? null
      return res.data
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengambil detail aspirasi'
    }finally{
      loading.value = false
    }
  }

  const buatAspirasi = async (body: {
    judul: string,
    deskripsi: string,
    kategori: KategoriEnum,
    fotoUrl?: string
  }, headers?: Record<string, string>) => {
    loading.value = true
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<Aspirasi>>('/api/aspirasi', {
        method: 'POST',
        body,
        headers
      })

      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengirim aspirasi'
      throw err      
    } finally {
      loading.value = false
    }
  }

  return {
    aspirasi,
    detail,
    loading,
    error,
    fetchAspirasiSaya,
    fetchDetail,
    buatAspirasi
  }
}
