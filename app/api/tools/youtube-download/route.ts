import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

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
      const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
      const noembedData = await noembedRes.json()
      if (noembedData.title) title = noembedData.title
    } catch {}

    // Try multiple download services
    const services = [
      // Service 1: cobalt.tools
      async () => {
        const res = await fetch('https://api.cobalt.tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ url, videoQuality: '1080', downloadMode: 'auto', filenameStyle: 'basic' }),
        })
        const data = await res.json()
        if (data.url) return { url: data.url, filename: data.filename }
        if (data.status === 'picker' && data.picker?.[0]?.url) return { url: data.picker[0].url, filename: data.filename }
        return null
      },
      // Service 2: cobalt.tools (direct video URL)
      async () => {
        const res = await fetch('https://api.cobalt.tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}`, videoQuality: '720', downloadMode: 'auto' }),
        })
        const data = await res.json()
        if (data.url) return { url: data.url, filename: data.filename }
        return null
      },
    ]

    for (const getService of services) {
      try {
        const result = await getService()
        if (result?.url) {
          return NextResponse.json({
            success: true,
            title,
            downloadUrl: result.url,
            size: '',
            thumbnail,
          })
        }
      } catch (e) {
        console.error('[YouTube DL] Service error:', e)
        continue
      }
    }

    // All services failed - return video info with YouTube link as fallback
    return NextResponse.json({
      success: true,
      title,
      downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
      size: '',
      thumbnail,
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