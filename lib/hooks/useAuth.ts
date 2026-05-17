import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_EMPRESA_ID } from '../empresa'

function getSupabase() {
  if (typeof window === 'undefined') return null
  return createClient()
}

export interface User {
  id: string
  email: string
  nombre?: string
  apellido?: string
  avatar_url?: string
  blis_coins: number
  nivel_cliente_id?: string
  empresa_id: string
  rol: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  })

  const fetchUser = useCallback(async (userId: string) => {
    const supabase = getSupabase()
    if (!supabase) return null
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return data as User
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = getSupabase()
        
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            const profile = await fetchUser(session.user.id)
            setState({
              user: profile,
              loading: false,
              error: null,
              isAuthenticated: !!profile
            })
            return
          }
        }
      } catch (error) {
        // Silenciar error
      }

      setState({ user: null, loading: false, error: null, isAuthenticated: false })
    }

    initAuth()

    const supabase = getSupabase()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const profile = await fetchUser(session.user.id)
            setState({ user: profile, loading: false, error: null, isAuthenticated: !!profile })
          }
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, loading: false, error: null, isAuthenticated: false })
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [fetchUser])

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const supabase = getSupabase()
      if (!supabase) {
        return { success: false, error: 'Supabase no configurado' }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) throw error

      if (data.user) {
        const profile = await fetchUser(data.user.id)
        setState({ user: profile, loading: false, error: null, isAuthenticated: !!profile })
        return { success: true, user: profile }
      }

      return { success: false, error: 'No se pudo obtener el perfil' }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al iniciar sesión'
      setState(prev => ({ ...prev, loading: false, error: errorMsg }))
      return { success: false, error: errorMsg }
    }
  }, [fetchUser])

  const signUp = useCallback(async (email: string, password: string, nombre?: string, apellido?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const supabase = getSupabase()
      if (!supabase) {
        return { success: false, error: 'Supabase no configurado' }
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido,
            empresa_id: DEFAULT_EMPRESA_ID
          }
        }
      })

      if (error) throw error

      if (data.user) {
        return { success: true, user: data.user }
      }

      return { success: false, error: 'Error al crear cuenta' }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al registrarse'
      setState(prev => ({ ...prev, loading: false, error: errorMsg }))
      return { success: false, error: errorMsg }
    }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setState({ user: null, loading: false, error: null, isAuthenticated: false })
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refetch: () => state.user && fetchUser(state.user.id)
  }
}

export default useAuth