/**
 * Rate Limiting para BLIS Corp
 *
 * Implementación in-memory con token bucket por IP+ruta+minuto.
 * En producción (Vercel), cada instancia Edge tiene su propio contador.
 * Para rate limiting cross-instance, usar Upstash Redis (ver docs).
 *
 * Estructura en BD (site_config.security_config.rate_limiting):
 * {
 *   habilitado: true,
 *   mensaje_limite: "Demasiadas peticiones...",
 *   reglas: [{ ruta, metodo, limite, ventana_segundos, habilitado }]
 * }
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

// ============================================================================
// Tipos
// ============================================================================
export interface RateLimitRule {
  ruta: string
  metodo: string
  limite: number
  ventana_segundos: number
  habilitado: boolean
  descripcion: string
  protege_contra: string
}

export interface RateLimitingConfig {
  habilitado: boolean
  mensaje_limite: string
  reglas: RateLimitRule[]
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetMs: number
}

// ============================================================================
// Contador in-memory
// ============================================================================
interface CounterEntry {
  count: number
  resetAt: number
}

const counters = new Map<string, CounterEntry>()

function getKey(ip: string, ruta: string, metodo: string, ventanaSegundos: number): string {
  const bucket = Math.floor(Date.now() / (ventanaSegundos * 1000))
  return `rl:${ip}:${metodo}:${ruta}:${bucket}`
}

export function checkInMemory(
  ip: string,
  ruta: string,
  metodo: string,
  limite: number,
  ventanaSegundos: number
): RateLimitResult {
  const key = getKey(ip, ruta, metodo, ventanaSegundos)
  const now = Date.now()
  let entry = counters.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + ventanaSegundos * 1000 }
    counters.set(key, entry)
    return { allowed: true, remaining: limite - 1, limit: limite, resetMs: ventanaSegundos * 1000 }
  }

  entry.count++
  const remaining = limite - entry.count

  return {
    allowed: remaining >= 0,
    remaining: Math.max(0, remaining),
    limit: limite,
    resetMs: entry.resetAt - now
  }
}

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of counters) {
    if (now > entry.resetAt) counters.delete(key)
  }
}, 5 * 60 * 1000)

// ============================================================================
// Caché de configuración
// ============================================================================
let cachedConfig: RateLimitingConfig | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30 * 1000

export async function getRateLimitingConfig(): Promise<RateLimitingConfig | null> {
  const now = Date.now()
  if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedConfig
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) return null

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('site_config')
      .select('security_config')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    const rl = data?.security_config?.rate_limiting
    if (rl && typeof rl === 'object' && rl.habilitado) {
      cachedConfig = rl as RateLimitingConfig
      cacheTimestamp = now
      return cachedConfig
    }

    return null
  } catch {
    return null
  }
}

export function matchRateLimit(
  config: RateLimitingConfig,
  pathname: string,
  method: string
): RateLimitRule | null {
  for (const regla of config.reglas) {
    if (!regla.habilitado) continue
    if (regla.metodo !== method) continue
    if (pathname === regla.ruta || pathname.startsWith(regla.ruta + '/')) {
      return regla
    }
  }
  return null
}

export async function checkRateLimit(
  request: { headers: { get: (name: string) => string | null }; nextUrl: { pathname: string } }
): Promise<RateLimitResult | null> {
  const config = await getRateLimitingConfig()
  if (!config || !config.habilitado) return null

  const pathname = request.nextUrl.pathname
  const method = request.headers.get('x-forwarded-method') || request.headers.get('x-http-method-override') || 'GET'
  // En middleware de Next.js, el método real está en el request

  return null // Se resuelve en middleware.ts con el request real
}

export function checkRateLimitSync(
  config: RateLimitingConfig,
  ip: string,
  pathname: string,
  method: string
): RateLimitResult | null {
  if (!config.habilitado) return null

  const regla = matchRateLimit(config, pathname, method)
  if (!regla) return null

  return checkInMemory(ip, regla.ruta, method, regla.limite, regla.ventana_segundos)
}

export function invalidateRateLimitCache(): void {
  cachedConfig = null
  cacheTimestamp = 0
}
