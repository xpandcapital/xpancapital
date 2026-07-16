import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLE_DEFAULTS } from '@/lib/auth/permissions'
import type { UserRole } from '@/lib/auth/permissions'

const SECTION_ROUTES: Record<string, string[]> = {
  'dashboard:ver': ['/superadmin'],
  'proyectos:ver': ['/superadmin/proyectos'],
  'lotes:ver': ['/superadmin/gestion-lotes'],
  'contratos:ver': ['/superadmin/contratos'],
  'asesores:ver': ['/superadmin/asesores'],
  'pos:ver': ['/superadmin/pos'],
  'ventas:ver': ['/superadmin/ventas'],
  'formasdepago:ver': ['/superadmin/formasdepago'],
  'productos:ver': ['/superadmin/productos'],
  'clientes:ver': ['/superadmin/clientes'],
  'cursos:ver': ['/superadmin/cursos'],
  'biblioteca:ver': ['/superadmin/biblioteca'],
  'certificados:ver': ['/superadmin/certificados'],
  'trading:ver': ['/superadmin/trading'],
  'templates:ver': ['/superadmin/templates'],
  'mails:ver': ['/superadmin/mails'],
  'calendarios:ver': ['/superadmin/calendarios'],
  'formularios:ver': ['/superadmin/formularios'],
  'leads:ver': ['/superadmin/leads'],
  'campanas:ver': ['/superadmin/campanas', '/superadmin/whatsapp'],
  'blog:ver': ['/superadmin/blog'],
  'equipo:ver': ['/superadmin/usuarios'],
  'postulantes:ver': ['/superadmin/postulantes'],
  'utilidades:ver': ['/superadmin/utilidades'],
  'configuracion:ver': ['/superadmin/configuracion'],
  'api-nube:ver': ['/superadmin/api-nube'],
  'analiticas:ver': ['/superadmin/analiticas'],
  'ajustes:ver': ['/superadmin/ajustes'],
  'roles:ver': ['/superadmin/ajustes/roles'],
  'perfil:ver': ['/superadmin/perfil'],
  'miembros:ver': ['/miembros'],
  'chat:ver': ['/superadmin/chat'],
  'correo:ver': ['/superadmin/correo'],
  'notificaciones:ver': ['/superadmin/notificaciones'],
  'transmisiones:ver': ['/superadmin/transmisiones'],
}

function canAccess(rol: string, pathname: string): boolean {
  if (pathname === '/superadmin' || pathname === '/superadmin/') return true
  if (pathname === '/superadmin/perfil') return true

  const normalizedRol = (rol || 'usuario') as UserRole
  const defaults = ROLE_DEFAULTS[normalizedRol]
  if (!defaults) return false
  if ((defaults as string[]).includes('*')) return true

  for (const [permission, routes] of Object.entries(SECTION_ROUTES)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return defaults.includes(permission as any)
    }
  }

  return true
}

const BLIS_AUTH_HEADERS = ['x-blis-user-id', 'x-blis-empresa-id', 'x-blis-user-rol', 'x-blis-user-email']

function sanitizedHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers)
  BLIS_AUTH_HEADERS.forEach(h => headers.delete(h))
  return headers
}

export async function updateSession(request: NextRequest) {
  // Sanitizar: eliminar headers de auth falsificables enviados por el cliente
  let forwardedHeaders = sanitizedHeaders(request)

  let supabaseResponse = NextResponse.next({ request: { headers: forwardedHeaders } })

  const { pathname } = request.nextUrl

  const publicPaths = [
    '/', '/blog', '/tienda', '/cursos', '/proyectos',
    '/verificar', '/gracias', '/f', '/formulario', '/embudo',
    '/calendario', '/certificado', '/login', '/embed',
  ]
  const isPublic = publicPaths.some(p =>
    pathname === p || pathname.startsWith(p + '/')
  )
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
    pathname.startsWith('/api/postulantes/public') ||
    pathname.startsWith('/api/postulantes/puestos/by-slug') ||
    pathname.startsWith('/api/postulantes/upload') ||
    pathname.startsWith('/api/postulantes/puestos') ||
    pathname.startsWith('/api/cms/landing') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/biblioteca')
  )

  // Early return: rutas públicas sin cookies de sesión → omitir getUser()
  const isSuperadmin = pathname.startsWith('/superadmin')
  const isMiembros = pathname.startsWith('/miembros')
  const isAdmin = pathname.startsWith('/admin')
  const isLogin = pathname === '/login'
  const isProtected = isSuperadmin || isMiembros || isAdmin || isLogin

  if (!isProtected && (isPublic || isPublicApi)) {
    const hasSupabaseCookie = request.cookies.getAll().some(
      c => c.name.startsWith('sb-')
    )
    if (!hasSupabaseCookie) {
      return NextResponse.next({ request: { headers: forwardedHeaders } })
    }
  }

  let user: any = null
  let profileRol: string | null = null
  let profileEmpresaId: string | null = null

  try {
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
            forwardedHeaders = sanitizedHeaders(request)
            supabaseResponse = NextResponse.next({ request: { headers: forwardedHeaders } })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser

    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol, empresa_id')
        .eq('id', user.id)
        .single()
      if (profile?.rol) profileRol = profile.rol
      if (profile?.empresa_id) profileEmpresaId = profile.empresa_id
    }
  } catch (error) {
    console.error('[Middleware] Error al verificar sesión:', error)
  }

  // 1. No autenticado → redirigir a login
  if (!user && (isSuperadmin || isMiembros || isAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 2. Autenticado en login → redirigir según rol
  if (user && isLogin) {
    const rol = profileRol || user.app_metadata?.rol || user.app_metadata?.role || 'usuario'
    if (['superadmin', 'admin', 'editor', 'empleado'].includes(rol)) {
      const url = request.nextUrl.clone()
      const redirectParam = url.searchParams.get('redirect')
      url.pathname = redirectParam || '/superadmin'
      url.searchParams.delete('redirect')
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  // 3. Cliente/usuario intentando acceder a superadmin/admin → redirigir a miembros
  if (user && (isSuperadmin || isAdmin)) {
    const rol = profileRol || user.app_metadata?.rol || user.app_metadata?.role || 'usuario'
    if (['cliente', 'usuario'].includes(rol)) {
      const url = request.nextUrl.clone()
      url.pathname = '/miembros'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    // 4. Verificar permisos granulares por sección
    if (!canAccess(rol, pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/superadmin'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  // 5. Redirigir /admin a /superadmin
  if (isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/admin', '/superadmin')
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 6. Inyectar headers de sesion en el REQUEST para que API routes no re-consulten Supabase
  if (user?.id) {
    forwardedHeaders.set('x-blis-user-id', user.id)
    if (profileRol) forwardedHeaders.set('x-blis-user-rol', profileRol)
    if (user.email) forwardedHeaders.set('x-blis-user-email', user.email)
    // empresa_id desde profile (mas confiable que app_metadata)
    const empresaId = profileEmpresaId || (user.app_metadata as any)?.empresa_id
    if (empresaId) forwardedHeaders.set('x-blis-empresa-id', empresaId)

    const finalResponse = NextResponse.next({ request: { headers: forwardedHeaders } })
    supabaseResponse.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return finalResponse
  }

  return supabaseResponse
}