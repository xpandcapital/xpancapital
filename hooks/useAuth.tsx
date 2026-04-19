// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - HOOK DE AUTENTICACIÓN
// Usa @supabase/ssr createBrowserClient para sincronizar sesión en cookies
// Compatible con el middleware que lee cookies para verificar auth
// ═══════════════════════════════════════════════════════════════════════════════
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
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

// Obtener el cliente singleton de Supabase (compatible con SSR)
function getSupabaseClient() {
  if (typeof window === 'undefined') return null
  return getSupabase()
}

async function fetchProfile(userId: string): Promise<User | null> {
  const supabase = getSupabaseClient()
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

const CACHE_KEY = 'blis_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar desde cache si existe (evita flash de "no logueado")
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  })
  // Si ya hay usuario del cache, no mostrar loading
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return !cached
    } catch { return true }
  })
  const router = useRouter()

  // Persistir usuario en cache cuando cambia
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (user) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(CACHE_KEY)
      }
    } catch {}
  }, [user])

  useEffect(() => {
    let mounted = true
    const supabase = getSupabaseClient()

    // Obtener sesión inicial — si ya tenemos cache, actualizar en background
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id)
          if (profile && mounted) {
            setUser(profile)
          } else if (mounted) {
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
        } catch (err) {
          console.error('[Auth] Error fetching profile:', err)
          if (mounted) {
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
      }
      if (mounted) setLoading(false)
    }).catch((err) => {
      console.error('[Auth] Error getting session:', err)
      if (mounted) setLoading(false)
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
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Timeout de seguridad: si loading no se resuelve en 5 segundos, forzar false
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('[Auth] Timeout: forzando loading=false después de 5s')
      setLoading(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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