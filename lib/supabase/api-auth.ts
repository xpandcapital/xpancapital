import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export interface AuthUser {
  userId: string
  empresaId: string
  rol: string
  email?: string
}

/**
 * Obtiene el usuario autenticado. 
 * PRIMERO revisa headers inyectados por el middleware (0 llamadas a Supabase).
 * Solo si no hay headers, consulta Supabase (fallback).
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  // Fast path: headers del middleware (ya autenticado, 0 consultas a Supabase)
  const headerUserId = request.headers.get('x-blis-user-id')
  const headerEmpresaId = request.headers.get('x-blis-empresa-id')
  const headerRol = request.headers.get('x-blis-user-rol')
  const headerEmail = request.headers.get('x-blis-user-email')

  if (headerUserId) {
    return {
      userId: headerUserId,
      empresaId: headerEmpresaId || DEFAULT_EMPRESA_ID,
      rol: headerRol || 'usuario',
      email: headerEmail || undefined,
    }
  }

  // Slow path: consultar Supabase (solo si el middleware no paso los headers)
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser?.id) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id, rol, email')
      .eq('id', authUser.id)
      .single()

    return {
      userId: authUser.id,
      empresaId: profile?.empresa_id || DEFAULT_EMPRESA_ID,
      rol: profile?.rol || 'usuario',
      email: profile?.email || authUser.email,
    }
  } catch (error) {
    console.error('[api-auth] Error:', error)
    return null
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false
  return ['superadmin', 'admin'].includes(user.rol)
}
