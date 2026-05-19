// Middleware principal de autenticación, autorización, geobloqueo y security headers
import { updateSession } from '@/lib/supabase/middleware'
import { shouldGeoBlock } from '@/lib/geoblock'
import { getSecurityHeaders, injectHeaders } from '@/lib/security-headers'
import { NextResponse, type NextRequest } from 'next/server'

const IS_DEV = process.env.NODE_ENV === 'development'

export async function middleware(request: NextRequest) {
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

  // 2. Autenticación y autorización
  const response = await updateSession(request)

  // 3. Inyectar cabeceras de seguridad HTTP
  try {
    const secHeaders = await getSecurityHeaders()
    if (secHeaders) {
      injectHeaders(response, secHeaders)
      if (IS_DEV) console.log('[Middleware] Security Headers inyectados')
    }
  } catch {
    // Silencioso - no bloquear por fallo en headers
  }

  return response
}

export const config = {
  // Ejecutar en todas las rutas excepto archivos estáticos e imágenes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
