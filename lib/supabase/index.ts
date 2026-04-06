// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - SUPABASE CLIENT HELPERS
// Cliente tipado con patrones de seguridad y error handling
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTE PARA NAVEGADOR (Client-side)
// ═══════════════════════════════════════════════════════════════════════════════

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTE ADMIN (Service Role - SOLO SERVER-SIDE)
// ═══════════════════════════════════════════════════════════════════════════════

export const supabaseAdmin: SupabaseClient | null = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE RESPUESTA
// ═══════════════════════════════════════════════════════════════════════════════

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export function createResult<T>(data: T): Result<T> {
  return { success: true, data }
}

export function createError(error: unknown): Result<never> {
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error'
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN DE RETRY CON BACKOFF
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA USUARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, nivel:niveles_cliente(*)')
    .eq('id', user.id)
    .single()
  
  return profile
}

export async function getProfileByEmpresa(empresaId: string) {
  const user = await getCurrentUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, nivel:niveles_cliente(*)')
    .eq('id', user.id)
    .eq('empresa_id', empresaId)
    .single()
  
  return profile
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA BLOG
// ═══════════════════════════════════════════════════════════════════════════════

export async function getBlogPosts(empresaId: string, options?: {
  categoria?: string
  tag?: string
  estado?: 'borrador' | 'publicado' | 'archivado'
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      categoria:blog_categorias(*),
      autor:profiles(id, nombre, apellido, avatar_url),
      tags:blog_posts_tags(tag:blog_tags(*))
    `)
    .eq('empresa_id', empresaId)
    .order('publicado_en', { ascending: false })
  
  if (options?.estado) {
    query = query.eq('estado', options.estado)
  }
  
  if (options?.categoria) {
    query = query.eq('categoria_id', options.categoria)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) return createError(error)
  return createResult(data)
}

export async function getBlogPostBySlug(empresaId: string, slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      categoria:blog_categorias(*),
      autor:profiles(id, nombre, apellido, avatar_url),
      tags:blog_posts_tags(tag:blog_tags(*))
    `)
    .eq('empresa_id', empresaId)
    .eq('slug', slug)
    .single()
  
  if (error) return createError(error)
  return createResult(data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getProductos(empresaId: string, options?: {
  categoria?: string
  tipo?: string
  destacado?: boolean
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('productos')
    .select(`
      *,
      categoria:producto_categorias(*)
    `)
    .eq('empresa_id', empresaId)
    .eq('activo', true)
    .order('creado_en', { ascending: false })
  
  if (options?.categoria) {
    query = query.eq('categoria_id', options.categoria)
  }
  
  if (options?.tipo) {
    query = query.eq('tipo', options.tipo)
  }
  
  if (options?.destacado) {
    query = query.eq('destacado', true)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) return createError(error)
  return createResult(data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA BLIS COINS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getUserBalance(userId: string): Promise<Result<number>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('blis_coins')
    .eq('id', userId)
    .single()
  
  if (error) return createError(error)
  return createResult((data as { blis_coins: number })?.blis_coins || 0)
}

export async function getCoinsTransactions(
  userId: string, 
  options?: { limit?: number; offset?: number }
) {
  let query = supabase
    .from('boveda_transacciones')
    .select('*')
    .eq('user_id', userId)
    .order('creado_en', { ascending: false })
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) return createError(error)
  return createResult(data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA COMPRAS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCompras(userId: string, options?: {
  estado?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('compras')
    .select(`
      *,
      producto:productos(*),
      direccion:direcciones(*)
    `)
    .eq('user_id', userId)
    .order('creado_en', { ascending: false })
  
  if (options?.estado) {
    query = query.eq('estado', options.estado)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) return createError(error)
  return createResult(data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA EMPRESAS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getEmpresaBySlug(slug: string) {
  const { data, error } = await supabase
    .from('empresas')
    .select('*, config:empresa_config(*)')
    .eq('slug', slug)
    .single()
  
  if (error) return createError(error)
  return createResult(data)
}

export async function getEmpresaConfig(empresaId: string) {
  const { data, error } = await supabase
    .from('empresa_config')
    .select('*')
    .eq('empresa_id', empresaId)
    .single()
  
  if (error) return createError(error)
  return createResult(data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA NIVELES
// ═══════════════════════════════════════════════════════════════════════════════

export async function getNivelesCliente(empresaId: string) {
  const { data, error } = await supabase
    .from('niveles_cliente')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('orden', { ascending: true })
  
  if (error) return createError(error)
  return createResult(data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════

export async function getNotificaciones(userId: string, options?: {
  leida?: boolean
  limit?: number
}) {
  let query = supabase
    .from('notificaciones')
    .select('*')
    .eq('user_id', userId)
    .order('creado_en', { ascending: false })
  
  if (options?.leida !== undefined) {
    query = query.eq('leida', options.leida)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) return createError(error)
  return createResult(data)
}

export async function markNotificacionLeida(notificacionId: string) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true, leida_en: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', notificacionId)
  
  if (error) return createError(error)
  return createResult(true)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE SUSCRIPCIÓN REALTIME
// ═══════════════════════════════════════════════════════════════════════════════

export function subscribeToBalance(
  userId: string,
  callback: (balance: number) => void
) {
  const channel = supabase
    .channel(`balance-${userId}`)
    .on(
      'postgres_changes' as const,
      {
        event: '*',
        schema: 'public',
        table: 'boveda_transacciones',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const result = await getUserBalance(userId)
        if (result.success) {
          callback(result.data)
        }
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Record<string, unknown>) => void
) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes' as const,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Record<string, unknown>)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  supabase,
  supabaseAdmin,
  createResult,
  createError,
  fetchWithRetry,
  getCurrentUser,
  getCurrentProfile,
  getProfileByEmpresa,
  getBlogPosts,
  getBlogPostBySlug,
  getProductos,
  getUserBalance,
  getCoinsTransactions,
  getCompras,
  getEmpresaBySlug,
  getEmpresaConfig,
  getNivelesCliente,
  getNotificaciones,
  markNotificacionLeida,
  subscribeToBalance,
  subscribeToNotifications,
}