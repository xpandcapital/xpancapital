import { NextRequest, NextResponse } from 'next/server'

// Endpoint para extraer contenido de un artículo desde su URL
// Hace fetch server-side, extrae texto del HTML y lo devuelve
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL requerida' }, { status: 400 })
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlisCorp/1.0; +https://blis-corp.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${res.status}` })
    }

    const html = await res.text()
    const content = extractArticleText(html)

    if (!content || content.length < 100) {
      return NextResponse.json({ success: false, error: 'No se pudo extraer contenido legible' })
    }

    // Truncar a un máximo razonable
    const truncated = content.length > 6000 ? content.slice(0, 6000) + '...' : content

    return NextResponse.json({ success: true, content: truncated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Error al leer el artículo' })
  }
}

function extractArticleText(html: string): string {
  // Método 1: buscar etiquetas <article>
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (articleMatch) {
    return stripHtml(articleMatch[1])
  }

  // Método 2: buscar contenedores comunes de artículos
  const contentClassPatterns = [
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ]

  for (const pattern of contentClassPatterns) {
    const match = html.match(pattern)
    if (match && match[1].length > 300) {
      return stripHtml(match[1])
    }
  }

  // Método 3: buscar párrafos consecutivos
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  if (paragraphs && paragraphs.length >= 2) {
    const text = paragraphs.map(p => stripHtml(p)).filter(t => t.length > 30).join('\n\n')
    if (text.length > 200) return text
  }

  // Método 4: fallback — strip todo el HTML y tomar el bloque más largo de texto
  const allText = stripHtml(html)
  const blocks = allText.split(/\n\s*\n/).filter(b => b.trim().length > 40)
  if (blocks.length > 1) {
    return blocks.join('\n\n')
  }

  return allText
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#x([0-9a-fA-F]+);/g, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_: string, dec: string) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n\n')
    .trim()
}
