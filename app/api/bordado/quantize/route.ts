import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const maxDuration = 30
export const runtime = 'nodejs'

function colorDistance(a: number[], b: number[]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

async function createColorMask(buffer: Buffer, targetR: number, targetG: number, targetB: number, tolerance: number): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const maskData = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const a = info.channels === 4 ? data[i + 3] : 255
    const dist = Math.sqrt((r-targetR)**2 + (g-targetG)**2 + (b-targetB)**2)
    const pixelIndex = (i / info.channels) * 4
    const isColor = a > 20 && dist <= tolerance
    maskData[pixelIndex] = isColor ? 255 : 0
    maskData[pixelIndex + 1] = isColor ? 255 : 0
    maskData[pixelIndex + 2] = isColor ? 255 : 0
    maskData[pixelIndex + 3] = 255
  }
  return sharp(maskData, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, numColors = 5 } = await request.json()
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

    const colorCounts = new Map<number, { r: number; g: number; b: number; count: number }>()

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const a = info.channels === 4 ? data[i + 3] : 255
      if (a < 20) continue

      const qr = Math.round(r / 96) * 96
      const qg = Math.round(g / 96) * 96
      const qb = Math.round(b / 96) * 96
      const key = (qr << 16) | (qg << 8) | qb

      const existing = colorCounts.get(key)
      if (existing) { existing.count++ }
      else { colorCounts.set(key, { r: qr, g: qg, b: qb, count: 1 }) }
    }

    let entries = Array.from(colorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)

    // Fusionar colores similares
    const merged: typeof entries = []
    for (const [key, val] of entries) {
      const rgb = [val.r, val.g, val.b]
      const similar = merged.find(([, m]) => colorDistance(rgb, [m.r, m.g, m.b]) < 120)
      if (similar) {
        similar[1].count += val.count
      } else {
        merged.push([key, val])
      }
    }

    const top = merged
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, numColors)

    const colors = top.map(([, v]) => {
      const hex = `#${v.r.toString(16).padStart(2,'0')}${v.g.toString(16).padStart(2,'0')}${v.b.toString(16).padStart(2,'0')}`
      return hex
    })
    const colorRGBs = top.map(([, v]) => ({ r: v.r, g: v.g, b: v.b }))

    // Generar máscaras en paralelo
    const maskBuffers = await Promise.allSettled(
      colorRGBs.map(rgb => createColorMask(buffer, rgb.r, rgb.g, rgb.b, 110))
    )
    const masks = maskBuffers.map(r => {
      if (r.status === 'fulfilled') return `data:image/png;base64,${r.value.toString('base64')}`
      return ''
    })

    // Posterizar para preview
    const posterizedBuf = await sharp(buffer)
      .ensureAlpha()
      .png({ palette: true, colours: Math.min(colors.length, 8) })
      .toBuffer()

    return NextResponse.json({
      colors,
      masks,
      posterizedImage: `data:image/png;base64,${posterizedBuf.toString('base64')}`,
      layers: colors.map((hex, i) => ({
        id: `Capa_${i + 1}`,
        name: i === 0 ? 'Fondo / Base' : i === 1 ? 'Elemento Principal' : i === 2 ? 'Detalles' : 'Acentos',
        color: hex,
        stitches: 1500 + Math.floor(Math.random() * 3500)
      }))
    })
  } catch (error: any) {
    console.error('[quantize] Error:', error)
    return NextResponse.json({ error: error.message || 'Error cuantizando colores' }, { status: 500 })
  }
}
