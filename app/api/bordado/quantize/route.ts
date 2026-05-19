import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const maxDuration = 50
export const runtime = 'nodejs'

function colorDistance(a: number[], b: number[]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

// K-Means clustering para extraer paleta real de la imagen
function kMeans(pixels: number[][], k: number, maxIter = 10): number[][] {
  if (pixels.length === 0) return []
  
  // Inicializar centroides con píxeles espaciados uniformemente
  const centroids: number[][] = []
  const step = Math.max(1, Math.floor(pixels.length / k))
  for (let i = 0; i < k; i++) {
    centroids.push([...pixels[Math.min(i * step, pixels.length - 1)]])
  }

  for (let iter = 0; iter < maxIter; iter++) {
    // Asignar cada píxel al centroide más cercano
    const clusters: number[][][] = Array.from({ length: k }, () => [])
    for (const pixel of pixels) {
      let best = 0, bestDist = Infinity
      for (let c = 0; c < k; c++) {
        const d = colorDistance(pixel, centroids[c])
        if (d < bestDist) { bestDist = d; best = c }
      }
      clusters[best].push(pixel)
    }

    // Recalcular centroides
    let changed = false
    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue
      const avg = clusters[c].reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0])
      const n = clusters[c].length
      const newCentroid = [Math.round(avg[0]/n), Math.round(avg[1]/n), Math.round(avg[2]/n)]
      if (colorDistance(newCentroid, centroids[c]) > 1) changed = true
      centroids[c] = newCentroid
    }
    if (!changed) break
  }

  return centroids.map(c => c.map(Math.round))
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

    const v = isColor ? 0 : 255
    maskData[pixelIndex] = v
    maskData[pixelIndex + 1] = v
    maskData[pixelIndex + 2] = v
    maskData[pixelIndex + 3] = 255

    if (isColor) objectPixels++
  }

  const buf = await sharp(maskData, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
  return { buffer: buf, fillRatio: objectPixels / total }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, numColors = 8, designType = 'logo' } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 })
    }

    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error(`No se pudo descargar imagen: ${res.status}`)
    let buffer = Buffer.from(await res.arrayBuffer())

    const isIlustracion = designType === 'ilustracion'

    // Pre-procesamiento para Ilustración
    if (isIlustracion) {
      const filtered = await sharp(buffer)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .median(3)
        .blur(1.5)
        .toBuffer()
      buffer = Buffer.from(filtered)
    }

    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Color de fondo (esquina 0,0)
    const bgR = data[0], bgG = data[1], bgB = data[2]

    let colorRGBs: { r: number; g: number; b: number }[]

    if (isIlustracion) {
      // === MODO ILUSTRACIÓN: K-Means para paleta real ===
      const sampleRate = 4
      const pixels: number[][] = []
      for (let i = 0; i < data.length; i += info.channels * sampleRate) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const a = info.channels === 4 ? data[i + 3] : 255
        if (a < 20) continue
        // Excluir píxeles muy cercanos al fondo
        const bgDist = Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2)
        if (bgDist < 50) continue
        pixels.push([r, g, b])
      }

      const k = Math.min(numColors, 8)
      const centroids = kMeans(pixels, k)

      // Ordenar por frecuencia (cuántos píxeles caen en cada cluster)
      const counts = new Array(centroids.length).fill(0)
      for (const pixel of pixels) {
        let best = 0, bestDist = Infinity
        for (let c = 0; c < centroids.length; c++) {
          const d = colorDistance(pixel, centroids[c])
          if (d < bestDist) { bestDist = d; best = c }
        }
        counts[best]++
      }

      colorRGBs = centroids
        .map((c, i) => ({ r: c[0], g: c[1], b: c[2], count: counts[i] }))
        .sort((a, b) => b.count - a.count)
        .map(({ r, g, b }) => ({ r, g, b }))

    } else {
      // === MODO LOGO: binarización por bines ===
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

      let entries = Array.from(colorCounts.entries()).sort((a, b) => b[1].count - a[1].count)
      const merged: typeof entries = []
      for (const [, val] of entries) {
        const rgb = [val.r, val.g, val.b]
        if (!merged.find(([, m]) => colorDistance(rgb, [m.r, m.g, m.b]) < 120)) {
          merged.push([0, val])
        }
      }

      colorRGBs = merged
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, numColors)
        .map(([, v]) => ({ r: v.r, g: v.g, b: v.b }))
    }

    // Crear máscaras
    const tolerance = isIlustracion ? 80 : 110
    const results = await Promise.allSettled(
      colorRGBs.map(rgb => createColorMask(buffer, rgb.r, rgb.g, rgb.b, tolerance))
    )

    const colors: string[] = []
    const masks: string[] = []
    const layers: any[] = []
    const discarded: string[] = []
    const nameMap = ['Fondo / Base', 'Elemento Principal', 'Detalles', 'Acentos', 'Textos', 'Bordes']

    const bgHex = `#${(Math.round(bgR/96)*96).toString(16).padStart(2,'0')}${(Math.round(bgG/96)*96).toString(16).padStart(2,'0')}${(Math.round(bgB/96)*96).toString(16).padStart(2,'0')}`

    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      if (r.status !== 'fulfilled') continue

      const { buffer: maskBuf, fillRatio } = r.value
      const rgb = colorRGBs[i]
      const hex = `#${rgb.r.toString(16).padStart(2,'0')}${rgb.g.toString(16).padStart(2,'0')}${rgb.b.toString(16).padStart(2,'0')}`

      const maxFill = isIlustracion ? 0.95 : 0.90
      const minFill = isIlustracion ? 0.005 : 0.03
      if (fillRatio > maxFill) { discarded.push(`${hex}: fondo (${(fillRatio*100).toFixed(0)}%)`); continue }
      if (fillRatio < minFill) { discarded.push(`${hex}: ruido (${(fillRatio*100).toFixed(1)}%)`); continue }
      if (hex === bgHex) { discarded.push(`${hex}: color de fondo`); continue }

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
