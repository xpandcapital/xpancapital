import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { originalEmail, instructions } = body

    if (!originalEmail || !instructions) {
      return NextResponse.json({ error: 'originalEmail e instructions requeridos' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('key_name', 'gemini_key')
      .eq('empresa_id', auth.empresaId)
      .or(`user_id.eq.${auth.userId},is_global.eq.true`)
      .limit(1)
      .maybeSingle()

    if (!keys?.key_value) {
      return NextResponse.json({
        error: 'Gemini API Key no configurada. Agrega tu gemini_key en API Nube.',
      }, { status: 400 })
    }

    const systemPrompt = `Eres un asistente profesional de redacción de correos corporativos. 
Redacta respuestas formales, persuasivas y profesionales.
Usa un tono respetuoso y cordial.
Escribe siempre en español, a menos que el correo original esté en otro idioma.
Responde SOLO con el texto del correo redactado, sin saludos adicionales ni explicaciones.`

    const prompt = `CORREO RECIBIDO:
De: ${originalEmail.from || 'Remitente'}
Asunto: ${originalEmail.subject || '(Sin asunto)'}
---
${originalEmail.text || originalEmail.html || '(Sin contenido)'}
---

INSTRUCCIÓN DEL USUARIO:
${instructions}

Redacta una respuesta de correo profesional. SOLO devuelve el cuerpo del correo, sin firma, sin encabezados.`

    const response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(keys.key_value)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Error con Gemini API')
    }

    const data = await response.json()
    const draft = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({ draft })
  } catch (error: any) {
    console.error('[draft-reply] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al redactar respuesta' }, { status: 500 })
  }
}

