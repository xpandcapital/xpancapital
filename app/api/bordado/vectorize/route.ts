import { NextRequest, NextResponse } from 'next/server'
import { trace } from 'potrace'

export const maxDuration = 45
export const runtime = 'nodejs'

interface VectorLayer {
  id: string
  color: string
  svgPath: string
  stitches: number
  name: string
}

function traceImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    trace(buffer, (err: Error | null, svg: string) => {
      if (err) reject(err)
      else resolve(svg)
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const { masks, colors } = await request.json()
    if (!masks || !Array.isArray(masks) || !colors || !Array.isArray(colors)) {
      return NextResponse.json({ error: 'Se requiere masks (array de URLs) y colors (array de hex)' }, { status: 400 })
    }

    const layers: VectorLayer[] = []

    for (let i = 0; i < masks.length; i++) {
      try {
        const res = await fetch(masks[i])
        if (!res.ok) {
          console.warn(`[vectorize] No se pudo descargar máscara ${i}: ${res.status}`)
          continue
        }
        const buffer = Buffer.from(await res.arrayBuffer())

        const svg = await traceImage(buffer)
        const pathMatch = svg.match(/d="([^"]+)"/)
        const svgPath = pathMatch ? pathMatch[1] : ''
        const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 512 512'

        const color = colors[i % colors.length]
        const nameMap = ['Fondo / Base', 'Elemento Principal', 'Detalles', 'Acentos', 'Textos', 'Bordes']
        
        const perimeter = svgPath.length
        const estimatedStitches = Math.max(800, Math.floor(perimeter * 2.5))

        layers.push({
          id: `Capa_${i + 1}`,
          color,
          svgPath,
          stitches: estimatedStitches,
          name: nameMap[i % nameMap.length],
          viewBox
        } as any)
      } catch (err) {
        console.warn(`[vectorize] Error procesando máscara ${i}:`, err)
      }
    }

    return NextResponse.json({ layers })
  } catch (error: any) {
    console.error('[vectorize] Error:', error)
    return NextResponse.json({ error: error.message || 'Error vectorizando' }, { status: 500 })
  }
}
