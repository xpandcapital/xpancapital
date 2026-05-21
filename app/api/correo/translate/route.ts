import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

const GOOGLE_TRANSLATE_BASE = 'https://translate.googleapis.com/translate_a/single'

async function translateText(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang || 'auto',
    tl: targetLang,
    dt: 't',
    q: text,
  })

  const url = `${GOOGLE_TRANSLATE_BASE}?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Error al contactar Google Translate')
  }

  const data = await response.json()
  const translated = (data[0] || [])
    .map((segment: any) => segment[0] || '')
    .join('')

  return translated
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

    if (html) {
      const textParts = html.split(/(<[^>]+>)/g)
      const parts: string[] = []

      for (const part of textParts) {
        if (part.startsWith('<')) {
          parts.push(part)
        } else {
          const trimmed = part.trim()
          if (trimmed) {
            const translated = await translateText(trimmed, target, source)
            parts.push(part.replace(trimmed, translated))
          } else {
            parts.push(part)
          }
        }
      }

      translatedHtml = parts.join('')
    }

    if (text) {
      translatedText = await translateText(text, target, source)
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
