export const useProgress = () => {
  const progress = ref<ProgressPerbaikan[]>([])
  const loading = ref(false)
  const error = ref('')
  
  const fetchProgress = async (aspirasiId: string) => {
    loading.value = false
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<ProgressPerbaikan[]>>('/api/progress', {
        query: { aspirasiId }
      })

      progress.value = res.data ?? []
    } catch (err: any) {
       error.value = err.data?.message ?? 'Gagal mengambil data progress'
    } finally {
      loading.value = false
    }
  }

  const buatProgress = async (
    aspirasiId: string,
    body: {
      keterangan: string,
      persentase: number,
      fotoUrl?: string
    }
  ) => {
    loading.value = false
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<ProgressPerbaikan>>('/api/progress', {
        method: 'POST',
        query: { aspirasiId },
        body
      })

      if(res.data) progress.value.push(res.data)

      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal menambah progress'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const updateProgress = async (
    id: string,
    body: {
      keterangan: string,
      persentase: number,
      fotoUrl?: string
    }
  ) => {
    loading.value = false
    error.value = ''

    try {
      const res = await $fetch<ApiResponse<ProgressPerbaikan>>(`/api/progress/${id}`, {
        method: 'PATCH',
        body
      })

      const index = progress.value.findIndex((p) => p.id === id)
      const item = progress.value[index]
      if (index !== -1 && item) {
        item.keterangan = body.keterangan
        item.persentase = body.persentase
        item.fotoUrl = body.fotoUrl ?? null
      }

      return res
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengupdate progress'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const hapusProgress = async (id: string) => {
    loading.value = false
    error.value = ''

    try {
      await $fetch(`/api/progress/${id}`, {
        method: 'DELETE'
      })

      progress.value = progress.value.filter((p) => p.id !== id)
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal menghapus progress'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const persentaseTerakhir = computed(() => {
    if (progress.value.length === 0) return 0
    return progress.value[progress.value.length - 1]?.persentase ?? 0
  })

  return {
    progress,
    loading,
    error,
    persentaseTerakhir,
    fetchProgress,
    buatProgress,
    updateProgress,
    hapusProgress,
  }
}
