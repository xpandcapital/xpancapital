import type { GamificacionNivel, GamificacionConfig, GamificacionLogro, RankingEntry } from '@/lib/types/database'

export type { GamificacionNivel, GamificacionConfig, GamificacionLogro, RankingEntry }

export type TabGamificacion = 'config' | 'niveles' | 'ranking' | 'logros' | 'certificados'

export interface NivelFormData {
  nombre: string
  color: string
  icono_svg?: string
  imagen_url?: string
  puntos_requeridos: number
  orden?: number
}

export interface LogroFormData {
  nombre: string
  descripcion?: string
  icono_svg?: string
  imagen_url?: string
  tipo: 'cursos' | 'comunidad' | 'blog' | 'certificados' | 'racha' | 'social' | 'especial'
  condicion: Record<string, any>
  puntos_bonus: number
}
