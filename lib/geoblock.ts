/**
 * Sistema de Geobloqueo para BLIS Corp
 *
 * Usa el header `x-vercel-ip-country` inyectado por Vercel Edge Network.
 * En desarrollo local, usar GEOBLOCK_SIMULATE_COUNTRY=XX en .env.local para pruebas.
 *
 * Política:
 * 1. Si GEOBLOCK_ENABLED=false → permitir todo
 * 2. Lee configuración de BD (site_config.security_config.geobloqueo) con caché 30s
 * 3. Si config BD habilitada → usar listas de BD
 * 4. Si no hay config BD → fallback a listas hardcodeadas
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

// ============================================================================
// Variables de entorno
// ============================================================================
const GEOBLOCK_ENABLED =
  process.env.GEOBLOCK_ENABLED !== 'false' &&
  process.env.GEOBLOCK_ENABLED !== '0'

const IS_DEV = process.env.NODE_ENV === 'development'

function log(msg: string, ...args: unknown[]) {
  if (IS_DEV) console.log(`[GeoBlock] ${msg}`, ...args)
}

// ============================================================================
// Caché en memoria para configuración de BD (TTL 5s)
// ============================================================================
let cachedDBConfig: GeobloqueoDBConfig | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30 * 1000

// ============================================================================
// Tipos
// ============================================================================
export interface GeoBlockResult {
  blocked: boolean
  country: string | null
  reason: 'blocklist' | 'not_allowed' | 'db_config' | null
}

interface GeobloqueoDBConfig {
  habilitado: boolean
  modo: 'bloquear_lista' | 'permitir_lista'
  paises_bloqueados: string[]
  paises_permitidos: string[]
  mensaje_bloqueo: string
}

// ============================================================================
// Países BLOQUEADOS por defecto (alto riesgo cibernético / spam)
// ============================================================================
const HARD_BLOCKED_COUNTRIES = new Set([
  "CN", "RU", "KP", "IR", "SY", "SD", "LY", "IQ", "AF",
  "SO", "YE", "MM", "BY", "PK", "BD", "NG", "CU", "VN",
  "LA", "KH", "NP", "LK", "UZ", "TM", "KG", "TJ", "AZ",
  "AM", "GE", "MD", "MN",
])

// ============================================================================
// Países PERMITIDOS por defecto (hispanohablantes, latinos y aliados)
// ============================================================================
const HARD_ALLOWED_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "DO", "EC", "SV", "GQ",
  "GT", "HN", "MX", "NI", "PA", "PY", "PE", "PR", "ES",
  "UY", "VE", "BR", "HT", "BZ", "US", "CA", "GB", "FR",
  "DE", "IT", "CH", "NL", "BE", "AT", "IE", "PT", "SE",
  "NO", "DK", "FI", "IS", "PL", "CZ", "SK", "HU", "RO",
  "BG", "HR", "SI", "EE", "LV", "LT", "GR", "CY", "MT",
  "LU", "AD", "MC", "LI", "SM", "VA", "JP", "KR", "TW",
  "SG", "AU", "NZ", "PH", "IL", "AE", "SA", "QA", "KW",
  "BH", "OM", "JO", "TR", "EG", "MA", "TN", "DZ", "ZA",
  "KE", "GH", "HK", "MO", "TH", "MY", "ID", "IN", "UA",
  "AL", "MK", "ME", "RS", "BA", "XK", "JM", "TT", "BB",
  "BS", "BM", "KY", "AW", "CW", "SX", "AG", "DM", "GD",
  "LC", "VC", "KN", "AI", "MS", "TC", "VG", "VI", "SR",
  "GY", "GF", "GP", "MQ", "RE", "YT", "BL", "MF", "PM",
  "WF", "PF", "NC", "FJ", "PG", "CK", "NU", "WS", "TO",
  "VU", "SB", "KI", "NR", "MH", "FM", "PW", "TL", "BN",
  "MV", "BT", "GL", "FO", "GI", "GG", "JE", "IM", "FK",
  "SH", "BQ", "BW", "NA", "MG", "SC", "MU", "KM",
])

// ============================================================================
// Códigos de país que indican "desconocido" o "no detectado"
// ============================================================================
const UNKNOWN_COUNTRY_CODES = new Set(["XX", "T1", "A1", "A2", "O1", ""])

// ============================================================================
// Obtener configuración de BD con caché
// ============================================================================
async function getDBGeobloqueoConfig(): Promise<GeobloqueoDBConfig | null> {
  const now = Date.now()
  if (cachedDBConfig && (now - cacheTimestamp) < CACHE_TTL) {
    log('Usando config en caché (TTL restante:', Math.round((CACHE_TTL - (now - cacheTimestamp)) / 1000) + 's)')
    return cachedDBConfig
  }

  log('Consultando BD para geobloqueo...')
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      log('ERROR: Faltan variables de entorno Supabase')
      return null
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('site_config')
      .select('security_config')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error) {
      log('Error consultando site_config:', error.message, '(código:', error.code + ')')
      return null
    }

    const geo = data?.security_config?.geobloqueo
    if (!geo || typeof geo !== 'object') {
      log('No hay config de geobloqueo en BD - usando fallback hardcodeado')
      return null
    }

    cachedDBConfig = {
      habilitado: geo.habilitado === true,
      modo: geo.modo === 'permitir_lista' ? 'permitir_lista' : 'bloquear_lista',
      paises_bloqueados: Array.isArray(geo.paises_bloqueados) ? geo.paises_bloqueados : [],
      paises_permitidos: Array.isArray(geo.paises_permitidos) ? geo.paises_permitidos : [],
      mensaje_bloqueo: typeof geo.mensaje_bloqueo === 'string' ? geo.mensaje_bloqueo : 'Acceso denegado',
    }
    cacheTimestamp = now
    log('Config BD cargada:', JSON.stringify({
      habilitado: cachedDBConfig.habilitado,
      modo: cachedDBConfig.modo,
      bloqueados: cachedDBConfig.paises_bloqueados.length,
      permitidos: cachedDBConfig.paises_permitidos.length,
    }))
    return cachedDBConfig
  } catch (err) {
    log('Error inesperado consultando BD:', err instanceof Error ? err.message : err)
    return null
  }
}

// ============================================================================
// Verificar con configuración de BD
// ============================================================================
function checkWithDBConfig(
  countryCode: string,
  config: GeobloqueoDBConfig
): GeoBlockResult {
  const code = countryCode.toUpperCase()

  if (config.modo === 'bloquear_lista') {
    const blocked = config.paises_bloqueados.includes(code)
    log(`Modo bloquear_lista | país ${code} → ${blocked ? 'BLOQUEADO' : 'permitido'}`)
    if (blocked) {
      return { blocked: true, country: code, reason: 'db_config' }
    }
    return { blocked: false, country: code, reason: null }
  }

  // Modo permitir_lista
  const allowed = config.paises_permitidos.includes(code)
  log(`Modo permitir_lista | país ${code} → ${allowed ? 'permitido' : 'BLOQUEADO'}`)
  if (!allowed) {
    return { blocked: true, country: code, reason: 'db_config' }
  }
  return { blocked: false, country: code, reason: null }
}

// ============================================================================
// Verificar con listas hardcodeadas (fallback)
// ============================================================================
function checkHardcoded(countryCode: string): GeoBlockResult {
  const code = countryCode.toUpperCase()

  if (HARD_BLOCKED_COUNTRIES.has(code)) {
    log(`Hardcoded | país ${code} → BLOQUEADO (en lista negra)`)
    return { blocked: true, country: code, reason: 'blocklist' }
  }

  if (!HARD_ALLOWED_COUNTRIES.has(code)) {
    log(`Hardcoded | país ${code} → BLOQUEADO (no en lista blanca)`)
    return { blocked: true, country: code, reason: 'not_allowed' }
  }

  log(`Hardcoded | país ${code} → permitido`)
  return { blocked: false, country: code, reason: null }
}

// ============================================================================
// API pública
// ============================================================================

export function getCountryFromRequest(request: {
  headers: { get: (name: string) => string | null }
}): string | null {
  // Permitir simular país en desarrollo vía variable de entorno
  const simulacro = process.env.GEOBLOCK_SIMULATE_COUNTRY
  if (simulacro) {
    log('SIMULANDO país:', simulacro)
    return simulacro.toUpperCase()
  }
  return request.headers.get('x-vercel-ip-country')
}

export async function shouldGeoBlock(request: {
  headers: { get: (name: string) => string | null }
}): Promise<GeoBlockResult> {
  if (!GEOBLOCK_ENABLED) {
    log('Geobloqueo DESHABILITADO por variable de entorno')
    return { blocked: false, country: null, reason: null }
  }

  const country = getCountryFromRequest(request)
  if (!country || UNKNOWN_COUNTRY_CODES.has(country)) {
    log(`País no detectado (${country || 'null'}) → permitiendo`)
    return { blocked: false, country: country, reason: null }
  }

  log(`Verificando país: ${country}`)

  // 1. Intentar configuración de BD (con caché)
  const dbConfig = await getDBGeobloqueoConfig()
  if (dbConfig && dbConfig.habilitado) {
    return checkWithDBConfig(country, dbConfig)
  }

  if (dbConfig) {
    log('Config BD existe pero geobloqueo está deshabilitado en BD → usando hardcoded')
  }

  // 2. Fallback a listas hardcodeadas
  return checkHardcoded(country)
}

/**
 * Invalidar caché manualmente (útil tras guardar cambios desde el panel)
 */
export function invalidateGeoBlockCache(): void {
  log('Caché invalidada manualmente')
  cachedDBConfig = null
  cacheTimestamp = 0
}
