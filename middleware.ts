// Middleware principal de autenticación y autorización
// Delega la lógica de sesión a @supabase/ssr y redirige según rol
import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Ejecutar en todas las rutas excepto archivos estáticos e imágenes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}