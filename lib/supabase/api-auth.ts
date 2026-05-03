import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export interface AuthUser {
  userId: string
  empresaId: string
  rol: string
  email?: string
}

/**
 * Obtiene el usuario autenticado desde cookies/JWT en API routes.
 * Usa el mismo patrón que el middleware con @supabase/ssr.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op en API routes (no necesitamos setear cookies)
          },
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

    if (!profile?.empresa_id) return null

    return {
      userId: authUser.id,
      empresaId: profile.empresa_id,
      rol: profile.rol || 'usuario',
      email: profile.email || authUser.email,
    }
  } catch (error) {
    console.error('[api-auth] Error:', error)
    return null
  }
}

/**
 * Verifica si el usuario tiene rol admin o superadmin.
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false
  return ['superadmin', 'admin'].includes(user.rol)
}
