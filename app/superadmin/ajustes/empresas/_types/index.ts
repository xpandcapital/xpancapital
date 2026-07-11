export interface Empresa {
  id: string
  slug: string
  nombre: string
  nombre_legal: string | null
  logo_url: string | null
  color_primario: string
  color_secundario: string
  color_acento: string
  moneda_base: string
  idioma: string
  zona_horaria: string
  pais_fiscal: string
  ruc: string | null
  razon_social: string | null
  direccion_fiscal: string | null
  dominio_principal: string | null
  activo: boolean
  plan: string
  plan_limite_usuarios: number
  plan_limite_productos: number
  plan_limite_almacenamiento: number
  creado_en: string
  user_count?: number
}

export interface EmpresaUser {
  id: string
  email: string
  nombre: string
  apellido: string | null
  rol: string
  avatar_url: string | null
  empresa_id?: string
  creado_en: string
}

export interface EmpresaConfig {
  blog_activo: boolean
  tienda_activa: boolean
  academia_activa: boolean
  referidos_activo: boolean
  bliscoins_activo: boolean
  envios_activo: boolean
  envios_gratis_monto: number | null
  coins_por_lectura: number
  segundos_lectura: number
  coins_registro: number
  coins_referido: number
}

export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  cliente: 'Cliente',
  usuario: 'Usuario',
}

export const ROLE_COLORS: Record<string, string> = {
  superadmin: '#d5c108',
  admin: '#f59e0b',
  editor: '#8b5cf6',
  cliente: '#3b82f6',
  usuario: '#6b7280',
}

export const PLANES = [
  { id: 'free', nombre: 'Free', usuarios: 5, productos: 50 },
  { id: 'starter', nombre: 'Starter', usuarios: 20, productos: 200 },
  { id: 'pro', nombre: 'Pro', usuarios: 100, productos: 1000 },
  { id: 'enterprise', nombre: 'Enterprise', usuarios: 500, productos: 5000 },
]

import { PAISES as PAISES_FLAGS } from '@/lib/paises'
export { PAISES_FLAGS as PAISES }

export const MONEDAS = [
  { code: 'USD', nombre: 'USD - Dólar americano' },
  { code: 'PEN', nombre: 'PEN - Sol peruano' },
  { code: 'COP', nombre: 'COP - Peso colombiano' },
  { code: 'MXN', nombre: 'MXN - Peso mexicano' },
  { code: 'ARS', nombre: 'ARS - Peso argentino' },
  { code: 'CLP', nombre: 'CLP - Peso chileno' },
  { code: 'EUR', nombre: 'EUR - Euro' },
]

export const ZONAS_HORARIAS = [
  'America/Lima',
  'America/Bogota',
  'America/Guayaquil',
  'America/Mexico_City',
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'Europe/Madrid',
  'America/New_York',
]

export type ConfigTab = 'identidad' | 'apariencia' | 'regional' | 'fiscal' | 'plan' | 'features'

export const CONFIG_TABS: { id: ConfigTab; label: string }[] = [
  { id: 'identidad', label: 'Identidad' },
  { id: 'apariencia', label: 'Apariencia' },
  { id: 'regional', label: 'Regional' },
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'plan', label: 'Plan' },
  { id: 'features', label: 'Features' },
]
