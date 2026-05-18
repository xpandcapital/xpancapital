import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 15
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { layers, width = 800, height = 800 } = await request.json()
    if (!layers || !Array.isArray(layers)) {
      return NextResponse.json({ error: 'Se requiere layers (array)' }, { status: 400 })
    }

    let hasViewBox = false
    let vbW = width
    let vbH = height

    for (const l of layers) {
      if (l.viewBox) {
        const parts = l.viewBox.split(/\s+/)
        if (parts.length === 4) {
          vbW = parseInt(parts[2]) || width
          vbH = parseInt(parts[3]) || height
          hasViewBox = true
          break
        }
      }
    }

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%">\n`
    svgContent += `  <!-- BLIS Bordado - SVG para Wilcom EmbroideryStudio -->\n`
    svgContent += `  <!-- Capas detectadas: ${layers.length} -->\n`
    svgContent += `  <!-- Importar: Modo Gráfico > Ctrl+I > Convertir a bordado -->\n\n`

    for (const layer of layers) {
      const color = layer.color || '#000000'
      const pathD = layer.svgPath || ''
      const transform = layer.transform || ''
      const id = layer.id || `Capa_${layers.indexOf(layer) + 1}`
      const name = layer.name || id

      svgContent += `  <!-- ${name} - ${color} - ~${layer.stitches || '?'} pts -->\n`
      svgContent += `  <g id="${id}" data-name="${name}" data-color="${color}">\n`

      if (transform) {
        svgContent += `    <g transform="${transform}">\n`
        svgContent += `      <path d="${pathD}" fill="${color}" stroke="${color}" stroke-width="0.3" />\n`
        svgContent += `    </g>\n`
      } else {
        svgContent += `    <path d="${pathD}" fill="${color}" stroke="${color}" stroke-width="0.3" />\n`
      }

      svgContent += `  </g>\n\n`
    }

    svgContent += `</svg>`

    return NextResponse.json({ svg: svgContent })
  } catch (error: any) {
    console.error('[assemble-svg] Error:', error)
    return NextResponse.json({ error: error.message || 'Error ensamblando SVG' }, { status: 500 })
  }
}
