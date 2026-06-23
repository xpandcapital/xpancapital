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
  ruta_inicio?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, nombre?: string, apellido?: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
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
      .select('id, email, nombre, apellido, avatar_url, blis_coins, rol, empresa_id')
      .eq('id', userId)
      .single()

    let rutaInicio: string | null = null

    if (error) {
      if (error.code === '406' || error.message?.includes('406') || error.message?.includes('Not Acceptable') || error.code === 'PGRST116') {
        console.warn('[Auth] Profile not found or 406 - retrying and creating if needed.')
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (retryError && retryError.code !== 'PGRST116') return null
        if (!retryData) {
          const { data: authUser } = await supabase.auth.getUser(userId)
          if (authUser?.user?.email) {
            const email = authUser.user.email
            const nombre = (authUser.user.user_metadata?.nombre as string) || email.split('@')[0]
            const rol = (authUser.user.app_metadata?.rol as string) || 'usuario'
            await supabase.from('profiles').insert({
              id: userId,
              email,
              nombre,
              rol,
              empresa_id: EMPRESA_ID,
            })
            return {
              id: userId,
              email,
              name: nombre,
              role: rol as UserRole,
              blis_coins: 0,
              empresa_id: EMPRESA_ID,
              permisos_adicionales: null,
              ruta_inicio: null,
            }
          }
          return null
        }
        const p = retryData as any
        const rol = (p.rol || 'usuario') as UserRole
        const validRoles: UserRole[] = ['superadmin', 'admin', 'editor', 'empleado', 'cliente', 'usuario']
        const normalizedRol = validRoles.includes(rol) ? rol : 'usuario'
        return {
          id: p.id,
          email: p.email || '',
          name: `${p.nombre || ''} ${p.apellido || ''}`.trim(),
          profilePic: p.avatar_url,
          blis_coins: p.blis_coins || 0,
          role: normalizedRol,
          phone: undefined,
          empresa_id: p.empresa_id || EMPRESA_ID,
          permisos_adicionales: p.permisos_adicionales || null,
          ruta_inicio: null,
        }
      }
      return null
    }

    if (!data) return null

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
    const validRoles: UserRole[] = ['superadmin', 'admin', 'editor', 'empleado', 'cliente', 'usuario']
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
      ruta_inicio: null,
    }
  } catch {
    return null
  }
}

const CACHE_KEY = 'blis_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Si hay cache en localStorage, iniciar sin loading para evitar skeleton/flash
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        setUser(JSON.parse(cached))
        setLoading(false)
      }
    } catch {}
  }, [])

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
    if (!supabase) return

    // Obtener sesión inicial — si ya tenemos cache, actualizar en background
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id)
          if (profile && mounted) {
            setUser(profile)
          } else if (mounted) {
            // Si fetchProfile falla, NO borrar datos del cache
            // Usar datos del JWT + preservar cache existente
            const rol = (session.user.app_metadata?.rol as UserRole) || 'usuario'
            setUser(prev => {
              if (prev && prev.id === session.user.id) {
                // Ya tenemos datos del cache — solo actualizar rol y empresa_id
                return { ...prev, role: rol, empresa_id: session.user.app_metadata?.empresa_id || prev.empresa_id || EMPRESA_ID }
              }
              // No hay cache — crear usuario básico del JWT
              return { id: session.user.id, email: session.user.email || '', role: rol, blis_coins: 0, empresa_id: session.user.app_metadata?.empresa_id || EMPRESA_ID, permisos_adicionales: null, ruta_inicio: null }
            })
          }
        } catch (err) {
          console.error('[Auth] Error fetching profile:', err)
          if (mounted) {
            const rol = (session.user.app_metadata?.rol as UserRole) || 'usuario'
            setUser(prev => {
              if (prev && prev.id === session.user.id) {
                return { ...prev, role: rol }
              }
              return { id: session.user.id, email: session.user.email || '', role: rol, blis_coins: 0, empresa_id: session.user.app_metadata?.empresa_id || EMPRESA_ID, permisos_adicionales: null, ruta_inicio: null }
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
            setUser(prev => {
              if (prev && prev.id === profile.id) {
                return { ...prev, ...profile }
              }
              return profile
            })
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

  // Timeout de seguridad: si loading no se resuelve en 8 segundos, forzar false
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('[Auth] Timeout: forzando loading=false después de 8s')
          return false
        }
        return prev
      })
    }, 8000)
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
          ruta_inicio: null,
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

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo enviar el correo' }
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

  const updateProfile = async (data: { name?: string; profilePic?: string | null; email?: string; phone?: string; nombre?: string; apellido?: string }) => {
    if (!user) return
    const previousUser = user

    const displayName = data.nombre !== undefined && data.apellido !== undefined
      ? `${data.nombre} ${data.apellido}`.trim()
      : data.name
    const updatedUser = { ...user, ...data, name: displayName }
    setUser(updatedUser)

    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        const updateData: Record<string, unknown> = {}
        if (data.nombre !== undefined || data.apellido !== undefined) {
          updateData.nombre = data.nombre || ''
          updateData.apellido = data.apellido || ''
        } else if (data.name !== undefined) {
          const parts = data.name.trim().split(' ')
          updateData.nombre = parts[0] || ''
          updateData.apellido = parts.slice(1).join(' ') || ''
        }
        if (data.profilePic !== undefined) {
          if (data.profilePic && data.profilePic.startsWith('data:image')) {
            try {
              const fileExt = data.profilePic.includes('image/png') ? 'png' : 'jpg'
              const fileName = `${user.id}-avatar.${fileExt}`
              const base64Data = data.profilePic.split(',')[1]
              const byteCharacters = atob(base64Data)
              const byteArray = new Uint8Array(byteCharacters.length)
              for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i)
              }
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, byteArray, {
                  contentType: data.profilePic.includes('image/png') ? 'image/png' : 'image/jpeg',
                  upsert: true,
                })
              if (!uploadError && uploadData) {
                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
                if (urlData?.publicUrl) {
                  updateData.avatar_url = urlData.publicUrl
                  // Actualizar el estado con la URL real de Storage
                  setUser(prev => prev ? { ...prev, profilePic: urlData.publicUrl } : prev)
                }
              } else {
                console.warn('[Auth] Storage upload failed:', uploadError)
                // No guardar base64 en la BD — es muy grande
              }
            } catch (uploadErr) {
              console.warn('[Auth] Error uploading avatar:', uploadErr)
            }
          } else if (data.profilePic === null) {
            updateData.avatar_url = null
          } else {
            // Es una URL existente (ya estaba en Storage)
            updateData.avatar_url = data.profilePic
          }
        }
        if (data.phone !== undefined) updateData.telefono = data.phone

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

          if (error) {
            console.error('[Auth] Error guardando perfil en BD:', error)
            // Revertir al estado anterior si falló el guardado
            setUser(previousUser)
          }
          // No llamamos refreshUser() aquí — el estado local ya es correcto
          // y refreshUser() causaría un race condition sobreescribiendo los datos
        }
      }
    } catch (err) {
      console.error('[Auth] Error guardando perfil:', err)
      // Revertir al estado anterior si falló
      setUser(previousUser)
    }
  }

  const refreshUser = async () => {
    if (!user) return
    const profile = await fetchProfile(user.id)
    if (profile) {
      setUser(profile)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, signUp, resetPassword, logout, updateProfile, refreshUser }}>
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