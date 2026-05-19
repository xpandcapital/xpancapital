/**
 * Inyecta cabeceras de seguridad HTTP desde site_config.security_config.security_headers
 *
 * Mapeo de keys internas a nombres de header HTTP reales:
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const HEADER_NAME_MAP: Record<string, string> = {
  'content-security-policy': 'Content-Security-Policy',
  'strict-transport-security': 'Strict-Transport-Security',
  'x-frame-options': 'X-Frame-Options',
  'x-content-type-options': 'X-Content-Type-Options',
  'referrer-policy': 'Referrer-Policy',
  'permissions-policy': 'Permissions-Policy',
}

export interface SecurityHeaders {
  habilitado: boolean
  headers: Record<string, { habilitado: boolean; valor: string }>
}

let cachedHeaders: SecurityHeaders | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30 * 1000

export async function getSecurityHeaders(): Promise<SecurityHeaders | null> {
  const now = Date.now()
  if (cachedHeaders && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedHeaders
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

    const secHeaders = data?.security_config?.security_headers
    if (secHeaders && typeof secHeaders === 'object' && secHeaders.habilitado) {
      cachedHeaders = secHeaders as SecurityHeaders
      cacheTimestamp = now
      return cachedHeaders
    }

    return null
  } catch {
    return null
  }
}

export function injectHeaders(
  response: { headers: Headers },
  config: SecurityHeaders
): void {
  if (!config.habilitado) return

  for (const [key, header] of Object.entries(config.headers)) {
    if (header.habilitado && header.valor) {
      const headerName = HEADER_NAME_MAP[key]
      if (headerName) {
        response.headers.set(headerName, header.valor)
      }
    }
  }
}

export function invalidateSecurityHeadersCache(): void {
  cachedHeaders = null
  cacheTimestamp = 0
}
