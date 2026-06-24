"use server"

import { createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import sharp from 'sharp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed',
  'application/x-tar', 'application/gzip', 'application/x-gzip',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/json', 'application/xml', 'text/xml',
  'application/vnd.rar', 'application/x-compressed', 'application/octet-stream',
  'application/vnd.android.package-archive',
]
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
  'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/webm',
  'audio/x-m4a',
]
const IMAGE_MAX_WIDTH = 1920
const WEBP_QUALITY = 80

function getMediaType(mime: string): 'imagen' | 'video' | 'audio' | 'archivo' {
  if (mime.startsWith('image/')) return 'imagen'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'archivo'
}

export async function uploadMediaAction(formData: FormData) {
  const hdr = await headers()
  const userId = hdr.get('x-blis-user-id')
  const empresaId = hdr.get('x-blis-empresa-id')
  if (!userId || !empresaId) {
    return { success: false, error: 'No autorizado' }
  }

  const file = formData.get('file') as File | null
  const postId = formData.get('post_id') as string | null

  if (!file) return { success: false, error: 'No se proporcionó archivo' }

  const mediaType = getMediaType(file.type)
  const isImage = mediaType === 'imagen'
  const isVideo = mediaType === 'video'
  const isAudio = mediaType === 'audio'

  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : isVideo ? ALLOWED_VIDEO_TYPES : isAudio ? ALLOWED_AUDIO_TYPES : ALLOWED_FILE_TYPES
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: `Tipo de archivo no permitido: ${file.type}` }
  }

  const maxFileSize = isImage ? 20 * 1024 * 1024 : isVideo ? 50 * 1024 * 1024 : 50 * 1024 * 1024
  if (file.size > maxFileSize) {
    const maxMB = isImage ? '20MB' : '50MB'
    return { success: false, error: `Archivo demasiado grande. Máximo: ${maxMB}. Tu archivo: ${(file.size / (1024*1024)).toFixed(1)}MB` }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60)
  const nombreCompleto = `${baseName}.${extension}`
  const folder = `${empresaId}/comunidad`

  // Subir original
  const originalPath = `${folder}/${timestamp}-${random}-orig.${extension}`
  const { data: origData, error: origError } = await supabase.storage
    .from('cms-images')
    .upload(originalPath, buffer, { contentType: file.type, upsert: false })

  if (origError) {
    // Intentar crear bucket y reintentar
    if (origError.message?.includes('Bucket')) {
      await supabase.storage.createBucket('cms-images', { public: true })
      const retry = await supabase.storage.from('cms-images').upload(originalPath, buffer, { contentType: file.type, upsert: false })
      if (retry.error) return { success: false, error: retry.error.message }
    } else {
      return { success: false, error: origError.message }
    }
  }

  const { data: urlData } = supabase.storage.from('cms-images').getPublicUrl(originalPath)
  const urlOriginal = urlData.publicUrl

  let urlComprimida: string | null = null
  let urlThumbnail: string | null = null
  let tamañoComprimido: number | null = null

  // Comprimir imagen
  if (isImage) {
    try {
      let pipeline = sharp(buffer)
      const metadata = await pipeline.metadata()
      if (metadata.width && metadata.width > IMAGE_MAX_WIDTH) {
        pipeline = pipeline.resize(IMAGE_MAX_WIDTH)
      }
      const compressed = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
      const compressedSize = compressed.length
      const compressedPath = `${folder}/${timestamp}-${random}-comp.webp`
      await supabase.storage.from('cms-images').upload(compressedPath, compressed, { contentType: 'image/webp', upsert: false })
      const { data: compUrlData } = supabase.storage.from('cms-images').getPublicUrl(compressedPath)
      urlComprimida = compUrlData.publicUrl
      tamañoComprimido = compressedSize

      if (metadata.width && metadata.width > 400) {
        const thumb = await sharp(buffer).resize(400).webp({ quality: 70 }).toBuffer()
        const thumbPath = `${folder}/${timestamp}-${random}-thumb.webp`
        await supabase.storage.from('cms-images').upload(thumbPath, thumb, { contentType: 'image/webp', upsert: false })
        const { data: thumbUrlData } = supabase.storage.from('cms-images').getPublicUrl(thumbPath)
        urlThumbnail = thumbUrlData.publicUrl
      }
    } catch { /* sin compresión, usar original */ }
  }

  // Insertar en BD
  const { data: mediaRecord, error: mediaError } = await supabase
    .from('comunidad_post_media')
    .insert({
      post_id: postId || null,
      tipo: mediaType,
      url_original: urlOriginal,
      url_comprimida: urlComprimida,
      url_thumbnail: urlThumbnail,
      mime_type: file.type,
      nombre_archivo: baseName,
      tamaño_original: file.size,
      tamaño_comprimido: tamañoComprimido,
    })
    .select('id')
    .single()

  if (mediaError) return { success: false, error: mediaError.message }

  return {
    success: true,
    data: {
      id: mediaRecord.id,
      url_original: urlOriginal,
      url_comprimida: urlComprimida,
      url_thumbnail: urlThumbnail,
      tipo: mediaType,
      mime_type: file.type,
      nombre_archivo: nombreCompleto,
      tamaño_original: file.size,
      tamaño_comprimido: tamañoComprimido,
    }
  }
}
