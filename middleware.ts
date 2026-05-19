// Middleware unificado — 1 consulta a BD, distribuye a todos los módulos de seguridad
import { updateSession } from '@/lib/supabase/middleware'
import { getSecurityConfig } from '@/lib/security-config'
import { getCountryFromRequest, checkGeoBlock } from '@/lib/geoblock'
import { injectHeaders } from '@/lib/security-headers'
import { matchRateLimit, checkInMemory } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/access-logs'
import { checkAlerts, dispatchAlerts } from '@/lib/security-alerts'
import { NextResponse, type NextRequest } from 'next/server'

const IS_DEV = process.env.NODE_ENV === 'development'

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         '127.0.0.1'
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method
  const ip = getClientIP(request)
  const ua = request.headers.get('user-agent') || ''

  // 0. Consultar configuración de seguridad UNA SOLA VEZ (caché 30s)
  const secConfig = await getSecurityConfig()

  // 1. Geobloqueo
  const country = getCountryFromRequest(request)
  const geoResult = checkGeoBlock(country || '', secConfig.geobloqueo)

  if (IS_DEV && geoResult.country) {
    console.log('[Middleware] GeoBlock:', JSON.stringify(geoResult))
  }

  if (geoResult.blocked) {
    logSecurityEvent({
      ip, pais: geoResult.country || 'XX', ruta: pathname,
      metodo: method, motivo: 'geobloqueo', user_agent: ua,
    })
    const alerts = checkAlerts('geobloqueo', geoResult.country || 'XX', ip, pathname, secConfig.alerts)
    if (alerts) dispatchAlerts(alerts, secConfig.alerts!)
    return new NextResponse('Acceso denegado desde tu ubicación', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // 2. Rate Limiting
  if (secConfig.rate_limiting) {
    const regla = matchRateLimit(secConfig.rate_limiting, pathname, method)
    if (regla) {
      const result = checkInMemory(ip, pathname, method, regla.limite, regla.ventana_segundos)
      if (!result.allowed) {
        logSecurityEvent({
          ip, pais: country || 'XX', ruta: pathname,
          metodo: method, motivo: 'rate_limit', user_agent: ua,
        })
        const rlAlerts = checkAlerts('rate_limit', country || 'XX', ip, pathname, secConfig.alerts)
        if (rlAlerts) dispatchAlerts(rlAlerts, secConfig.alerts!)
        return new NextResponse(secConfig.rate_limiting.mensaje_limite, {
          status: 429,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Retry-After': String(Math.ceil(result.resetMs / 1000)),
          },
        })
      }
    }
  }

  // 3. Autenticación y autorización
  const response = await updateSession(request)

  // 4. Security Headers
  if (secConfig.security_headers) {
    try {
      injectHeaders(response, secConfig.security_headers)
      if (IS_DEV) console.log('[Middleware] Security Headers inyectados')
    } catch { /* silencioso */ }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
