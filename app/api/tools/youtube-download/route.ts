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

    // Return video info with download options via external services
    // Users can right-click > save as, or use browser download managers
    const downloadLinks = [
      {
        label: 'Descargar Video (Y2Mate)',
        url: `https://www.y2mate.com/youtube/${videoId}`,
        quality: quality === 'best' ? '1080p' : quality === '720p' ? '720p' : '480p',
      },
      {
        label: 'Descargar Video (SaveFrom)',
        url: `https://en.savefrom.net/1-youtube-video-downloader-360/?url=https://www.youtube.com/watch?v=${videoId}`,
        quality: 'multiple',
      },
      {
        label: 'Descargar Audio MP3',
        url: `https://www.y2mate.com/youtube-mp3/${videoId}`,
        quality: 'audio',
      },
    ]

    return NextResponse.json({
      success: true,
      title,
      thumbnail,
      downloadLinks,
      videoId,
      size: '',
      downloadUrl: downloadLinks[0].url,
      isDirectDownload: false,
    })

  } catch (error: any) {
    console.error('[YouTube Download Error]', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}