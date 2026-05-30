import { NextResponse } from 'next/server'
import { getApiKeyForRequest } from '@/lib/api-keys'

export async function POST(request: Request) {
  try {
    const publicKey = await getApiKeyForRequest(
      request as unknown as import('next/server').NextRequest,
      'ilovepdf_public_key'
    )

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Clave de procesamiento no configurada. Ve a API Nube → Documentos & PDF → Procesador de Documentos.' },
        { status: 400 }
      )
    }

    const res = await fetch('https://api.ilovepdf.com/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_key: publicKey }),
    })

    const data = await res.json()

    if (!data.token) {
      return NextResponse.json(
        { error: data.message || `Error de autenticación (${res.status})` },
        { status: res.status }
      )
    }

    return NextResponse.json({ token: data.token })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
