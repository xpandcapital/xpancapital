export interface Question {
  id: string
  text: string
  options: { id: string; text: string; isCorrect: boolean }[]
}

export interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz'
  content: string
  videoUrl?: string
  attachments: string[]
  questions?: Question[]
  isQuizEnabled?: boolean
}

export interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
  questions?: Question[]
  isQuizEnabled?: boolean
  isOpen?: boolean
}

export interface Course {
  id: string
  title: string
  category: string
  descripcion: string
  price: number
  status: 'Borrador' | 'Publicado'
  modules: Module[]
  lastSaved?: string
  hasCertificate: boolean
  allowComments: boolean
  xpandCoins: number
  image: string | null
  certificateTemplateId: string | null
  paraEquipo: boolean
  sequentialProgress: boolean
  requireCompletion: boolean
  venderEnTienda: boolean
  productoId: string | null
  productoNombre?: string | null
  linkProductoId?: string | null
  precioComparacion: number
  descuentoPorcentaje: number
  puntosCompletado: number
  puntosPorLeccion: number
  puntosCertificado: number
}

export interface CertificateTemplate {
  id: string
  nombre: string
}

export type EditingItem = { type: 'module' | 'lesson'; id: string; moduleId?: string } | null

export type ConfirmDelete = { type: 'module' | 'lesson'; id: string; moduleId?: string; title: string } | null
