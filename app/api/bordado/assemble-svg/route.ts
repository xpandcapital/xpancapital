import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 15
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { layers } = await request.json()
    if (!layers || !Array.isArray(layers)) {
      return NextResponse.json({ error: 'Se requiere layers (array)' }, { status: 400 })
    }

    const vb = 1024
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="${vb}" height="${vb}">\n`
    svgContent += `  <!-- BLIS Bordado - SVG para Wilcom EmbroideryStudio / CorelDRAW -->\n`
    svgContent += `  <!-- Capas detectadas: ${layers.length} | Medidas: ${vb}x${vb}px -->\n`
    svgContent += `  <!-- Importar en CorelDRAW/Wilcom: Archivo > Importar (Ctrl+I) > seleccionar .SVG -->\n\n`

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      const color = layer.color || '#000000'
      const pathD = layer.svgPath || ''
      const transform = layer.transform || ''
      const id = layer.id || `Capa_${i + 1}`
      const name = layer.name || id
      const stitches = layer.stitches || 1500

      svgContent += `  <!-- ${name} | ${color} | ~${stitches} pts -->\n`

      if (pathD && pathD.length > 10) {
        svgContent += `  <g id="${id}" data-name="${escapeXml(name)}" data-color="${color}" data-stitches="${stitches}">\n`
        if (transform && transform.length > 5) {
          svgContent += `    <g transform="${transform}">\n`
          svgContent += `      <path d="${pathD}" fill="${color}" stroke="${color}" stroke-width="0.5" stroke-linejoin="round" />\n`
          svgContent += `    </g>\n`
        } else {
          svgContent += `    <path d="${pathD}" fill="${color}" stroke="${color}" stroke-width="0.5" stroke-linejoin="round" />\n`
        }
        svgContent += `  </g>\n\n`
      }
    }

    svgContent += `</svg>`

    return NextResponse.json({ svg: svgContent })
  } catch (error: any) {
    console.error('[assemble-svg] Error:', error)
    return NextResponse.json({ error: error.message || 'Error ensamblando SVG' }, { status: 500 })
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
