import { NextResponse } from 'next/server'

/**
 * API Pública de Tipo de Cambio
 * No requiere token. Usa fuentes gratuitas:
 * - Perú: SUNAT vía apis.net.pe
 * - Global: exchangerate-api.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = (searchParams.get('country') || 'PE').toUpperCase()

  try {
    // Perú → SUNAT directo (gratis, sin token)
    if (country === 'PE') {
      const res = await fetch('https://api.apis.net.pe/v1/tipo-cambio-sunat', {
        next: { revalidate: 3600 },
      })
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

    // Global → exchangerate-api.com (gratis, sin token)
    const currencies: Record<string, string> = {
      EC: 'USD', CO: 'COP', CL: 'CLP', MX: 'MXN',
      US: 'USD', ES: 'EUR', GLOBAL: 'USD',
    }
    const target = currencies[country] || 'USD'
    const base = country === 'US' ? 'USD' : 'USD'

    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    if (!res.ok || !data.rates) {
      return NextResponse.json({ success: false, message: 'No se pudo obtener TC global' }, { status: 502 })
    }

    const usdRate = data.rates.USD || 1
    const penRate = data.rates.PEN
    const targetRate = data.rates[target]

    return NextResponse.json({
      success: true,
      country,
      base: 'USD',
      rate: targetRate || usdRate,
      usdToPen: penRate || null,
      date: data.date,
      source: 'exchangerate-api.com',
    })
  } catch (error: any) {
    console.error('[TipoCambio] Error:', error)
    return NextResponse.json({ success: false, message: 'Fallo al obtener tipo de cambio' }, { status: 500 })
  }
}
