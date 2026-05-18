import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const maxDuration = 30
export const runtime = 'nodejs'

async function createColorMask(buffer: Buffer, targetR: number, targetG: number, targetB: number, tolerance: number): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const maskData = Buffer.alloc(info.width * info.height)

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = info.channels === 4 ? data[i + 3] : 255

    const dist = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2)
    const pixelIndex = i / info.channels
    maskData[pixelIndex] = (a > 20 && dist <= tolerance) ? 255 : 0
  }

  return sharp(maskData, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer()
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

    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>()

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = info.channels === 4 ? data[i + 3] : 255

      if (a < 20) continue

      const qr = Math.round(r / 64) * 64
      const qg = Math.round(g / 64) * 64
      const qb = Math.round(b / 64) * 64

      const hex = `#${qr.toString(16).padStart(2, '0')}${qg.toString(16).padStart(2, '0')}${qb.toString(16).padStart(2, '0')}`

      const existing = colorMap.get(hex)
      if (existing) {
        existing.count++
      } else {
        colorMap.set(hex, { r: qr, g: qg, b: qb, count: 1 })
      }
    }

    const sorted = Array.from(colorMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, numColors)

    const colors = sorted.map(([hex]) => hex)
    const colorRGBs = sorted.map(([, v]) => ({ r: v.r, g: v.g, b: v.b }))

    // Generar máscara blanco/negro para cada color dominante
    const masks: string[] = []
    for (const rgb of colorRGBs) {
      try {
        const maskBuffer = await createColorMask(buffer, rgb.r, rgb.g, rgb.b, 100)
        const base64 = maskBuffer.toString('base64')
        masks.push(`data:image/png;base64,${base64}`)
      } catch {
        masks.push('')
      }
    }

    // Posterizar la imagen para preview
    const posterizedBuf = await sharp(buffer)
      .ensureAlpha()
      .png({ palette: true, colours: numColors })
      .toBuffer()

    const posterizedBase64 = posterizedBuf.toString('base64')

    return NextResponse.json({
      colors,
      masks,
      posterizedImage: `data:image/png;base64,${posterizedBase64}`,
      layers: colors.map((hex, i) => ({
        id: `Capa_${i + 1}`,
        name: i === 0 ? 'Fondo / Base' : i === 1 ? 'Elemento Principal' : i === 2 ? 'Detalles' : i === 3 ? 'Acentos' : 'Textos',
        color: hex,
        stitches: Math.floor(Math.random() * 5000) + 1500
      }))
    })
  } catch (error: any) {
    console.error('[quantize] Error:', error)
    return NextResponse.json({ error: error.message || 'Error cuantizando colores' }, { status: 500 })
  }
}
