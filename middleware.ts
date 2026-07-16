// Middleware unificado — Supabase con timeout corto, rutas publicas sin auth
import { updateSession } from '@/lib/supabase/middleware'
import { getSecurityConfig } from '@/lib/security-config'
import type { UnifiedSecurityConfig } from '@/lib/security-config'
import { getCountryFromRequest, checkGeoBlock } from '@/lib/geoblock'
import { injectHeaders } from '@/lib/security-headers'
import { matchRateLimit, checkInMemory } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/access-logs'
import { checkAlerts, dispatchAlerts } from '@/lib/security-alerts'
import { NextResponse, type NextRequest } from 'next/server'

const IS_DEV = process.env.NODE_ENV === 'development'
const SUPABASE_TIMEOUT_MS = 3000

function timeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         '127.0.0.1'
}

function countryFromReq(request: NextRequest): string {
  return request.headers.get('x-vercel-ip-country') || ''
}

const PUBLIC_PATHS = [
  '/', '/blog', '/tienda', '/cursos', '/proyectos',
  '/verificar', '/gracias', '/f', '/formulario', '/embudo',
  '/calendario', '/certificado', '/login', '/embed', '/legal', '/s',
  '/compras', '/api/compras/aprobar', '/api/compras/rechazar',
]

const BLIS_AUTH_HEADERS = ['x-blis-user-id', 'x-blis-empresa-id', 'x-blis-user-rol', 'x-blis-user-email']

function sanitizedNext(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers)
  BLIS_AUTH_HEADERS.forEach(h => headers.delete(h))
  return NextResponse.next({ request: { headers } })
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method
  const ip = getClientIP(request)
  const ua = request.headers.get('user-agent') || ''

  // Links mágicos de aprobación/rechazo: siempre públicos, sin auth
  if (pathname.startsWith('/api/compras/aprobar/') || pathname.startsWith('/api/compras/rechazar/') || pathname === '/compras/aprobada') {
    return sanitizedNext(request)
  }

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isProtected = pathname.startsWith('/superadmin') || pathname.startsWith('/miembros') || pathname.startsWith('/admin')
  const hasSupabaseCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  // Rutas publicas sin cookie de sesion: SIN Supabase, respuesta inmediata
  if (isPublic && !hasSupabaseCookie && !isProtected) {
    return sanitizedNext(request)
  }

  const fallbackSec = { geobloqueo: null, security_headers: null, rate_limiting: null, alerts: null }

  // 3. Auth + Security en PARALELO para rutas protegidas
  const fallbackResponse = isProtected
    ? NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url))
    : sanitizedNext(request)

  let response: NextResponse
  if (isProtected || hasSupabaseCookie || pathname === '/login') {
    const [sec, auth] = await Promise.all([
      timeout(getSecurityConfig(), SUPABASE_TIMEOUT_MS, fallbackSec),
      timeout(updateSession(request), SUPABASE_TIMEOUT_MS, fallbackResponse),
    ])
    const secConfig = sec as UnifiedSecurityConfig
    response = auth

    // 1. Geobloqueo
    if (secConfig.geobloqueo) {
      const country = getCountryFromRequest(request)
      const geoResult = checkGeoBlock(country || '', secConfig.geobloqueo)
      if (geoResult.blocked) {
        logSecurityEvent({ ip, pais: geoResult.country || 'XX', ruta: pathname, metodo: method, motivo: 'geobloqueo', user_agent: ua })
        return new NextResponse('Acceso denegado desde tu ubicación', { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }
    }

    // 2. Rate Limiting
    if (secConfig.rate_limiting) {
      const regla = matchRateLimit(secConfig.rate_limiting, pathname, method)
      if (regla) {
        const result = checkInMemory(ip, pathname, method, regla.limite, regla.ventana_segundos)
        if (!result.allowed) {
          logSecurityEvent({ ip, pais: countryFromReq(request) || 'XX', ruta: pathname, metodo: method, motivo: 'rate_limit', user_agent: ua })
          return new NextResponse(secConfig.rate_limiting.mensaje_limite, { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': String(Math.ceil(result.resetMs / 1000)) } })
        }
      }
    }

    // 3. Security Headers
    if (secConfig.security_headers) {
      try { injectHeaders(response, secConfig.security_headers) } catch {}
    }
  } else {
    const secConfig = await timeout(getSecurityConfig(), SUPABASE_TIMEOUT_MS, fallbackSec)
    response = sanitizedNext(request)
    if (secConfig.security_headers) {
      try { injectHeaders(response, secConfig.security_headers) } catch {}
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
