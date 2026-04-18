import { NextRequest, NextResponse } from 'next/server'

const COBALT_API = 'https://api.cobalt.tools'

export async function POST(request: NextRequest) {
  try {
    const { url, quality } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL es requerida' }, { status: 400 })
    }

    // Validate YouTube URL
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    if (!ytRegex.test(url)) {
      return NextResponse.json({ error: 'URL de YouTube no válida' }, { status: 400 })
    }

    // Try cobalt.tools API first
    try {
      const cobaltRes = await fetch(COBALT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url,
          videoQuality: quality === 'best' ? '1080' : quality === '720p' ? '720' : '480',
          filenameStyle: 'basic',
          downloadMode: 'auto',
        }),
      })

      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.json()

        if (cobaltData.status === 'redirect' || cobaltData.status === 'tunnel') {
          return NextResponse.json({
            success: true,
            title: cobaltData.filename || `Video ${Date.now()}`,
            downloadUrl: cobaltData.url,
            size: '',
          })
        }

        if (cobaltData.status === 'picker' && cobaltData.picker) {
          const bestVideo = cobaltData.picker.find((item: any) => item.type === 'video') || cobaltData.picker[0]
          if (bestVideo?.url) {
            return NextResponse.json({
              success: true,
              title: cobaltData.filename || `Video ${Date.now()}`,
              downloadUrl: bestVideo.url,
              size: '',
            })
          }
        }

        if (cobaltData.error) {
          return NextResponse.json({
            success: false,
            error: cobaltData.error.code || 'Error en el servicio de descarga',
          }, { status: 400 })
        }
      }
    } catch (cobaltErr) {
      console.error('[YouTube Download] Cobalt error:', cobaltErr)
    }

    // Fallback: try ytoz.xyz or similar service
    try {
      const videoId = url.match(ytRegex)?.[1]
      if (videoId) {
        // Return video info with thumbnail and a redirect approach
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        const titleUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        const titleRes = await fetch(titleUrl)
        const titleData = await titleRes.json()
        const title = titleData.title || `Video ${videoId}`

        // Use cobalt with a direct link approach
        const cobaltDirectRes = await fetch(COBALT_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoQuality: '1080',
            filenameStyle: 'basic',
            downloadMode: 'auto',
          }),
        })

        if (cobaltDirectRes.ok) {
          const data = await cobaltDirectRes.json()
          if (data.url) {
            return NextResponse.json({
              success: true,
              title: data.filename || title,
              downloadUrl: data.url,
              size: '',
              thumbnail,
            })
          }
        }
      }
    } catch (fallbackErr) {
      console.error('[YouTube Download] Fallback error:', fallbackErr)
    }

    return NextResponse.json({
      success: false,
      error: 'No se pudo procesar la descarga. Intenta con otro enlace o verifica que el video sea público.',
    }, { status: 500 })

  } catch (error: any) {
    console.error('[YouTube Download Error]', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}