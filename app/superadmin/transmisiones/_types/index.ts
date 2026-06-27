export interface Transmision {
  id: string
  empresa_id: string
  tipo: 'publica' | 'clase'
  titulo: string
  subtitulo?: string | null
  link: string
  texto_boton: string
  activo: boolean
  duracion_minutos: number
  inicio?: string | null
  fin?: string | null
  color: 'verde' | 'azul'
  paginas: string[]
  productos_ids: string[]
  creado_por?: string | null
  creado_en: string
  actualizado_en: string
}

export interface TransmisionFormData {
  titulo: string
  subtitulo: string
  link: string
  texto_boton: string
  duracion_minutos: number
  paginas: string[]
  tipo: 'publica' | 'clase'
  color: 'verde' | 'azul'
  productos_ids: string[]
}

export const PAGINAS_OPCIONES = [
  { value: 'landing', label: 'Landing' },
  { value: 'tienda', label: 'Tienda' },
  { value: 'blog', label: 'Blog' },
  { value: 'miembros', label: 'Miembros' },
] as const
