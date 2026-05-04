import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://apiconsult.zampisoft.com/api/consultar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const full = searchParams.get('full') === 'true'
  const type = searchParams.get('type')

  const ACTIVE_TOKEN = request.headers.get('x-apiconsult-token')

  if (!ACTIVE_TOKEN) {
    return NextResponse.json({ success: false, message: 'ApiConsult Token no configurado' }, { status: 500 })
  }

  // WhatsApp Check (gratis, universal)
  if (type === 'whatsapp') {
    if (!id) {
      return NextResponse.json({ success: false, message: 'Número de teléfono requerido' }, { status: 400 })
    }
    try {
      const clean = id.replace(/[^0-9]/g, '')
      const res = await fetch(`https://apiconsult.zampisoft.com/api/check-phone?phone=${clean}&token=${encodeURIComponent(ACTIVE_TOKEN)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        return NextResponse.json({ success: false, message: data.error || `Error HTTP ${res.status}` }, { status: res.status })
      }
      return NextResponse.json({ success: true, data })
    } catch (error: any) {
      console.error('[EcuadorAPI] WhatsApp check error:', error)
      return NextResponse.json({ success: false, message: 'Fallo la verificación de WhatsApp' }, { status: 500 })
    }
  }

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID (Cédula/RUC) es requerido' }, { status: 400 })
  }

  const isCedula = id.length === 10
  const isRuc = id.length === 13

  if (!isCedula && !isRuc) {
    return NextResponse.json({ success: false, message: 'Formato inválido (Cédula 10, RUC 13 dígitos)' }, { status: 400 })
  }

  const doRequest = async (includeFull: boolean) => {
    const url = `${API_BASE_URL}?identificacion=${encodeURIComponent(id)}&token=${encodeURIComponent(ACTIVE_TOKEN)}${includeFull ? '&full=true' : ''}`
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
    const data = await res.json()
    return { ok: res.ok, status: res.status, data }
  }

  try {
    // 1. Cédula con opción full → intentar full primero, fallback a básica
    if (isCedula && full) {
      const fullRes = await doRequest(true)

      // Si full devuelve datos válidos o error distinto a "horario laboral", usar resultado
      const fullError = fullRes.data?.error || fullRes.data?.message || ''
      const isHorarioLaboral =
        fullError.toLowerCase().includes('horario') ||
        fullError.toLowerCase().includes('disponible') ||
        fullError.toLowerCase().includes('oficina') ||
        fullError.toLowerCase().includes('laboral')

      if (fullRes.ok || (fullRes.data && !fullRes.data.error) || !isHorarioLaboral) {
        return NextResponse.json(fullRes.data)
      }

      // Fallback a básica
      console.log('[EcuadorAPI] Full no disponible (horario), usando básica...')
      const basicRes = await doRequest(false)
      const basicData = basicRes.data
      basicData._fallback = true
      return NextResponse.json(basicData)
    }

    // 2. RUC o cédula sin full → consulta básica directa
    const res = await doRequest(false)
    return NextResponse.json(res.data)
  } catch (error: any) {
    console.error('Ecuador API Proxy Error:', error)
    return NextResponse.json({ success: false, message: 'Fallo la comunicación con el proveedor (Ecuador)' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const ACTIVE_TOKEN = request.headers.get('x-apiconsult-token')

  if (!ACTIVE_TOKEN) {
    return NextResponse.json({ success: false, message: 'ApiConsult Token no configurado' }, { status: 500 })
  }

  try {
    const body = await request.json()

    console.log('[EcuadorAPI] Firmando comprobante...')
    const response = await fetch('https://apiconsult.zampisoft.com/api/firmar', {
      method: 'POST',
      headers: {
        'X-API-KEY': ACTIVE_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('[EcuadorAPI] Error firmar:', response.status, data.error || data.message)
      return NextResponse.json({ success: false, message: data.error || data.message || `Error HTTP ${response.status}` }, { status: response.status })
    }
    return NextResponse.json({ success: true, ...data })
  } catch (error: any) {
    console.error('Ecuador API Sign Error:', error)
    return NextResponse.json({ success: false, message: 'Fallo la comunicación con el firmador (Ecuador)' }, { status: 500 })
  }
}
