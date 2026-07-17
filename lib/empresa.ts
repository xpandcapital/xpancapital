export const DEFAULT_EMPRESA_ID = process.env.NEXT_PUBLIC_EMPRESA_ID || 'e8d21d17-e708-49c8-8975-e782b1223b1a'
export const DEFAULT_EMPRESA_SLUG = process.env.NEXT_PUBLIC_EMPRESA_SLUG || 'xpancapital'

export interface Empresa {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  logo_url?: string
  color_primario?: string
  color_secundario?: string
  moneda?: string
  created_at: string
}

export interface EmpresaConfig {
  id: string
  empresa_id: string
  coins_nombre: string
  coins_ratio_usd: number
  recompensa_lectura_segundos: number
  recompensa_lectura_coins: number
  blog_premium_por_defecto: boolean
  created_at: string
}

export function getDefaultEmpresaId(): string {
  return DEFAULT_EMPRESA_ID
}

export function getDefaultEmpresaSlug(): string {
  return DEFAULT_EMPRESA_SLUG
}
