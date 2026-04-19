export interface Advisor {
  id: string
  name: string
  email: string
  phone: string
  phone_code: string
  document_id: string
  puesto?: string
  rol?: string
  fecha_nacimiento?: string
  lugar_residencia?: string
  estado_civil?: string
  nivel_estudios?: string
  aspiracion_salarial?: string
  disponibilidad_inmediata?: boolean
  disponibilidad_viaje?: boolean
  acceso_tecnologia?: string
  herramientas?: string[]
  commission_type: 'percentage' | 'fixed'
  commission_value: number
  commission_trigger_percent: number
  is_active: boolean
  created_at: string
  notes: string
  postulante_id?: string
  aceptado_en?: string
  auth_user_id?: string
  avatar_url?: string
  permisos_adicionales?: { extra?: string[]; denied?: string[] } | null
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
  cursos?: { nombre: string; precio_usd: number; imagen_principal: string | null; para_equipo?: boolean }
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

export interface Role {
  id: string
  nombre: string
  label: string
  descripcion?: string
  permisos: string[]
  color?: string
}