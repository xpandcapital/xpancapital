// ═══════════════════════════════════════════════════════════════
// POSTULANTES - TIPOS DEL SISTEMA DE FORMULARIOS DINÁMICOS
// ═══════════════════════════════════════════════════════════════

import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export interface Postulante {
  id: string
  empresa_id: string
  estado: 'nuevo' | 'en_revision' | 'entrevista' | 'aceptado' | 'rechazado'
  calificacion?: string
  fecha_entrevista?: string
  proyecto_interesado?: string
  puesto_postula?: string
  puesto_trabajo_id?: string
  entrevista_tipo?: 'presencial' | 'videoconferencia' | 'telefonica'
  entrevista_notas?: string
  nombre_completo: string
  apodo_preferido?: string
  celular_contacto?: string
  correo_contacto: string
  fecha_nacimiento?: string
  estado_civil?: string
  lugar_residencia?: string
  tiempo_residencia?: string
  personas_cargo?: string
  apoyo_familiar?: string
  licencia_vehiculo?: string
  transporte_trabajo?: string
  acceso_tecnologia?: string
  disponibilidad_inmediata?: string
  disponibilidad_viaje?: string
  disponibilidad_horarios?: string
  compromisos_horarios?: string
  horario_preferido?: string
  condicion_medica?: string
  nivel_estudios?: string
  capacitaciones_recientes?: string
  herramientas_dominadas?: string
  cv_archivo?: string
  check_portafolio?: boolean
  link_portafolio?: string
  aspiracion_salarial?: string
  experiencia_reciente?: string
  motivo_cambio_empleo?: string
  resolucion_problemas?: string
  manejo_errores?: string
  trabajo_equipo?: string
  preferencia_trabajo?: string
  descripcion_tres_palabras?: string
  manejo_estres?: string
  manejo_cambios?: string
  areas_mejora?: string
  actualizacion_profesional?: string
  pasatiempos?: string
  conocimiento_empresa?: string
  porque_contratar?: string
  motivacion_laboral?: string
  motivacion_largo_plazo?: string
  roles_disfrutados?: string
  preguntas_candidato?: string
  informacion_adicional?: string
  correo_corporativo?: string
  contrasena_asignada?: string
  usuario_creado?: boolean
  creado_en: string
  actualizado_en: string
}

export interface Pregunta {
  id: string
  empresa_id: string
  key: string
  label_base: string
  tipo: 'text' | 'textarea' | 'select' | 'checkbox' | 'boolean' | 'number' | 'date' | 'file'
  grupo: string
  orden: number
  placeholder?: string
  texto_apoyo?: string
  opciones?: { value: string; label: string }[]
  requerido: boolean
  visible_formulario: boolean
  visible_admin: boolean
  creado_en: string
  actualizado_en: string
}

export interface PuestoTrabajo {
  id: string
  empresa_id: string
  nombre: string
  slug: string
  descripcion?: string
  activo: boolean
  orden: number
  creado_en: string
  actualizado_en: string
}

export interface PuestoPregunta {
  id: string
  puesto_id: string
  pregunta_id: string
  label_publico?: string
  texto_apoyo_publico?: string
  orden: number
  requerido: boolean
  visible_formulario: boolean
  creado_en: string
  pregunta?: Pregunta
}

export interface PostulanteRespuesta {
  id: string
  postulante_id: string
  pregunta_id: string
  puesto_id: string
  valor?: string
  creado_en: string
}

// ═══════════ CONSTANTES ═══════════

export const EMPRESA_ID = DEFAULT_EMPRESA_ID

export const ESTADOS = ['nuevo', 'en_revision', 'entrevista', 'aceptado', 'rechazado'] as const

export const ESTADO_LABELS: Record<string, string> = {
  nuevo: 'Nuevo', en_revision: 'En Revisión', entrevista: 'Entrevista',
  aceptado: 'Aceptado', rechazado: 'Rechazado',
}

