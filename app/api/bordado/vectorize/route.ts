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
  const viewBox = (svg.match(/viewBox=["']([^"']+)["']/) || [])[1] || '0 0 512 512'

  const gMatch = svg.match(/<g[^>]*transform=["']([^"']+)["'][^>]*>/)
  const transform = gMatch ? gMatch[1] : ''

  const pathRegex = /<path[^>]*\sd=["']([^"']+)["'][^>]*\/?>/g
  const pathDs: string[] = []
  let match
  while ((match = pathRegex.exec(svg)) !== null) {
    if (match[1].length > 5) pathDs.push(match[1])
  }

  return { pathD: pathDs.join(' '), transform, viewBox }
}

export async function POST(request: NextRequest) {
  const diag: string[] = []
  try {
    const { masks, colors } = await request.json()
    const maskUrls: string[] = masks || []
    const colorList: string[] = colors || []

    if (!maskUrls.length) {
      return NextResponse.json({ layers: [], diag: ['Sin máscaras para vectorizar'] })
    }

    const layers: VectorLayer[] = []
    const nameMap = ['Fondo / Base', 'Elemento Principal', 'Detalles', 'Acentos', 'Textos', 'Bordes']

    for (let i = 0; i < maskUrls.length; i++) {
      const maskUrl = maskUrls[i]
      if (!maskUrl) { diag.push(`Máscara ${i}: vacía`); continue }

      try {
        let buffer: Buffer
        if (maskUrl.startsWith('data:')) {
          const b64 = maskUrl.split(',')[1]
          if (!b64) { diag.push(`Máscara ${i}: data URI sin base64`); continue }
          buffer = Buffer.from(b64, 'base64')
          diag.push(`Máscara ${i}: data URI ${(buffer.length/1024).toFixed(1)}KB`)
        } else {
          const res = await fetch(maskUrl)
          if (!res.ok) { diag.push(`Máscara ${i}: fetch error ${res.status}`); continue }
          buffer = Buffer.from(await res.arrayBuffer())
          diag.push(`Máscara ${i}: URL ${(buffer.length/1024).toFixed(1)}KB`)
        }

        const svg = await traceImage(buffer)
        diag.push(`Máscara ${i}: potrace OK (${svg.length} chars)`)

        const { pathD, transform, viewBox } = extractPathsFromSVG(svg)
        if (!pathD) { diag.push(`Máscara ${i}: sin path (máscara vacía?)`); continue }

        const color = colorList[i] || colorList[i % colorList.length] || '#000000'
        layers.push({
          id: `Capa_${i + 1}`,
          name: nameMap[i] || `Capa ${i + 1}`,
          color,
          svgPath: pathD,
          transform,
          stitches: Math.max(800, Math.floor(pathD.length * 2.5)),
          viewBox
        })
      } catch (err: any) {
        diag.push(`Máscara ${i}: ERROR ${err.message?.slice(0, 80) || err}`)
      }
    }

    return NextResponse.json({ layers, diag })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, diag }, { status: 500 })
  }
}
