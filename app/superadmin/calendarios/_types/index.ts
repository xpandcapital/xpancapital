export interface Calendario {
  id: string
  empresa_id: string
  campana_id?: string
  nombre: string
  slug: string
  tipo: 'personal' | 'rotacion' | 'clases' | 'colectiva' | 'eventos' | 'servicio'
  descripcion?: string
  ubicacion_tipo: 'presencial' | 'videoconferencia' | 'telefonica'
  ubicacion_detalle?: string
  logo?: string
  color_principal: string
  texto_boton: string
  audiencia_tipo: 'publico' | 'leads_campana' | 'postulantes' | 'equipo' | 'especifico'
  audiencia_ids: string[]
  tipo_horario: 'semanal' | 'especifico'
  horarios: WeekSchedule
  fechas_especificas: SpecificDate[]
  configuracion: Record<string, any>
  duracion: number
  intervalo: number
  aviso_minimo: number
  buffer_antes: number
  buffer_despues: number
  formulario: FormFieldCal[]
  permitir_invitados: boolean
  requerir_consentimiento: boolean
  usuarios_asignados: string[]
  creado_en: string
  actualizado_en: string
}

export interface WeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  active: boolean
  start: string
  end: string
}

export interface SpecificDate {
  date: string
  start: string
  end: string
}

export interface FormFieldCal {
  id: string
  label: string
  type: string
  required: boolean
  system?: boolean
}

import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export const defaultSchedule: WeekSchedule = {
  monday: { active: true, start: '09:00', end: '17:00' },
  tuesday: { active: true, start: '09:00', end: '17:00' },
  wednesday: { active: true, start: '09:00', end: '17:00' },
  thursday: { active: true, start: '09:00', end: '17:00' },
  friday: { active: true, start: '09:00', end: '17:00' },
  saturday: { active: false, start: '10:00', end: '14:00' },
  sunday: { active: false, start: '10:00', end: '14:00' },
}

export const defaultFormFields: FormFieldCal[] = [
  { id: 'f_name', label: 'Nombre', type: 'text', required: true, system: true },
  { id: 'f_email', label: 'Correo electrónico', type: 'email', required: true, system: true },
]

export const calendarTypeLabels: Record<string, string> = {
  personal: 'Reserva personal',
  rotacion: 'Rotación',
  clases: 'Reserva de clases',
  colectiva: 'Reserva colectiva',
  eventos: 'Calendario de eventos',
  servicio: 'Reserva de servicio',
}

export const defaultCalendar: Omit<Calendario, 'id' | 'creado_en' | 'actualizado_en'> = {
  empresa_id: DEFAULT_EMPRESA_ID,
  nombre: 'Nuevo Calendario',
  slug: `calendario-${Date.now().toString().slice(-4)}`,
  tipo: 'personal',
  descripcion: '',
  ubicacion_tipo: 'videoconferencia',
  ubicacion_detalle: '',
  logo: '',
  color_principal: '#be0b3c',
  texto_boton: 'Programar',
  audiencia_tipo: 'publico',
  audiencia_ids: [],
  tipo_horario: 'semanal',
  horarios: defaultSchedule,
  fechas_especificas: [],
  configuracion: {},
  duracion: 30,
  intervalo: 30,
  aviso_minimo: 4,
  buffer_antes: 0,
  buffer_despues: 0,
  formulario: defaultFormFields,
  permitir_invitados: false,
  requerir_consentimiento: true,
  usuarios_asignados: [],
  campana_id: undefined,
}