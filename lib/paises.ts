// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP — LISTA CENTRALIZADA DE PAÍSES CON BANDERAS EMOJI
// Fuente unificada para todos los dropdowns de país y código telefónico
// ═══════════════════════════════════════════════════════════════════════════════

export interface Pais {
  code: string     // ISO 3166-1 alpha-2 (ej: "PE", "MX")
  nombre: string
  flag: string     // Emoji flag (ej: "🇵🇪")
}

export interface PaisTelefono {
  code: string     // Código telefónico (ej: "+51", "+52")
  flag: string     // Emoji flag
  pais: string     // Nombre del país
  iso: string      // Código ISO (ej: "PE")
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAÍSES — Para dropdowns de país fiscal, dirección, etc.
// ═══════════════════════════════════════════════════════════════════════════════

export const PAISES: Pais[] = [
  { code: 'AR', nombre: 'Argentina', flag: '🇦🇷' },
  { code: 'BO', nombre: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', nombre: 'Brasil', flag: '🇧🇷' },
  { code: 'CA', nombre: 'Canadá', flag: '🇨🇦' },
  { code: 'CL', nombre: 'Chile', flag: '🇨🇱' },
  { code: 'CO', nombre: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', nombre: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CU', nombre: 'Cuba', flag: '🇨🇺' },
  { code: 'DO', nombre: 'República Dominicana', flag: '🇩🇴' },
  { code: 'EC', nombre: 'Ecuador', flag: '🇪🇨' },
  { code: 'SV', nombre: 'El Salvador', flag: '🇸🇻' },
  { code: 'GT', nombre: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', nombre: 'Honduras', flag: '🇭🇳' },
  { code: 'MX', nombre: 'México', flag: '🇲🇽' },
  { code: 'NI', nombre: 'Nicaragua', flag: '🇳🇮' },
  { code: 'PA', nombre: 'Panamá', flag: '🇵🇦' },
  { code: 'PY', nombre: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', nombre: 'Perú', flag: '🇵🇪' },
  { code: 'PR', nombre: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'UY', nombre: 'Uruguay', flag: '🇺🇾' },
  { code: 'US', nombre: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'VE', nombre: 'Venezuela', flag: '🇻🇪' },
  { code: 'ES', nombre: 'España', flag: '🇪🇸' },
  { code: 'PT', nombre: 'Portugal', flag: '🇵🇹' },
  { code: 'FR', nombre: 'Francia', flag: '🇫🇷' },
  { code: 'DE', nombre: 'Alemania', flag: '🇩🇪' },
  { code: 'IT', nombre: 'Italia', flag: '🇮🇹' },
  { code: 'GB', nombre: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', nombre: 'Países Bajos', flag: '🇳🇱' },
  { code: 'BE', nombre: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', nombre: 'Suiza', flag: '🇨🇭' },
  { code: 'SE', nombre: 'Suecia', flag: '🇸🇪' },
  { code: 'NO', nombre: 'Noruega', flag: '🇳🇴' },
  { code: 'DK', nombre: 'Dinamarca', flag: '🇩🇰' },
  { code: 'FI', nombre: 'Finlandia', flag: '🇫🇮' },
  { code: 'AT', nombre: 'Austria', flag: '🇦🇹' },
  { code: 'IE', nombre: 'Irlanda', flag: '🇮🇪' },
  { code: 'PL', nombre: 'Polonia', flag: '🇵🇱' },
  { code: 'AU', nombre: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', nombre: 'Nueva Zelanda', flag: '🇳🇿' },
  { code: 'JP', nombre: 'Japón', flag: '🇯🇵' },
  { code: 'KR', nombre: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'CN', nombre: 'China', flag: '🇨🇳' },
  { code: 'IN', nombre: 'India', flag: '🇮🇳' },
  { code: 'SG', nombre: 'Singapur', flag: '🇸🇬' },
  { code: 'AE', nombre: 'Emiratos Árabes', flag: '🇦🇪' },
]

export function getPaisByCode(code: string): Pais | undefined {
  return PAISES.find((p) => p.code === code)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAÍSES CON CÓDIGO TELEFÓNICO — Para dropdowns de teléfono
// ═══════════════════════════════════════════════════════════════════════════════

export const PAISES_TELEFONO: PaisTelefono[] = [
  { code: '+54', flag: '🇦🇷', pais: 'Argentina', iso: 'AR' },
  { code: '+591', flag: '🇧🇴', pais: 'Bolivia', iso: 'BO' },
  { code: '+55', flag: '🇧🇷', pais: 'Brasil', iso: 'BR' },
  { code: '+1', flag: '🇨🇦', pais: 'Canadá', iso: 'CA' },
  { code: '+56', flag: '🇨🇱', pais: 'Chile', iso: 'CL' },
  { code: '+57', flag: '🇨🇴', pais: 'Colombia', iso: 'CO' },
  { code: '+506', flag: '🇨🇷', pais: 'Costa Rica', iso: 'CR' },
  { code: '+53', flag: '🇨🇺', pais: 'Cuba', iso: 'CU' },
  { code: '+1', flag: '🇩🇴', pais: 'República Dominicana', iso: 'DO' },
  { code: '+593', flag: '🇪🇨', pais: 'Ecuador', iso: 'EC' },
  { code: '+503', flag: '🇸🇻', pais: 'El Salvador', iso: 'SV' },
  { code: '+502', flag: '🇬🇹', pais: 'Guatemala', iso: 'GT' },
  { code: '+504', flag: '🇭🇳', pais: 'Honduras', iso: 'HN' },
  { code: '+52', flag: '🇲🇽', pais: 'México', iso: 'MX' },
  { code: '+505', flag: '🇳🇮', pais: 'Nicaragua', iso: 'NI' },
  { code: '+507', flag: '🇵🇦', pais: 'Panamá', iso: 'PA' },
  { code: '+595', flag: '🇵🇾', pais: 'Paraguay', iso: 'PY' },
  { code: '+51', flag: '🇵🇪', pais: 'Perú', iso: 'PE' },
  { code: '+1', flag: '🇵🇷', pais: 'Puerto Rico', iso: 'PR' },
  { code: '+598', flag: '🇺🇾', pais: 'Uruguay', iso: 'UY' },
  { code: '+1', flag: '🇺🇸', pais: 'Estados Unidos', iso: 'US' },
  { code: '+58', flag: '🇻🇪', pais: 'Venezuela', iso: 'VE' },
  { code: '+34', flag: '🇪🇸', pais: 'España', iso: 'ES' },
  { code: '+351', flag: '🇵🇹', pais: 'Portugal', iso: 'PT' },
  { code: '+33', flag: '🇫🇷', pais: 'Francia', iso: 'FR' },
  { code: '+49', flag: '🇩🇪', pais: 'Alemania', iso: 'DE' },
  { code: '+39', flag: '🇮🇹', pais: 'Italia', iso: 'IT' },
  { code: '+44', flag: '🇬🇧', pais: 'Reino Unido', iso: 'GB' },
  { code: '+31', flag: '🇳🇱', pais: 'Países Bajos', iso: 'NL' },
  { code: '+61', flag: '🇦🇺', pais: 'Australia', iso: 'AU' },
  { code: '+64', flag: '🇳🇿', pais: 'Nueva Zelanda', iso: 'NZ' },
  { code: '+81', flag: '🇯🇵', pais: 'Japón', iso: 'JP' },
  { code: '+82', flag: '🇰🇷', pais: 'Corea del Sur', iso: 'KR' },
  { code: '+86', flag: '🇨🇳', pais: 'China', iso: 'CN' },
  { code: '+91', flag: '🇮🇳', pais: 'India', iso: 'IN' },
  { code: '+65', flag: '🇸🇬', pais: 'Singapur', iso: 'SG' },
  { code: '+971', flag: '🇦🇪', pais: 'Emiratos Árabes', iso: 'AE' },
]

export function getPaisTelefonoByCode(code: string): PaisTelefono | undefined {
  return PAISES_TELEFONO.find((p) => p.code === code)
}
