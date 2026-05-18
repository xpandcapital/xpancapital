import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { getApiKey } from '@/lib/api-keys'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60
export const runtime = 'nodejs'

const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image-preview'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const BORDADO_PROMPT = `Transforma esta imagen en un parche de bordado a máquina fotorrealista 3D. 
Requisitos CRÍTICOS:
- La imagen debe verse EXACTAMENTE como un bordado físico real cosido en tela.
- Texturas de hilo muy visibles: puntadas gruesas tipo tatami (zigzag denso) en áreas grandes, y puntadas satín (paralelas brillantes) en bordes y contornos.
- Iluminación realista con brillos dorados en los hilos donde pega la luz.
- Sombras suaves bajo el parche que den profundidad.
- Fondo de tela (canvas, denim o twill) visible alrededor y debajo del bordado.
- Mantén EXACTAMENTE el mismo diseño, forma y composición de la imagen original, pero convertido a bordado.
- NO agregues texto, NO cambies los colores principales, NO deformes la silueta.
- El resultado debe verse como una foto macro de un bordado real, no como un dibujo ni una imagen generada por computadora.`

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const { imageUrl, mimeType = 'image/png' } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere imageUrl' }, { status: 400 })
    }

    const apiKey = await getApiKey(supabase, 'gemini_key', auth.userId, auth.empresaId)
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key no configurada. Ve a /superadmin/api-nube' }, { status: 400 })
    }

    let base64Data: string
    let actualMimeType = mimeType

    if (imageUrl.startsWith('data:')) {
      const parts = imageUrl.split(',')
      actualMimeType = parts[0].split(':')[1]?.split(';')[0] || mimeType
      base64Data = parts[1]
    } else {
      const res = await fetch(imageUrl)
      if (!res.ok) throw new Error(`No se pudo descargar imagen: ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      base64Data = buffer.toString('base64')
    }

    const payload = {
      contents: [{
        role: 'user',
        parts: [
          { text: BORDADO_PROMPT },
          {
            inlineData: {
              mimeType: actualMimeType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    }

    console.log(`[render] Llamando a ${GEMINI_IMAGE_MODEL}...`)

    const response = await fetch(
      `${GEMINI_BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    const result = await response.json()

    if (result.error) {
      console.error('[render] Gemini error:', result.error)
      return NextResponse.json({ error: result.error.message || 'Gemini API error' }, { status: response.status })
    }

    const imagePart = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)

    if (imagePart?.inlineData) {
      const renderUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      console.log('[render] Imagen generada exitosamente')
      return NextResponse.json({ url: renderUrl })
    }

    const textPart = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)
    console.warn('[render] Sin imagen en respuesta. Texto:', textPart?.text?.slice(0, 100))

    return NextResponse.json({
      error: 'Gemini no generó imagen. El modelo puede no soportar image-to-image.',
      text: textPart?.text?.slice(0, 200)
    }, { status: 422 })

  } catch (error: any) {
    console.error('[render] Error:', error)
    return NextResponse.json({ error: error.message || 'Error generando render' }, { status: 500 })
  }
}
