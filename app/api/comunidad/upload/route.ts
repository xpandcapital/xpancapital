import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { getAuthUser } from '@/lib/supabase/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Body size limit para App Router (Vercel Pro: hasta 50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

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
  'application/vnd.rar',
  'application/octet-stream',
]
const MAX_SIZE = 50 * 1024 * 1024 // 50MB total (límite Vercel Pro)
const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20MB para imágenes (se comprimen)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024  // 50MB video
const IMAGE_MAX_WIDTH = 1920
const WEBP_QUALITY = 80

function getMediaType(mime: string): 'imagen' | 'video' | 'archivo' {
  if (mime.startsWith('image/')) return 'imagen'
  if (mime.startsWith('video/')) return 'video'
  return 'archivo'
}

async function compressImage(buffer: Buffer, mimeType: string): Promise<{ compressed: Buffer | null; thumbnail: Buffer | null; compressedSize: number }> {
  try {
    let pipeline = sharp(buffer)
    const metadata = await pipeline.metadata()
    if (metadata.width && metadata.width > IMAGE_MAX_WIDTH) {
      pipeline = pipeline.resize(IMAGE_MAX_WIDTH)
    }
    const compressed = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
    let thumbnail: Buffer | null = null
    if (metadata.width && metadata.width > 400) {
      thumbnail = await sharp(buffer).resize(400).webp({ quality: 70 }).toBuffer()
    }
    return { compressed, thumbnail, compressedSize: compressed.length }
  } catch {
    // Si falla sharp, devolver null para usar el original
    return { compressed: null, thumbnail: null, compressedSize: 0 }
  }
}

function getVideoThumbnail(buffer: Buffer): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const ffmpeg = require('fluent-ffmpeg') as any
      const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
      ffmpeg.setFfmpegPath(ffmpegPath)

      const tempDir = require('os').tmpdir()
      const inputPath = `${tempDir}/comunidad-input-${Date.now()}.mp4`
      const outputPath = `${tempDir}/comunidad-thumb-${Date.now()}.png`

      require('fs').writeFileSync(inputPath, buffer)

      ffmpeg(inputPath)
        .screenshots({ timestamps: ['1'], filename: require('path').basename(outputPath), folder: tempDir })
        .on('end', () => {
          try {
            const thumb = require('fs').readFileSync(outputPath)
            require('fs').unlinkSync(inputPath)
            require('fs').unlinkSync(outputPath)
            resolve(thumb)
          } catch { resolve(null) }
        })
        .on('error', () => {
          try { require('fs').unlinkSync(inputPath) } catch {}
          resolve(null)
        })
    } catch { resolve(null) }
  })
}

