// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - HOOK DE AUTENTICACIÓN
// Usa @supabase/ssr createBrowserClient para sincronizar sesión en cookies
// Compatible con el middleware que lee cookies para verificar auth
// ═══════════════════════════════════════════════════════════════════════════════
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/auth/permissions'
import type { PermisosAdicionales } from '@/lib/auth/permissions'

interface User {
  id: string
  role: UserRole
  email: string
  phone?: string
  name?: string
  profilePic?: string | null
  blis_coins?: number
  empresa_id?: string
  permisos_adicionales?: PermisosAdicionales | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, nombre?: string, apellido?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: { name?: string; profilePic?: string | null; email?: string; phone?: string }) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

function getSupabase() {
  if (typeof window === 'undefined') return null
  return createClient()
}

async function fetchProfile(userId: string): Promise<User | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, apellido, avatar_url, blis_coins, rol, empresa_id, permisos_adicionales')
      .eq('id', userId)
      .single()

    if (error || !data) return null

    const profile = data as {
      id: string
      email?: string
      nombre?: string
      apellido?: string
      avatar_url?: string
      blis_coins?: number
      rol?: string
      empresa_id?: string
      permisos_adicionales?: PermisosAdicionales | null
    }

    // Normalizar el rol: si no está en los roles válidos, usar 'usuario'
    let normalizedRol = (profile.rol || 'usuario') as UserRole
    const validRoles: UserRole[] = ['superadmin', 'admin', 'editor', 'cliente', 'usuario']
    if (!validRoles.includes(normalizedRol)) {
      normalizedRol = 'usuario'
    }

    return {
      id: profile.id,
      email: profile.email || '',
      name: `${profile.nombre || ''} ${profile.apellido || ''}`.trim(),
      profilePic: profile.avatar_url,
      blis_coins: profile.blis_coins || 0,
      role: normalizedRol,
      phone: undefined,
      empresa_id: profile.empresa_id || EMPRESA_ID,
      permisos_adicionales: profile.permisos_adicionales || null,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Escuchar cambios en la sesión de Supabase (login, logout, token refresh)
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) {
          setUser(profile)
        } else {
          // Si no hay profile, crear un usuario básico con datos de la sesión
          const rol = (session.user.app_metadata?.rol as UserRole) || 'usuario'
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: rol,
            blis_coins: 0,
            empresa_id: session.user.app_metadata?.empresa_id || EMPRESA_ID,
            permisos_adicionales: null,
          })
        }
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase()
    if (!supabase) {
      return { success: false, error: 'Supabase no está configurado' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id)
        if (profile) {
          setUser(profile)
          return { success: true }
        }
        // Fallback: usar datos del JWT si no hay profile
        const rol = (data.user.app_metadata?.rol as UserRole) || 'usuario'
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role: rol,
          blis_coins: 0,
          empresa_id: data.user.app_metadata?.empresa_id || EMPRESA_ID,
          permisos_adicionales: null,
        })
        return { success: true }
      }

      return { success: false, error: 'No se pudo obtener el perfil' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const signUp = async (email: string, password: string, nombre?: string, apellido?: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase()
    if (!supabase) {
      return { success: false, error: 'Supabase no está configurado' }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const logout = async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    router.push('/')
  }

  const updateProfile = (data: { name?: string; profilePic?: string | null; email?: string; phone?: string }) => {
    if (!user) return
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
  }

  const refreshUser = async () => {
    if (!user) return
    const profile = await fetchProfile(user.id)
    if (profile) {
      setUser(profile)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, signUp, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}