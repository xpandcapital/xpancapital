export interface Formulario {
  id: string
  empresa_id: string
  campana_id?: string
  nombre: string
  slug: string
  estado: 'borrador' | 'publicado' | 'pausado'
  campos: FormField[]
  apariencia: FormAppearance
  pasos_flujo: FlowStep[]
  texto_boton: string
  destino_lead_tipo: 'lead' | 'postulante' | 'empleado'
  vistas: number
  respuestas: number
  creado_en: string
  actualizado_en: string
}

export interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface FormAppearance {
  primaryColor: string
  buttonTextColor: string
  backgroundColor: string
  backgroundOpacity: number
  textColor: string
  inputBgColor: string
  inputBorderColor: string
  inputTextColor: string
  placeholderColor: string
  focusColor: string
  borderRadius: string
  paddingTop: string
  paddingBottom: string
  paddingLeft: string
  paddingRight: string
  showButton: boolean
}

export interface FlowStep {
  id: string
  type: 'webhook' | 'email' | 'redirect'
  title: string
  url: string
}

import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export const defaultAppearance: FormAppearance = {
  primaryColor: '#be0b3c',
  buttonTextColor: '#ffffff',
  backgroundColor: '#ffffff',
  backgroundOpacity: 100,
  textColor: '#111111',
  inputBgColor: '#f9fafb',
  inputBorderColor: '#e5e7eb',
  inputTextColor: '#111111',
  placeholderColor: '#9ca3af',
  focusColor: '#be0b3c',
  borderRadius: '12',
  paddingTop: '24',
  paddingBottom: '24',
  paddingLeft: '24',
  paddingRight: '24',
  showButton: true,
}

export const defaultFormulario: Omit<Formulario, 'id' | 'creado_en' | 'actualizado_en'> = {
  empresa_id: DEFAULT_EMPRESA_ID,
  nombre: 'Nuevo Formulario',
  slug: `form-${Date.now().toString().slice(-4)}`,
  estado: 'borrador',
  campos: [
    { id: 'f_name', type: 'text', label: 'Nombre Completo', placeholder: 'Tu nombre...', required: true },
  ],
  apariencia: defaultAppearance,
  pasos_flujo: [],
  texto_boton: 'Enviar',
  destino_lead_tipo: 'lead',
  vistas: 0,
  respuestas: 0,
}