async function compressVideo(buffer: Buffer): Promise<{ compressed: Buffer | null; thumbnail: Buffer | null; compressedSize: number }> {
  try {
    const ffmpeg = require('fluent-ffmpeg') as any
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
    ffmpeg.setFfmpegPath(ffmpegPath)

    const tempDir = require('os').tmpdir()
    const inputPath = `${tempDir}/comunidad-video-in-${Date.now()}.mp4`
    const outputPath = `${tempDir}/comunidad-video-out-${Date.now()}.mp4`

    require('fs').writeFileSync(inputPath, buffer)

    return new Promise((resolve) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
          '-c:v', 'libx264', '-crf', '26', '-preset', 'fast',
          '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'
        ])
        .output(outputPath)
        .on('end', async () => {
          try {
            const compressed = require('fs').readFileSync(outputPath)
            const thumb = await getVideoThumbnail(Buffer.from(require('fs').readFileSync(inputPath)))
            require('fs').unlinkSync(inputPath)
            require('fs').unlinkSync(outputPath)
            resolve({ compressed, thumbnail: null, compressedSize: compressed.length })
          } catch {
            try { require('fs').unlinkSync(inputPath); require('fs').unlinkSync(outputPath) } catch {}
            resolve({ compressed: null, thumbnail: null, compressedSize: 0 })
          }
        })
        .on('error', () => {
          try { require('fs').unlinkSync(inputPath) } catch {}
          resolve({ compressed: null, thumbnail: null, compressedSize: 0 })
        })
        .run()
    })
  } catch {
    return { compressed: null, thumbnail: null, compressedSize: 0 }
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const postId = formData.get('post_id') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 })
    }

    const mediaType = getMediaType(file.type)
    const isImage = mediaType === 'imagen'
    const isVideo = mediaType === 'video'

    const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_FILE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: `Tipo de archivo no permitido: ${file.type}` }, { status: 400 })
    }

    const maxFileSize = isImage ? MAX_IMAGE_SIZE : isVideo ? MAX_VIDEO_SIZE : MAX_SIZE
    if (file.size > maxFileSize) {
      const maxMB = isImage ? '20MB' : isVideo ? '50MB' : '50MB'
      return NextResponse.json({ success: false, error: `Archivo demasiado grande. Máximo: ${maxMB}. Tu archivo: ${(file.size / (1024*1024)).toFixed(1)}MB` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60)
    const folder = `${user.empresaId}/comunidad`

    // Subir original
    const originalPath = `${folder}/${timestamp}-${random}-orig.${extension}`
    const originalUpload = await supabase.storage
      .from('cms-images')
      .upload(originalPath, buffer, { contentType: file.type, upsert: false })

    if (originalUpload.error) {
      return NextResponse.json({ success: false, error: originalUpload.error.message }, { status: 500 })
    }

    const { data: originalUrlData } = supabase.storage.from('cms-images').getPublicUrl(originalPath)
    const urlOriginal = originalUrlData.publicUrl

    let urlComprimida: string | undefined
    let urlThumbnail: string | undefined
    let tamañoComprimido: number | undefined

    // Comprimir si es imagen o video
    if (isImage) {
      const { compressed, thumbnail, compressedSize } = await compressImage(buffer, file.type)
      if (compressed) {
        const compressedPath = `${folder}/${timestamp}-${random}-comp.webp`
        await supabase.storage.from('cms-images').upload(compressedPath, compressed, { contentType: 'image/webp', upsert: false })
        const { data: compUrlData } = supabase.storage.from('cms-images').getPublicUrl(compressedPath)
        urlComprimida = compUrlData.publicUrl
        tamañoComprimido = compressedSize
      }
      if (thumbnail) {
        const thumbPath = `${folder}/${timestamp}-${random}-thumb.webp`
        await supabase.storage.from('cms-images').upload(thumbPath, thumbnail, { contentType: 'image/webp', upsert: false })
        const { data: thumbUrlData } = supabase.storage.from('cms-images').getPublicUrl(thumbPath)
        urlThumbnail = thumbUrlData.publicUrl
      }
    } else if (isVideo) {
      const { compressed, compressedSize } = await compressVideo(buffer)
      if (compressed) {
        const compressedPath = `${folder}/${timestamp}-${random}-comp.mp4`
        await supabase.storage.from('cms-images').upload(compressedPath, compressed, { contentType: 'video/mp4', upsert: false })
        const { data: compUrlData } = supabase.storage.from('cms-images').getPublicUrl(compressedPath)
        urlComprimida = compUrlData.publicUrl
        tamañoComprimido = compressedSize
      }
    }

    // Siempre crear registro en comunidad_post_media
    const { data: mediaRecord, error: mediaError } = await supabase
      .from('comunidad_post_media')
      .insert({
        post_id: postId || null,
        tipo: mediaType,
        url_original: urlOriginal,
        url_comprimida: urlComprimida || null,
        url_thumbnail: urlThumbnail || null,
        mime_type: file.type,
        nombre_archivo: baseName,
        tamaño_original: file.size,
        tamaño_comprimido: tamañoComprimido || null
      })
      .select('id')
      .single()

    if (mediaError) {
      return NextResponse.json({ success: false, error: mediaError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: mediaRecord?.id,
        url_original: urlOriginal,
        url_comprimida: urlComprimida || null,
        url_thumbnail: urlThumbnail || null,
        tipo: mediaType,
        mime_type: file.type,
        nombre_archivo: baseName,
        tamaño_original: file.size,
        tamaño_comprimido: tamañoComprimido || null
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    const postId = searchParams.get('post_id')

    if (!mediaId && !postId) {
      return NextResponse.json({ success: false, error: 'Se requiere id o post_id' }, { status: 400 })
    }

    let mediaRecords: { id: string; url_original: string; url_comprimida?: string; url_thumbnail?: string }[] = []

    if (mediaId) {
      const { data } = await supabase.from('comunidad_post_media').select('id, url_original, url_comprimida, url_thumbnail').eq('id', mediaId)
      mediaRecords = data || []
    } else {
      const { data } = await supabase.from('comunidad_post_media').select('id, url_original, url_comprimida, url_thumbnail').eq('post_id', postId)
      mediaRecords = data || []
    }

    for (const media of mediaRecords) {
      const paths: string[] = []
      const extractPath = (url: string | undefined) => {
        if (!url) return
        const parts = url.split('/cms-images/')
        if (parts[1]) paths.push(parts[1])
      }
      extractPath(media.url_original)
      extractPath(media.url_comprimida)
      extractPath(media.url_thumbnail)

      if (paths.length > 0) {
        await supabase.storage.from('cms-images').remove(paths)
      }
      await supabase.from('comunidad_post_media').delete().eq('id', media.id)
    }

    return NextResponse.json({ success: true, deleted: mediaRecords.length })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
