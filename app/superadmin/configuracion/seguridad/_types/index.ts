export interface GeobloqueoConfig {
  habilitado: boolean
  modo: 'bloquear_lista' | 'permitir_lista'
  paises_bloqueados: string[]
  paises_permitidos: string[]
  mensaje_bloqueo: string
}

export interface SecurityHeaderDef {
  habilitado: boolean
  valor: string
}

export interface SecurityHeadersConfig {
  habilitado: boolean
  headers: Record<string, SecurityHeaderDef>
}

export interface SecurityConfig {
  geobloqueo?: GeobloqueoConfig
  security_headers?: SecurityHeadersConfig
  // Future tools:
  // rate_limiting?: RateLimitingConfig
  // firewall?: FirewallConfig
  // access_logs?: AccessLogsConfig
}

export interface SecurityToolDef {
  id: string
  name: string
  description: string
  cat: string
  icon: string
  status: 'active' | 'available' | 'coming_soon'
  configKey?: string
}

export const defaultGeobloqueoConfig: GeobloqueoConfig = {
  habilitado: true,
  modo: 'bloquear_lista',
  paises_bloqueados: [
    "CN", "RU", "KP", "IR", "SY", "SD", "LY", "IQ", "AF",
    "SO", "YE", "MM", "BY", "PK", "BD", "NG", "CU", "VN",
    "LA", "KH", "NP", "LK", "UZ", "TM", "KG", "TJ", "AZ",
    "AM", "GE", "MD", "MN"
  ],
  paises_permitidos: [
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
    "SH", "BQ", "BW", "NA", "MG", "SC", "MU", "KM"
  ],
  mensaje_bloqueo: "Lo sentimos, este contenido no está disponible en tu región."
}

export const defaultSecurityHeadersConfig: SecurityHeadersConfig = {
  habilitado: true,
  headers: {
    'content-security-policy': {
      habilitado: true,
      valor: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    },
    'strict-transport-security': {
      habilitado: true,
      valor: 'max-age=63072000; includeSubDomains; preload'
    },
    'x-frame-options': {
      habilitado: true,
      valor: 'DENY'
    },
    'x-content-type-options': {
      habilitado: true,
      valor: 'nosniff'
    },
    'referrer-policy': {
      habilitado: true,
      valor: 'strict-origin-when-cross-origin'
    },
    'permissions-policy': {
      habilitado: false,
      valor: 'camera=(), microphone=(), geolocation=()'
    }
  }
}

export const defaultSecurityConfig: SecurityConfig = {
  geobloqueo: defaultGeobloqueoConfig,
  security_headers: defaultSecurityHeadersConfig,
}
