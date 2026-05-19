// Middleware principal de autenticación, autorización y geobloqueo
import { updateSession } from '@/lib/supabase/middleware'
import { shouldGeoBlock } from '@/lib/geoblock'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Geobloqueo: verificar antes de cualquier otra lógica
  const geoResult = await shouldGeoBlock(request)
  if (geoResult.blocked) {
    return new NextResponse('Acceso denegado desde tu ubicación', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // 2. Autenticación y autorización
  return await updateSession(request)
}

export const config = {
  // Ejecutar en todas las rutas excepto archivos estáticos e imágenes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
