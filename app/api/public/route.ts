import { NextResponse } from 'next/server'

/**
 * API Pública de Servicios
 * Geocodificación (Nominatim), Clima (Open-Meteo), Países (REST Countries)
 * Los endpoints son configurables desde API Nube. Si no hay valor guardado, usa defaults.
 *
 * Parámetros:
 *   service   = geocode | weather | countries
 *   q         = query (dirección, país para geocode/countries)
 *   lat       = latitud (weather)
 *   lon       = longitud (weather)
 *   country   = código país (countries, opcional)
 */

const DEFAULTS: Record<string, string> = {
  nominatim: 'https://nominatim.openstreetmap.org',
  openmeteo: 'https://api.open-meteo.com/v1/forecast',
  countries: 'https://restcountries.com/v3.1',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const service = searchParams.get('service')

  // Leer headers de configuración enviados desde el cliente
  const nominatimUrl = request.headers.get('x-nominatim-endpoint') || DEFAULTS.nominatim
  const openmeteoUrl = request.headers.get('x-openmeteo-endpoint') || DEFAULTS.openmeteo
  const countriesUrl = request.headers.get('x-countries-endpoint') || DEFAULTS.countries

  try {
    // ── Geocodificación ──────────────────────────────────────
    if (service === 'geocode') {
      const q = searchParams.get('q')
      if (!q) return NextResponse.json({ success: false, message: 'Parámetro q requerido' }, { status: 400 })

      const res = await fetch(
        `${nominatimUrl}/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'BlisCorp/1.0' } }
      )
      const data = await res.json()
      return NextResponse.json({ success: true, data })
    }

    // ── Clima ───────────────────────────────────────────────
    if (service === 'weather') {
      const lat = searchParams.get('lat')
      const lon = searchParams.get('lon')
      if (!lat || !lon) return NextResponse.json({ success: false, message: 'lat y lon requeridos' }, { status: 400 })

      const res = await fetch(
        `${openmeteoUrl}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`
      )
      const data = await res.json()
      return NextResponse.json({ success: true, data })
    }

    // ── Países ──────────────────────────────────────────────
    if (service === 'countries') {
      const country = searchParams.get('country')
      const url = country
        ? `${countriesUrl}/name/${encodeURIComponent(country)}`
        : `${countriesUrl}/all?fields=name,flags,cca2,cca3,currencies,languages,capital,region,subregion,population,latlng,timezones`

      const res = await fetch(url)
      const data = await res.json()
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: false, message: `Servicio: ${service}. Usa: geocode, weather, countries` }, { status: 400 })
  } catch (error: any) {
    console.error('[PublicAPI] Error:', error)
    return NextResponse.json({ success: false, message: 'Fallo al obtener datos' }, { status: 500 })
  }
}
