import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { translate } from '@vitalets/google-translate-api'

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
      const result = await translate(html, { to: target, from: source })
      translatedHtml = result.text
    }

    if (text) {
      const result = await translate(text, { to: target, from: source })
      translatedText = result.text
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
