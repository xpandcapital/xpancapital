import { NextResponse } from 'next/server'

const DEFAULTS = {
  sunat: 'https://api.apis.net.pe/v1/tipo-cambio-sunat',
  global: 'https://api.exchangerate-api.com/v4/latest/USD',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = (searchParams.get('country') || 'PE').toUpperCase()

  const sunatUrl = request.headers.get('x-tipocambio-sunat-endpoint') || DEFAULTS.sunat
  const globalUrl = request.headers.get('x-tipocambio-global-endpoint') || DEFAULTS.global

  try {
    if (country === 'PE') {
      const res = await fetch(sunatUrl, { next: { revalidate: 3600 } })
      const data = await res.json()
      if (!res.ok || !data.compra) {
        return NextResponse.json({ success: false, message: 'No se pudo obtener TC de SUNAT' }, { status: 502 })
      }
      return NextResponse.json({
        success: true,
        country: 'PE',
        buy: data.compra,
        sell: data.venta,
        currency: data.moneda || 'USD',
        date: data.fecha,
        source: 'SUNAT',
      })
    }

    const res = await fetch(globalUrl, { next: { revalidate: 3600 } })
    const data = await res.json()
    if (!res.ok || !data.rates) {
      return NextResponse.json({ success: false, message: 'No se pudo obtener TC global' }, { status: 502 })
    }

    const penRate = data.rates.PEN
    const targetMap: Record<string, string> = { EC: 'USD', CO: 'COP', CL: 'CLP', MX: 'MXN', US: 'USD', ES: 'EUR', GLOBAL: 'USD' }
    const target = targetMap[country] || 'USD'
    const targetRate = data.rates[target]

    return NextResponse.json({
      success: true,
      country,
      base: 'USD',
      rate: targetRate || 1,
      usdToPen: penRate || null,
      date: data.date,
      source: 'exchangerate-api.com',
    })
  } catch (error: any) {
    console.error('[TipoCambio] Error:', error)
    return NextResponse.json({ success: false, message: 'Fallo al obtener tipo de cambio' }, { status: 500 })
  }
}
