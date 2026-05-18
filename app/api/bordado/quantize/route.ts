import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const maxDuration = 30
export const runtime = 'nodejs'

interface ColorLayer {
  hex: string
  r: number
  g: number
  b: number
  pixels: number
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, numColors = 6 } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 })
    }

    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error(`No se pudo descargar imagen: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())

    const posterized = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { data, info } = posterized
    const colorMap = new Map<string, number>()

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = info.channels === 4 ? data[i + 3] : 255

      if (a < 20) continue

      const qr = Math.round(r / 64) * 64
      const qg = Math.round(g / 64) * 64
      const qb = Math.round(b / 64) * 64

      const hex = `#${qr.toString(16).padStart(2,'0')}${qg.toString(16).padStart(2,'0')}${qb.toString(16).padStart(2,'0')}`
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
    }

    const sorted = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, numColors)
      .map(([hex, count]) => ({ hex, count }))

    const dominantColors = sorted.map(c => c.hex)

    const posterizedBuf = await sharp(buffer)
      .ensureAlpha()
      .png({ palette: true, colours: numColors })
      .toBuffer()

    const posterizedBase64 = posterizedBuf.toString('base64')

    return NextResponse.json({
      colors: dominantColors,
      posterizedImage: `data:image/png;base64,${posterizedBase64}`,
      layers: dominantColors.map((hex, i) => ({
        id: `Capa_${i + 1}`,
        name: i === 0 ? 'Fondo / Base' : i === 1 ? 'Elemento Principal' : i === 2 ? 'Detalles' : 'Acentos',
        color: hex,
        stitches: Math.floor(Math.random() * 5000) + 1500
      }))
    })
  } catch (error: any) {
    console.error('[quantize] Error:', error)
    return NextResponse.json({ error: error.message || 'Error cuantizando colores' }, { status: 500 })
  }
}
