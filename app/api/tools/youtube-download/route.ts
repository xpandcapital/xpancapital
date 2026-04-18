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

    // Build download links using multiple services
    // Format: provide direct links the user can open
    const downloadLinks = [
      {
        label: 'Video 1080p (MP4)',
        url: `https://pi.ytub.top/pi/down/${videoId}`,
        quality: '1080p',
      },
      {
        label: 'Video 720p (MP4)',
        url: `https://pi.ytub.top/pi/down/${videoId}/720`,
        quality: '720p',
      },
      {
        label: 'Solo Audio (MP3)',
        url: `https://pi.ytub.top/pi/mp3/${videoId}`,
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