import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const maxDuration = 40
export const runtime = 'nodejs'

function colorDistance(a: number[], b: number[]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

async function createColorMask(
  buffer: Buffer,
  targetR: number, targetG: number, targetB: number,
  tolerance: number
): Promise<{ buffer: Buffer; fillRatio: number }> {
  const { data, info } = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const total = info.width * info.height
  const maskData = Buffer.alloc(total * 4)
  let objectPixels = 0

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const a = info.channels === 4 ? data[i + 3] : 255
    const dist = Math.sqrt((r-targetR)**2 + (g-targetG)**2 + (b-targetB)**2)
    const pixelIndex = (i / info.channels) * 4
    const isColor = a > 20 && dist <= tolerance

    // Objeto = negro puro (0), fondo = blanco puro (255)
    const v = isColor ? 0 : 255
    maskData[pixelIndex] = v
    maskData[pixelIndex + 1] = v
    maskData[pixelIndex + 2] = v
    maskData[pixelIndex + 3] = 255

    if (isColor) objectPixels++
  }

  const fillRatio = objectPixels / total
  const buf = await sharp(maskData, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
  return { buffer: buf, fillRatio }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, numColors = 8 } = await request.json()
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

    const colorRGBs = top.map(([, v]) => ({ r: v.r, g: v.g, b: v.b }))

    const results = await Promise.allSettled(
      colorRGBs.map(rgb => createColorMask(buffer, rgb.r, rgb.g, rgb.b, 110))
    )

    const colors: string[] = []
    const masks: string[] = []
    const layers: any[] = []
    const discarded: string[] = []

    const nameMap = ['Fondo / Base', 'Elemento Principal', 'Detalles', 'Acentos', 'Textos', 'Bordes']

    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      if (r.status !== 'fulfilled') continue

      const { buffer: maskBuf, fillRatio } = r.value
      const rgb = colorRGBs[i]
      const hex = `#${rgb.r.toString(16).padStart(2,'0')}${rgb.g.toString(16).padStart(2,'0')}${rgb.b.toString(16).padStart(2,'0')}`

      // Filtrar capas parásitas
      if (fillRatio > 0.90) {
        discarded.push(`${hex}: fondo (${(fillRatio*100).toFixed(0)}%)`)
        continue
      }
      if (fillRatio < 0.03) {
        discarded.push(`${hex}: ruido (${(fillRatio*100).toFixed(1)}%)`)
        continue
      }

      colors.push(hex)
      masks.push(`data:image/png;base64,${maskBuf.toString('base64')}`)
      layers.push({
        id: `Capa_${layers.length + 1}`,
        name: nameMap[layers.length] || `Capa ${layers.length + 1}`,
        color: hex,
        stitches: 1500 + Math.floor(Math.random() * 3500)
      })
    }

    const posterizedBuf = await sharp(buffer)
      .ensureAlpha()
      .png({ palette: true, colours: Math.min(colors.length || 1, 8) })
      .toBuffer()

    return NextResponse.json({
      colors,
      masks,
      layers,
      discarded,
      posterizedImage: `data:image/png;base64,${posterizedBuf.toString('base64')}`,
    })
  } catch (error: any) {
    console.error('[quantize] Error:', error)
    return NextResponse.json({ error: error.message || 'Error cuantizando colores' }, { status: 500 })
  }
}
