export const DEFAULT_EMPRESA_ID = process.env.NEXT_PUBLIC_EMPRESA_ID || '6186f014-c8c7-4027-9f08-8acf2bae3eae'
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
