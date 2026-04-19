// Middleware helper para Supabase SSR
// Refresca la sesión desde cookies, verifica autenticación y rol,
// y redirige según permisos del usuario
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Respuesta base que permite continuar con la petición
  let supabaseResponse = NextResponse.next({ request })

  let user: any = null

  try {
    // Crear cliente Supabase que lee/escribe cookies en la petición/respuesta
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refrescar la sesión y obtener el usuario autenticado
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // Si Supabase falla (red, cookies corruptas, etc.), continuar sin sesión
    // El usuario será tratado como no autenticado
    console.error('[Middleware] Error al verificar sesión:', error)
  }

  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    '/', '/blog', '/tienda', '/cursos', '/proyectos',
    '/verificar', '/gracias', '/f', '/formulario', '/embudo',
    '/calendario', '/certificado', '/login',
  ]
  const isPublic = publicPaths.some(p =>
    pathname === p || pathname.startsWith(p + '/')
  )
  // APIs públicas (leads, calendarios públicos, etc.)
  const isPublicApi = pathname.startsWith('/api/') && (
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/calendarios/public') ||
    pathname.startsWith('/api/formularios/public') ||
    pathname.startsWith('/api/templates/landing') ||
    pathname.startsWith('/api/templates/slug') ||
    pathname.startsWith('/api/templates/tipo') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/site-config') ||
    pathname.startsWith('/api/context') ||
    pathname.startsWith('/api/blog') ||
    pathname.startsWith('/api/cursos') ||
    pathname.startsWith('/api/asesores') ||
    pathname.startsWith('/api/campanas') ||
    pathname.startsWith('/api/verificar') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/images') ||
    pathname.startsWith('/api/sync-media') ||
    pathname.startsWith('/api/storage') ||
    pathname.startsWith('/api/envato') ||
    pathname.startsWith('/api/cms/landing')
  )

  // Rutas protegidas
  const isSuperadmin = pathname.startsWith('/superadmin')
  const isMiembros = pathname.startsWith('/miembros')
  const isAdmin = pathname.startsWith('/admin')
  const isLogin = pathname === '/login'

  // 1. Usuario no autenticado intentando acceder a ruta protegida → redirigir a login
  // IMPORTANTE: Las cookies de sesión se preservan en la redirección
  if (!user && (isSuperadmin || isMiembros || isAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    // Copiar las cookies refrescadas a la redirección
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 2. Usuario autenticado en login → NO redirigir automáticamente
  // Permitimos que el usuario vea la página de login incluso si ya tiene sesión.
  // La página /login maneja la redirección post-login en el frontend.
  if (user && isLogin) {
    const rol = user.app_metadata?.rol || 'usuario'
    if (['superadmin', 'admin', 'editor'].includes(rol)) {
      // Admin logueado intentando ir a login → redirigir a superadmin
      const url = request.nextUrl.clone()
      const redirectParam = url.searchParams.get('redirect')
      url.pathname = redirectParam || '/superadmin'
      url.searchParams.delete('redirect')
      // Copiar las cookies refrescadas a la redirección
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
    // Para clientes/usuarios, o sesiones sin rol definido, permitir la página de login
  }

  // 3. Cliente/usuario intentando acceder a superadmin o admin → redirigir a miembros
  if (user && (isSuperadmin || isAdmin)) {
    const rol = user.app_metadata?.rol || 'usuario'
    if (['cliente', 'usuario'].includes(rol)) {
      const url = request.nextUrl.clone()
      url.pathname = '/miembros'
      // Copiar las cookies refrescadas a la redirección
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  // 4. Redirigir /admin a /superadmin (unificado)
  if (isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/admin', '/superadmin')
    // Copiar las cookies refrescadas a la redirección
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 5. Para todo lo demás, continuar con la respuesta que incluye cookies refrescadas
  return supabaseResponse
}