export const ESTADO_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_revision: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  entrevista: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  aceptado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rechazado: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

export const TIPO_PREGUNTA_LABELS: Record<string, string> = {
  text: 'Texto corto',
  textarea: 'Texto largo',
  select: 'Selección',
  checkbox: 'Casillas múltiples',
  boolean: 'Sí/No',
  number: 'Numérico',
  date: 'Fecha',
  file: 'Archivo',
}

export const GRUPOS_PREGUNTAS = [
  'Sistema y Control',
  'Datos Personales y Contacto',
  'Logística y Herramientas',
  'Perfil Profesional',
  'Experiencia y Situacional',
  'Psicología y Actitud',
  'Alineación con la Empresa',
]

export const PUESTOS_DEFAULT = [
  'Arquitecto', 'Administrador', 'Asesor de Ventas', 'Asistente Administrativo',
  'Chofer', 'Desarrollador Web', 'Diseñador Gráfico', 'Editor de Video',
  'Gerente Comercial', 'Gerente Operativo', 'Ingeniero Civil', 'Ingeniero Industrial',
  'Personal de Limpieza', 'Personal de Seguridad', 'Traficker',
]

export const gruposPreguntas = [
  { titulo: 'Sistema y Control', icon: 'Settings', campos: ['estado', 'calificacion', 'fecha_entrevista', 'proyecto_interesado', 'puesto_postula', 'puesto_trabajo_id', 'correo_corporativo', 'contrasena_asignada', 'usuario_creado'] },
  { titulo: 'Datos Personales y Contacto', icon: 'User', campos: ['nombre_completo', 'apodo_preferido', 'celular_contacto', 'correo_contacto', 'fecha_nacimiento', 'estado_civil', 'lugar_residencia', 'tiempo_residencia', 'personas_cargo', 'apoyo_familiar'] },
  { titulo: 'Logística y Herramientas', icon: 'Truck', campos: ['licencia_vehiculo', 'transporte_trabajo', 'acceso_tecnologia', 'disponibilidad_inmediata', 'disponibilidad_viaje', 'disponibilidad_horarios', 'compromisos_horarios', 'horario_preferido', 'condicion_medica'] },
  { titulo: 'Perfil Profesional', icon: 'GraduationCap', campos: ['nivel_estudios', 'capacitaciones_recientes', 'herramientas_dominadas', 'cv_archivo', 'check_portafolio', 'link_portafolio', 'aspiracion_salarial'] },
  { titulo: 'Experiencia y Situacional', icon: 'Briefcase', campos: ['experiencia_reciente', 'motivo_cambio_empleo', 'resolucion_problemas', 'manejo_errores', 'trabajo_equipo', 'preferencia_trabajo'] },
  { titulo: 'Psicología y Actitud', icon: 'Brain', campos: ['descripcion_tres_palabras', 'manejo_estres', 'manejo_cambios', 'areas_mejora', 'actualizacion_profesional', 'pasatiempos'] },
  { titulo: 'Alineación con la Empresa', icon: 'Target', campos: ['conocimiento_empresa', 'porque_contratar', 'motivacion_laboral', 'motivacion_largo_plazo', 'roles_disfrutados', 'preguntas_candidato', 'informacion_adicional'] },
]

