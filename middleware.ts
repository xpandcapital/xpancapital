// Middleware principal de autenticación, autorización, geobloqueo, rate limiting y security headers
import { updateSession } from '@/lib/supabase/middleware'
import { shouldGeoBlock } from '@/lib/geoblock'
import { getSecurityHeaders, injectHeaders } from '@/lib/security-headers'
import { getRateLimitingConfig, checkInMemory, matchRateLimit } from '@/lib/rate-limit'
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

  // 1. Geobloqueo: verificar antes de cualquier otra lógica
  const geoResult = await shouldGeoBlock(request)

  if (IS_DEV) {
    console.log('[Middleware] GeoBlock:', JSON.stringify(geoResult))
  }

  if (geoResult.blocked) {
    return new NextResponse('Acceso denegado desde tu ubicación', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // 2. Rate Limiting: verificar límites por IP y ruta
  try {
    const rlConfig = await getRateLimitingConfig()
    if (rlConfig?.habilitado) {
      const regla = matchRateLimit(rlConfig, pathname, method)
      if (regla) {
        const ip = getClientIP(request)
        const result = checkInMemory(ip, pathname, method, regla.limite, regla.ventana_segundos)
        if (!result.allowed) {
          if (IS_DEV) console.log(`[Middleware] Rate Limit: ${ip} en ${method} ${pathname}`)
          return new NextResponse(rlConfig.mensaje_limite, {
            status: 429,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Retry-After': String(Math.ceil(result.resetMs / 1000)),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0',
            },
          })
        }
      }
    }
  } catch {
    // Silencioso - no bloquear por fallo en rate limit
  }

  // 3. Autenticación y autorización
  const response = await updateSession(request)

  // 4. Inyectar cabeceras de seguridad HTTP
  try {
    const secHeaders = await getSecurityHeaders()
    if (secHeaders) {
      injectHeaders(response, secHeaders)
      if (IS_DEV) console.log('[Middleware] Security Headers inyectados')
    }
  } catch {
    // Silencioso
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
