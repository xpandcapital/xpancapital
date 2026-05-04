import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.decolecta.com'
const API_TOKEN = process.env.NEXT_PUBLIC_PERU_API_TOKEN || ''

const TYPE_MAP: Record<string, string> = {
  ruc: '/v1/sunat/ruc?numero=',
  dni: '/v1/reniec/dni?numero=',
  tipo_cambio: '/v1/tipo-cambio/sbs/average?currency=USD',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  const headerToken = request.headers.get('x-peru-api-token')
  const queryToken = searchParams.get('token')

  const ACTIVE_TOKEN = headerToken !== null ? headerToken : (queryToken || API_TOKEN)

  if (!type) {
    return NextResponse.json({ success: false, message: 'Faltan parámetros' }, { status: 400 })
  }

  if (!id && type !== 'tipo_cambio') {
    return NextResponse.json({ success: false, message: 'ID es requerido para este tipo' }, { status: 400 })
  }

  if (!ACTIVE_TOKEN) {
    return NextResponse.json({ success: false, message: 'API Token no configurado' }, { status: 500 })
  }

  const endpoint = TYPE_MAP[type]
  if (!endpoint) {
    return NextResponse.json({ success: false, message: `Tipo de consulta no soportado: ${type}` }, { status: 400 })
  }

  try {
    const url = id
      ? `${API_BASE_URL}${endpoint}${encodeURIComponent(id)}`
      : `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${ACTIVE_TOKEN}`,
      },
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ success: false, message: data.error || data.message || `Error HTTP ${response.status}` }, { status: response.status })
    }
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Proxy Error:', error)
    return NextResponse.json({ success: false, message: 'Fallo la comunicación con el proveedor' }, { status: 500 })
  }
}