export const diccionarioPreguntas: Record<string, string> = {
  estado: 'Estado', calificacion: 'Calificación', fecha_entrevista: 'Fecha de entrevista',
  proyecto_interesado: 'Proyecto Interesado', puesto_postula: 'Puesto de trabajo al que postula',
  puesto_trabajo_id: 'Puesto de trabajo',
  correo_corporativo: 'Correo corporativo',
  contrasena_asignada: 'Contraseña asignada',
  usuario_creado: 'Usuario creado',
  nombre_completo: '¿Cuál es tu nombre completo?', apodo_preferido: '¿Tienes algún nombre o apodo con el que prefieras que te llamemos?',
  celular_contacto: 'Celular de contacto + Cod País', correo_contacto: 'Correo de contacto',
  fecha_nacimiento: '¿Cuál es tu fecha de nacimiento?', estado_civil: '¿Cuál es tu estado civil?',
  lugar_residencia: '¿Dónde vives actualmente? (País y Ciudad)', tiempo_residencia: '¿Cuánto tiempo llevas viviendo en esa zona?',
  personas_cargo: '¿Tienes hijos u otras personas a tu cargo actualmente?', apoyo_familiar: '¿Cuentas con algún tipo de apoyo familiar o red de apoyo?',
  licencia_vehiculo: '¿Cuentas con licencia de conducir? ¿Tienes vehículo propio?', transporte_trabajo: '¿Cómo llegas habitualmente a tu lugar de trabajo?',
  acceso_tecnologia: '¿Tienes acceso constante a un celular, correo electrónico y/o internet?', disponibilidad_inmediata: '¿Tienes disponibilidad inmediata?',
  disponibilidad_viaje: '¿Tienes disponibilidad para viajar o trasladarte en caso de ser necesario?', disponibilidad_horarios: '¿Estás dispuesto/a a trabajar en horarios rotativos, fines de semana o de forma remota?',
  compromisos_horarios: '¿Tienes algún compromiso que afecte tu disponibilidad horaria?', horario_preferido: 'En caso de que puedas escoger tu hora de trabajo, (4 horas seguidas) cuáles serían?',
  condicion_medica: '¿Tienes alguna condición médica, tratamiento o limitación que debamos conocer?', nivel_estudios: '¿Cuál es tu nivel de estudios? ¿Tienes estudios en curso?',
  capacitaciones_recientes: '¿Has tomado cursos o capacitaciones recientes?', herramientas_dominadas: '¿Qué herramientas, programas o sistemas dominas?',
  cv_archivo: 'Sube tu CV o portafolio', check_portafolio: 'Check Portafolio', link_portafolio: 'Link de tu portafolio o CV',
  aspiracion_salarial: '¿Cuál es tu aspiración salarial? en USD', experiencia_reciente: 'Háblame de tu experiencia laboral más reciente. ¿Qué funciones cumplías?',
  motivo_cambio_empleo: '¿Por qué dejaste tu último empleo o por qué estás considerando un cambio?', resolucion_problemas: 'Cuéntame de una situación en la que tuviste que resolver un problema complejo.',
  manejo_errores: '¿Has cometido un error en el trabajo? ¿Qué hiciste para solucionarlo?', trabajo_equipo: '¿Has trabajado en equipo? ¿Qué papel sueles tomar?',
  preferencia_trabajo: '¿Te sientes más productivo trabajando solo o en equipo?', descripcion_tres_palabras: '¿Cómo te describirías en tres palabras?',
  manejo_estres: '¿Cómo manejas el estrés o la carga laboral alta?', manejo_cambios: '¿Cómo reaccionas frente a los cambios o nuevos desafíos?',
  areas_mejora: '¿Qué aspectos te gustaría seguir mejorando o aprendiendo?', actualizacion_profesional: '¿Cómo te mantienes actualizado/a en tu profesión?',
  pasatiempos: '¿Tienes algún pasatiempo, deporte o actividad que practiques con regularidad?',
  conocimiento_empresa: '¿Qué sabes sobre nuestra empresa?', porque_contratar: '¿Por qué consideras que eres la persona ideal para este puesto?',
  motivacion_laboral: '¿Qué te motiva a dar lo mejor de ti en el trabajo?', motivacion_largo_plazo: '¿Qué te motivaría a permanecer a largo plazo en una empresa?',
  roles_disfrutados: '¿Qué tipo de roles o tareas disfrutas más?', preguntas_candidato: '¿Tienes alguna pregunta para nosotros?',
  informacion_adicional: '¿Hay algo que no hayamos preguntado y que creas importante mencionar?',
}