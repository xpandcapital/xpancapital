export interface Advisor {
  id: string
  name: string
  email: string
  phone: string
  phone_code: string
  document_id: string
  commission_type: 'percentage' | 'fixed'
  commission_value: number
  commission_trigger_percent: number
  is_active: boolean
  created_at: string
  notes: string
  postulante_id?: string
  aceptado_en?: string
}

export interface EquipoCurso {
  id: string
  advisor_id: string
  curso_id: string
  progreso: number
  estado: 'asignado' | 'en_progreso' | 'completado' | 'bloqueado'
  nota_final: number | null
  asignado_en: string
  completado_en: string | null
  cursos?: { nombre: string; precio_usd: number; imagen_principal: string | null }
}

export interface EquipoProducto {
  id: string
  advisor_id: string
  producto_id: string
  estado: 'asignado' | 'activo' | 'completado' | 'cancelado'
  asignado_en: string
  completado_en: string | null
  productos?: { nombre: string; precio_usd: number; imagen_principal: string | null }
}