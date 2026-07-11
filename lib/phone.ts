// ═══════════════════════════════════════════════════════════════════════════════
// XPAND CORP — UTILIDAD DE LIMPIEZA DE TELÉFONOS
// Normaliza a E.164 (+51999999999) removiendo prefijos locales (0 delante),
// espacios, guiones, paréntesis, y detecta código de país por defecto.
// ═══════════════════════════════════════════════════════════════════════════════

const COUNTRY_CODES: Record<string, { code: string; prefix: string }> = {
  PE: { code: '+51', prefix: '51' },
  EC: { code: '+593', prefix: '593' },
  CO: { code: '+57', prefix: '57' },
  MX: { code: '+52', prefix: '52' },
  CL: { code: '+56', prefix: '56' },
  AR: { code: '+54', prefix: '54' },
  US: { code: '+1', prefix: '1' },
  ES: { code: '+34', prefix: '34' },
  BR: { code: '+55', prefix: '55' },
  BO: { code: '+591', prefix: '591' },
}

/**
 * Limpia un número de teléfono crudo y lo normaliza a E.164.
 * Maneja casos como "0939011068" (Ecuador) → "+593939011068"
 * y "+51 999 999 999" → "+51999999999"
 */
export function cleanPhone(raw: string | null | undefined, defaultCountry: string = 'PE'): string | null {
  if (!raw) return null

  // PRIMERO: quitar todo lo que no sea dígito
  const digits = raw.trim().replace(/\D/g, '')
  if (digits.length < 7) return null

  // Detectar si empieza con código de país conocido
  for (const country of Object.values(COUNTRY_CODES)) {
    if (digits.startsWith(country.prefix)) {
      return `+${digits}`
    }
  }

  // Sin código de país: agregar el del país por defecto
  const country = COUNTRY_CODES[defaultCountry]
  if (!country) return `+${digits}`

  // Quitar 0 delante si existe (ej: 0939011068 → 939011068)
  let local = digits
  if (local.startsWith('0')) {
    local = local.slice(1)
  }

  return `+${country.prefix}${local}`
}

/**
 * Formatea para mostrar: +51 999 999 999
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  const cleaned = cleanPhone(phone)
  if (!cleaned) return phone || ''
  // +51999999999 → +51 999 999 999
  const match = cleaned.match(/^\+(\d{1,3})(\d{3})(\d{3})(\d{3,4})$/)
  if (match) return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  return cleaned
}

/**
 * Extrae solo los dígitos sin código de país (para mostrar localmente)
 */
export function phoneLocalDigits(phone: string | null | undefined, defaultCountry: string = 'PE'): string | null {
  const cleaned = cleanPhone(phone, defaultCountry)
  if (!cleaned) return null
  const country = COUNTRY_CODES[defaultCountry]
  if (country && cleaned.startsWith(country.code)) {
    return cleaned.slice(country.code.length)
  }
  return cleaned.replace(/^\+/, '')
}

/**
 * Valida que un número tenga formato E.164 válido
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  return /^\+[1-9]\d{6,15}$/.test(phone)
}

