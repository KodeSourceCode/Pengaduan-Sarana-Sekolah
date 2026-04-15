import { base64 } from "zod"

export const useUpload = () => {
  const loading = ref(false)
  const error = ref('')

  const uploadGambar = async (file: File, folder: string = 'misc') => {
    loading.value = true
    error.value = ''

    try {
      const base64 = await fileToBase64(file)

      const res = await $fetch<ApiResponse<{ url: string }>>('/api/upload', {
        method: 'POST',
        body: { file: base64, folder }
      })

      return res.data?.url ?? ''
    } catch (err: any) {
      error.value = err.data?.message ?? 'Gagal mengupload gambar'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return {
    loading,
    error,
    uploadGambar,
  }
}
