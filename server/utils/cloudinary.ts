import {v2 as cloudinary} from 'cloudinary'

export const uploadGambar = async (file: string, folder: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: `pengaduan-sekolah/${folder}`,
    allowed_formats: ['jpg', 'webp', 'png'],
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto' },
    ]
  })

  return result.secure_url
}

export const hapusGambar = async (url: string) => {
  const splits = url.split('/')
  const fileName = splits[splits.length - 1]?.split('.')[0]
  const folder = splits[splits.length - 2]
  const subFolder = splits[splits.length - 3]
  const publicId = `${subFolder}/${folder}/${fileName}`

  await cloudinary.uploader.destroy(publicId)
}