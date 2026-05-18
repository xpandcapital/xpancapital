import { NextRequest, NextResponse } from 'next/server'
import { trace } from 'potrace'

export const maxDuration = 45
export const runtime = 'nodejs'

interface VectorLayer {
  id: string
  name: string
  color: string
  svgPath: string
  transform: string
  stitches: number
  viewBox: string
}

function traceImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    trace(buffer, (err: Error | null, svg: string) => {
      if (err) reject(err)
      else resolve(svg)
    })
  })
}

function extractPathsFromSVG(svg: string): { pathD: string; transform: string; viewBox: string } {
  const viewBox = (svg.match(/viewBox=["']([^"']+)["']/) || [])[1] || '0 0 800 800'

  const gMatch = svg.match(/<g[^>]*transform=["']([^"']+)["'][^>]*>/)
  const transform = gMatch ? gMatch[1] : ''

  const pathRegex = /<path[^>]*\sd=["']([^"']+)["'][^>]*\/?>/g
  const pathDs: string[] = []
  let match
  while ((match = pathRegex.exec(svg)) !== null) {
    pathDs.push(match[1])
  }

  const pathD = pathDs.join(' ')

  return { pathD, transform, viewBox }
}

export async function POST(request: NextRequest) {
  try {
    const { masks, colors, imageUrl } = await request.json()

    const maskUrls = masks || []
    const colorList = colors || ['#000000']

    if (!Array.isArray(maskUrls) || !Array.isArray(colorList)) {
      return NextResponse.json({ error: 'Se requiere masks (array URLs) y colors (array hex)' }, { status: 400 })
    }

    const layers: VectorLayer[] = []
    const nameMap = ['Fondo / Base', 'Elemento Principal', 'Detalles', 'Acentos', 'Textos', 'Bordes']

    if (maskUrls.length === 0 && imageUrl) {
      maskUrls.push(imageUrl)
    }

    for (let i = 0; i < maskUrls.length; i++) {
      try {
        let buffer: Buffer
        const maskUrl = maskUrls[i]

        if (maskUrl.startsWith('data:')) {
          const base64 = maskUrl.split(',')[1]
          buffer = Buffer.from(base64, 'base64')
        } else {
          const res = await fetch(maskUrl)
          if (!res.ok) {
            console.warn(`[vectorize] No se pudo descargar máscara ${i}: ${res.status}`)
            continue
          }
          buffer = Buffer.from(await res.arrayBuffer())
        }

        const svg = await traceImage(buffer)
        const { pathD, transform, viewBox } = extractPathsFromSVG(svg)

        if (!pathD) continue

        const color = colorList[i % colorList.length]
        const estimatedStitches = Math.max(800, Math.floor(pathD.length * 2.5))

        layers.push({
          id: `Capa_${i + 1}`,
          name: nameMap[i % nameMap.length],
          color,
          svgPath: pathD,
          transform,
          stitches: estimatedStitches,
          viewBox
        })
      } catch (err) {
        console.warn(`[vectorize] Error máscara ${i}:`, err)
      }
    }

    return NextResponse.json({ layers })
  } catch (error: any) {
    console.error('[vectorize] Error:', error)
    return NextResponse.json({ error: error.message || 'Error vectorizando' }, { status: 500 })
  }
}
