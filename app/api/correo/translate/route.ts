import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

function cleanHtmlForTranslation(html: string): string {
  let cleaned = html
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
  return cleaned
}

function wrapWithModernFont(html: string): string {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1a1a1a;">${html}</div>`
}

async function translateViaGoogleDirect(text: string, target: string, source: string): Promise<string> {
  const params = new URLSearchParams({ client: 'gtx', sl: source || 'auto', tl: target, dt: 't', q: text })
  const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Google Translate directo falló')
  const data = await response.json()
  return (data[0] || []).map((s: any) => s[0] || '').join('')
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { html, text, targetLang, sourceLang } = body

    if (!html && !text) {
      return NextResponse.json({ error: 'html o text requerido' }, { status: 400 })
    }

    const target = targetLang || 'es'
    const source = sourceLang || 'auto'

    let translatedHtml = ''
    let translatedText = ''

    // Intentar con @vitalets/google-translate-api primero, fallback a endpoint directo
    async function translateText(input: string): Promise<string> {
      try {
        const { translate } = await import('@vitalets/google-translate-api')
        const result = await translate(input, { to: target, from: source })
        return result.text
      } catch {
        return translateViaGoogleDirect(input, target, source)
      }
    }

    if (html) {
      const cleanedHtml = cleanHtmlForTranslation(html)
      const result = await translateText(cleanedHtml)
      translatedHtml = wrapWithModernFont(result)
    }

    if (text) {
      translatedText = await translateText(text)
    }

    return NextResponse.json({
      translatedHtml,
      translatedText,
      sourceLang: source,
      targetLang: target,
    })
  } catch (error: any) {
    console.error('[translate] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al traducir' }, { status: 500 })
  }
}
