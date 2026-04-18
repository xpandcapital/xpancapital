import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/superadmin', '/miembros', '/admin']
const authPaths = ['/login', '/register', '/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  const sessionToken = request.cookies.get('sb-access-token')?.value
    || request.cookies.get('supabase-auth-token')?.value

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/superadmin/:path*', '/miembros/:path*', '/admin/:path*'],
}