/**
 * Configuración unificada de seguridad — consulta única a BD con caché compartido
 *
 * Reemplaza las consultas individuales de geoblock.ts, security-headers.ts y rate-limit.ts.
 * Resultado: 3 consultas por request → 1 consulta por request.
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

// ============================================================================
// Tipos exportados para que cada módulo los use
// ============================================================================
export interface CachedGeobloqueoConfig {
  habilitado: boolean
  modo: 'bloquear_lista' | 'permitir_lista'
  paises_bloqueados: string[]
  paises_permitidos: string[]
  mensaje_bloqueo: string
}

export interface CachedSecurityHeadersConfig {
  habilitado: boolean
  headers: Record<string, { habilitado: boolean; valor: string }>
}

export interface CachedRateLimitConfig {
  habilitado: boolean
  mensaje_limite: string
  reglas: Array<{
    ruta: string
    metodo: string
    limite: number
    ventana_segundos: number
    habilitado: boolean
    descripcion: string
    protege_contra: string
  }>
}

export interface UnifiedSecurityConfig {
  geobloqueo: CachedGeobloqueoConfig | null
  security_headers: CachedSecurityHeadersConfig | null
  rate_limiting: CachedRateLimitConfig | null
}

// ============================================================================
// Caché unificado (TTL 30s)
// ============================================================================
let cachedConfig: UnifiedSecurityConfig | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30 * 1000

function parseSecurityConfig(data: unknown): UnifiedSecurityConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = (data || {}) as Record<string, any>
  const geo = sc?.geobloqueo
  const headers = sc?.security_headers
  const rl = sc?.rate_limiting

  return {
    geobloqueo: (geo && typeof geo === 'object' && geo.habilitado === true) ? {
      habilitado: true,
      modo: geo.modo === 'permitir_lista' ? 'permitir_lista' : 'bloquear_lista',
      paises_bloqueados: Array.isArray(geo.paises_bloqueados) ? geo.paises_bloqueados : [],
      paises_permitidos: Array.isArray(geo.paises_permitidos) ? geo.paises_permitidos : [],
      mensaje_bloqueo: typeof geo.mensaje_bloqueo === 'string' ? geo.mensaje_bloqueo : 'Acceso denegado',
    } : null,

    security_headers: (headers && typeof headers === 'object' && headers.habilitado === true) ? headers : null,

    rate_limiting: (rl && typeof rl === 'object' && rl.habilitado === true) ? rl : null,
  }
}

export async function getSecurityConfig(): Promise<UnifiedSecurityConfig> {
  const now = Date.now()
  if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedConfig
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return { geobloqueo: null, security_headers: null, rate_limiting: null }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('site_config')
      .select('security_config')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    cachedConfig = parseSecurityConfig(data?.security_config)
    cacheTimestamp = now
    return cachedConfig
  } catch {
    return { geobloqueo: null, security_headers: null, rate_limiting: null }
  }
}

export function invalidateSecurityConfigCache(): void {
  cachedConfig = null
  cacheTimestamp = 0
}
