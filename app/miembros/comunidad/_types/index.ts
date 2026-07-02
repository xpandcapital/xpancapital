export type PostTipo = 'post' | 'encuesta' | 'evento' | 'producto' | 'blog' | 'anuncio'
export type PostOrigen = 'manual' | 'producto' | 'blog'
export type ReaccionTipo = 'like' | 'celebrar' | 'apoyar' | 'interesante' | 'triste'
export type EventoTipo = 'presencial' | 'digital' | 'hibrido'
export type InscripcionEstado = 'inscrito' | 'cancelado' | 'asistio'

export interface ComunidadAutor {
  id: string
  nombre: string
  apellido?: string
  avatar_url?: string
  rol?: string
}

export interface ComunidadPostMedia {
  id: string
  post_id: string
  tipo: 'imagen' | 'video' | 'audio' | 'archivo'
  url_original: string
  url_comprimida?: string
  url_thumbnail?: string
  mime_type: string
  nombre_archivo?: string
  tamaño_original: number
  tamaño_comprimido?: number
  duracion_segundos?: number
  orden: number
}

export interface ComunidadEncuestaOpcion {
  id: string
  texto: string
  orden: number
  votos_count?: number
  votada?: boolean
}

export interface ComunidadEncuesta {
  id: string
  post_id: string
  pregunta: string
  multiple: boolean
  fecha_cierre?: string
  opciones: ComunidadEncuestaOpcion[]
  total_votos?: number
  usuario_voto?: string[]
}

export interface ComunidadEvento {
  id: string
  post_id: string
  titulo: string
  descripcion?: string
  imagen_url?: string
  fecha_inicio: string
  fecha_fin?: string
  hora_inicio?: string
  hora_fin?: string
  ubicacion?: string
  ubicacion_url?: string
  es_digital: boolean
  url_evento?: string
  tipo: EventoTipo
  capacidad?: number
  inscritos_count?: number
  usuario_inscrito?: boolean
  usuario_estado?: InscripcionEstado
}

export interface ComunidadPostReaccion {
  id: string
  post_id: string
  usuario_id: string
  tipo: ReaccionTipo
}

export interface ComunidadComentario {
  id: string
  post_id: string
  usuario_id: string
  contenido: string
  padre_id?: string
  oculto: boolean
  created_at: string
  updated_at: string
  autor?: ComunidadAutor
  respuestas?: ComunidadComentario[]
}

export interface ComunidadPost {
  id: string
  empresa_id: string
  autor_id: string
  tipo: PostTipo
  contenido?: string
  origen: PostOrigen
  origen_id?: string
  fijado: boolean
  oculto: boolean
  es_evento_mentor?: boolean
  created_at: string
  updated_at: string
  autor?: ComunidadAutor
  media?: ComunidadPostMedia[]
  encuesta?: ComunidadEncuesta
  evento?: ComunidadEvento
  reacciones?: { tipo: ReaccionTipo; count: number }[]
  mi_reaccion?: ReaccionTipo | null
  comentarios_count?: number
  producto_ref?: { id: string; nombre: string; slug: string; imagen_principal?: string; precio_usd?: number }
  blog_ref?: { id: string; titulo: string; slug: string; imagen_portada?: string }
}

export interface ComunidadFeedResponse {
  success: boolean
  data: ComunidadPost[]
  count: number
  cursor?: string
}
