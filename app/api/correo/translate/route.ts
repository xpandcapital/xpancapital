import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

function cleanHtmlForTranslation(html: string): string {
  let cleaned = html
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
  return cleaned
}

function wrapWithModernFont(html: string): string {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1a1a1a;">${html}</div>`
}

async function translateText(text: string, target: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Translate API failed')
  const data = await response.json()
  if (!data?.[0]) throw new Error('Empty response')
  return data[0].map((s: any[]) => s[0] || '').join('')
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { html, text, targetLang } = body

    if (!html && !text) {
      return NextResponse.json({ error: 'html o text requerido' }, { status: 400 })
    }

    const target = targetLang || 'es'
    let translatedHtml = ''
    let translatedText = ''

    if (html) {
      const cleaned = cleanHtmlForTranslation(html)
      const result = await translateText(cleaned, target)
      translatedHtml = wrapWithModernFont(result)
    }

    if (text) {
      translatedText = await translateText(text, target)
    }

    return NextResponse.json({ translatedHtml, translatedText, targetLang: target })
  } catch (error: any) {
    console.error('[translate] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al traducir' }, { status: 500 })
  }
}
