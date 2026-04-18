import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, quality } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL es requerida' }, { status: 400 })
    }

    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|p\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(ytRegex)
    if (!match) {
      return NextResponse.json({ error: 'URL de YouTube no válida' }, { status: 400 })
    }

    const videoId = match[1]
    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

    // Get video title
    let title = `Video ${videoId}`
    try {
      const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })
      const noembedData = await noembedRes.json()
      if (noembedData.title) title = noembedData.title
    } catch {}

    // Try cobalt.tools API
    const qualityMap: Record<string, string> = { best: '1080', '720p': '720', '480p': '480' }
    const videoQuality = qualityMap[quality] || '1080'

    try {
      const cobaltRes = await fetch('https://api.cobalt.tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url,
          videoQuality,
          filenameStyle: 'pretty',
          downloadMode: 'auto',
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.json()

        // cobalt returns { status: "redirect"|"tunnel"|"picker", url, filename, ... }
        if (cobaltData.url) {
          return NextResponse.json({
            success: true,
            title: cobaltData.filename || title,
            downloadUrl: cobaltData.url,
            size: '',
            thumbnail,
            isDirectDownload: true,
          })
        }

        if (cobaltData.status === 'picker' && cobaltData.picker?.length > 0) {
          // Pick best quality video from picker
          const videos = cobaltData.picker.filter((p: any) => p.type === 'video')
          const bestVideo = videos.find((v: any) => v.quality === qualityMap[quality]) || videos[0] || cobaltData.picker[0]
          if (bestVideo?.url) {
            return NextResponse.json({
              success: true,
              title: cobaltData.filename || title,
              downloadUrl: bestVideo.url,
              size: '',
              thumbnail,
              isDirectDownload: true,
            })
          }
        }

        if (cobaltData.error) {
          return NextResponse.json({
            success: false,
            error: cobaltData.error.code === 'content.video_unavailable' || cobaltData.error.code === 'content.video_private'
              ? 'Video no disponible o es privado. Intenta con un video público.'
              : `Error: ${cobaltData.error.code || 'desconocido'}`,
          }, { status: 400 })
        }
      }
    } catch (err: any) {
      console.error('[YouTube DL] Cobalt API error:', err?.message || err)
    }

    return NextResponse.json({
      success: false,
      error: 'No se pudo procesar la descarga. El servicio puede estar temporalmente no disponible. Intenta de nuevo más tarde.',
    }, { status: 503 })

  } catch (error: any) {
    console.error('[YouTube Download Error]', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}