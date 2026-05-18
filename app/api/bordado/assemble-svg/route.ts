import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 15
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { layers, width = 800, height = 800 } = await request.json()
    if (!layers || !Array.isArray(layers)) {
      return NextResponse.json({ error: 'Se requiere layers (array)' }, { status: 400 })
    }

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`
    svgContent += `  <!-- Archivo auto-generado por BLIS Bordado para Wilcom EmbroideryStudio -->\n`
    svgContent += `  <!-- Capas detectadas: ${layers.length} -->\n`
    svgContent += `  <!-- Importar en Wilcom: Modo Gráfico > Archivo > Importar (Ctrl+I) > Convertir a bordado -->\n\n`

    for (const layer of layers) {
      const color = layer.color || '#000000'
      const path = layer.svgPath || ''
      const id = layer.id || `Capa_${layers.indexOf(layer) + 1}`
      const name = layer.name || id

      svgContent += `  <!-- ${name} - Color: ${color} - ~${layer.stitches || '?'} puntadas -->\n`
      svgContent += `  <g id="${id}" fill="${color}" stroke="${color}" stroke-width="0.5" data-wilcom-color="${color}" data-wilcom-name="${name}">\n`

      if (path) {
        svgContent += `    <path d="${path}" />\n`
      } else {
        svgContent += `    <path d="M10 10 H 90 V 90 H 10 Z" />\n`
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
