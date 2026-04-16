// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - SCHEMAS DE VALIDACIÓN ZOD
// Esquemas para validar datos JSONB de Supabase
// ═══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMAS BASE
// ═══════════════════════════════════════════════════════════════════════════════

export const uuidSchema = z.string().uuid()

export const moneySchema = z.number().min(0)

export const dateStringSchema = z.string().datetime()

export const phoneSchema = z.string().min(6).max(20)

export const emailSchema = z.string().email()

// ═══════════════════════════════════════════════════════════════════════════════
// INMOBILIARIO - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const ownerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nombre requerido'),
  documentId: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  phoneCode: z.string().default('+593'),
  phone: z.string()
})

export const ownersArraySchema = z.array(ownerSchema).default([])

export const pagoInicialSchema = z.object({
  id: z.string(),
  descripcion: z.string(),
  monto_esperado: moneySchema,
  monto_pagado: moneySchema.default(0),
  fecha_esperada: dateStringSchema.optional(),
  fecha_pagada: dateStringSchema.optional(),
  comprobante_url: z.string().url().optional().or(z.literal('')),
  tipo: z.literal('CUOTA_REGULAR')
})

export const pagosInicialesArraySchema = z.array(pagoInicialSchema).default([])

export const cuotaMensualSchema = z.object({
  id: z.string(),
  mes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  monto_esperado: moneySchema,
  monto_pagado: moneySchema.default(0),
  fecha_pago: dateStringSchema.optional(),
  comprobante_url: z.string().url().optional().or(z.literal('')),
  tipo: z.literal('CUOTA_REGULAR')
})

export const cuotasMensualesArraySchema = z.array(cuotaMensualSchema).default([])

export const abonoExtraordinarioSchema = z.object({
  id: z.string(),
  lote_id: uuidSchema,
  monto: moneySchema.min(1, 'Monto debe ser mayor a0'),
  concepto: z.string().min(1, 'Concepto requerido'),
  tipo: z.literal('ABONO_EXTRAORDINARIO'),
  fecha: dateStringSchema,
  comprobante_url: z.string().url().optional().or(z.literal('')),
  saldo_antes: moneySchema,
  saldo_despues: moneySchema,
  notificacion_enviada: z.boolean().default(false),
  mensaje_notificacion: z.string().optional(),
  creado_en: dateStringSchema
})

export const abonosExtraordinariosArraySchema = z.array(abonoExtraordinarioSchema).default([])

export const conditionsSchema = z.object({
  authorizedHold: z.boolean().default(false),
  regularPayer: z.boolean().default(true)
})

export const contactoAlternativoSchema = z.object({
  name: z.string().default(''),
  phone: z.string().default(''),
  phone_code: z.string().default('+593')
})

export const loteEstadoSchema = z.enum(['Disponible', 'Reservado', 'Vendido', 'Desistido'])

export const loteSchema = z.object({
  id: uuidSchema,
  proyecto_id: z.string(),
  asesor_id: uuidSchema.optional().nullable(),
  propietario_id: uuidSchema.optional().nullable(),
  
  lot_number: z.string().min(1, 'Número de lote requerido'),
  lot_area: z.number().min(0).default(0),
  
  estado: loteEstadoSchema,
  
  client_name: z.string(),
  owners: ownersArraySchema,
  
  total_price: moneySchema,
  expected_quota: moneySchema,
  initial_payment_expected: moneySchema,
  initial_payment_paid: moneySchema.default(0),
  
  initial_payments: pagosInicialesArraySchema,
  payments: cuotasMensualesArraySchema,
  abonos_extraordinarios: abonosExtraordinariosArraySchema,
  
  saldo_final_pendiente: moneySchema.default(0),
  saldo_calculado_en: dateStringSchema.optional().nullable(),
  
  contrato_url: z.string().url().optional().nullable(),
  contrato_plantilla_id: uuidSchema.optional().nullable(),
  documentos: z.array(z.object({
    nombre: z.string(),
    tipo: z.string(),
    url: z.string().url(),
    creado_en: dateStringSchema
  })).default([]),
  
  conditions: conditionsSchema,
  special_observations: z.string().optional(),
  
  start_month: dateStringSchema.optional().nullable(),
  signature_month: dateStringSchema.optional().nullable(),
  escritura_month: dateStringSchema.optional().nullable(),
  
  alternate_contact: contactoAlternativoSchema,
  
  commission_type: z.enum(['percentage', 'fixed']).default('percentage'),
  commission_value: moneySchema.default(0),
  commission_trigger_percent: z.number().min(0).max(100).default(30),
  
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const projectStatusSchema = z.enum([
  'EN PLANOS',
  'PREVENTA',
  'VENTA CON ESCRITURA',
  'VENTA FINALIZADA',
  'PROYECTO ENTREGADO'
])

export const projectConfigSchema = z.object({
  startMonth: dateStringSchema,
  signatureMonth: dateStringSchema,
  escrituraMonth: dateStringSchema,
  masterplanImage: z.string().url().optional().nullable(),
  lotPins: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    lotId: z.string()
  })).default([])
})

export const projectSchema = z.object({
  id: z.string(),
  empresa_id: uuidSchema.optional().nullable(),
  
  nombre: z.string().min(1, 'Nombre requerido'),
  status: projectStatusSchema,
  website: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  
  start_date: dateStringSchema.optional().nullable(),
  end_date: dateStringSchema.optional().nullable(),
  
  logo_url: z.string().url().optional().nullable(),
  primary_color: z.string().default('#be0b3c'),
  secondary_color: z.string().optional().nullable(),
  
  signature_month: dateStringSchema.optional().nullable(),
  escritura_month: dateStringSchema.optional().nullable(),
  
  notion_database_id: z.string().optional().nullable(),
  notion_last_sync: dateStringSchema.optional().nullable(),
  
  is_active: z.boolean().default(true),
  
  config: projectConfigSchema,
  
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// LEADS - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const leadEstadoSchema = z.enum(['nuevo', 'contactado', 'calificado', 'convertido', 'perdido'])

export const leadOrigenSchema = z.enum(['formulario', 'manual', 'importacion'])

export const leadProductoInteresSchema = z.enum(['lote', 'curso', 'ebook', 'asesoria', 'otro'])

export const leadSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema,
  campana_id: uuidSchema.optional().nullable(),
  asesor_id: uuidSchema.optional().nullable(),
  template_id: uuidSchema.optional().nullable(),
  
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email().optional().or(z.literal('')),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  
  datos: z.record(z.string(), z.any()).default({}),
  
  ciudad: z.string().optional(),
  presupuesto: z.string().optional(),
  interes: z.string().optional(),
  mensaje: z.string().optional(),
  
  estado: leadEstadoSchema,
  
  origen: leadOrigenSchema.optional(),
  producto_interes: leadProductoInteresSchema.optional(),
  proyecto_interes: z.string().optional(),
  
  etiquetas: z.array(z.string()).default([]),
  notas: z.string().optional(),
  
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  
  convertido_en: dateStringSchema.optional().nullable(),
  convertido_a: z.enum(['socio', 'propietario']).optional().nullable(),
  
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE EVENTS - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const liveEventEstadoSchema = z.enum([
  'programado',
  'en_vivo',
  'pausado',
  'finalizado',
  'grabacion_disponible'
])

export const liveEventTipoSchema = z.enum([
  'webinar',
  'presentacion',
  'qya',
  'social',
  'entrevista'
])

export const streamTipoSchema = z.enum(['rtmp', 'hls', 'youtube', 'vimeo', 'meet_embed'])

export const liveEventSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema,
  
  titulo: z.string().min(1, 'Título requerido'),
  descripcion: z.string().optional(),
  tipo: liveEventTipoSchema,
  
  imagen_portada: z.string().url().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  
  estado: liveEventEstadoSchema,
  fecha_programada: dateStringSchema,
  hora_inicio: dateStringSchema.optional().nullable(),
  hora_fin: dateStringSchema.optional().nullable(),
  duracion_minutos: z.number().min(1).optional(),
  
  stream_url: z.string().url().optional().nullable(),
  stream_tipo: streamTipoSchema.default('hls'),
  
  sala_externa_url: z.string().url().optional().nullable(),
  sala_externa_tipo: z.enum(['meet', 'zoom', 'teams', 'otro']).optional().nullable(),
  
  participacion_habilitada: z.boolean().default(true),
  max_participantes: z.number().min(1).optional(),
  
  chat_habilitado: z.boolean().default(true),
  chat_moderado: z.boolean().default(false),
  
  coins_por_minuto: z.number().min(0).default(1),
  coins_bonus_asistir: z.number().min(0).optional(),
  
  vistas_total: z.number().min(0).default(0),
  participantes_unicos: z.number().min(0).default(0),
  pico_concurrentes: z.number().min(0).default(0),
  mensajes_chat_total: z.number().min(0).default(0),
  
  proyecto_id: z.string().optional().nullable(),
  campana_id: uuidSchema.optional().nullable(),
  
  grabacion_url: z.string().url().optional().nullable(),
  grabacion_disponible: z.boolean().default(false),
  
  creado_por: uuidSchema,
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

export const liveEventMensajeSchema = z.object({
  id: uuidSchema,
  evento_id: uuidSchema,
  user_id: uuidSchema,
  
  mensaje: z.string().min(1, 'Mensaje requerido'),
  tipo: z.enum(['texto', 'emoji', 'enlace', 'imagen']),
  
  estado: z.enum(['pendiente', 'aprobado', 'rechazado', 'eliminado']),
  moderado_por: uuidSchema.optional().nullable(),
  moderado_en: dateStringSchema.optional().nullable(),
  
  reacciones: z.array(z.object({
    emoji: z.string(),
    usuarios: z.array(uuidSchema)
  })).default([]),
  
  respuesta_a: uuidSchema.optional().nullable(),
  
  timestamp: dateStringSchema,
  editado_en: dateStringSchema.optional().nullable()
})

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRATOS - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const clausulaOpcionSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  contenido: z.string(),
  seleccionada: z.boolean().optional()
})

export const clausulaTemplateSchema = z.object({
  id: z.string(),
  orden: z.number().min(0),
  titulo: z.string(),
  contenido: z.string(),
  opciones: z.array(clausulaOpcionSchema).optional()
})

export const contratoPlantillaSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema,
  proyecto_id: z.string().optional().nullable(),
  
  nombre: z.string().min(1, 'Nombre requerido'),
  version: z.number().min(1).default(1),
  
  clausulas: z.array(clausulaTemplateSchema),
  variables_disponibles: z.array(z.string()).default([]),
  
  activo: z.boolean().default(true),
  creado_por: uuidSchema,
  creado_en: dateStringSchema
})

export const contratoAplicadoSchema = z.object({
  id: uuidSchema,
  lote_id: uuidSchema,
  plantilla_id: uuidSchema,
  
  clausulas_seleccionadas: z.array(z.object({
    clausula_id: z.string(),
    opcion_id: z.string(),
    contenido_renderizado: z.string()
  })),
  
  variables_valores: z.record(z.string(), z.string()),
  
  pdf_url: z.string().url().optional().nullable(),
  
  creado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTAS DE MORA - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const nivelMoraSchema = z.enum(['sin_mora', 'gris_5dias', 'rojo_30dias'])

export const notificacionMoraSchema = z.object({
  id: z.string(),
  tipo: z.enum(['email', 'whatsapp', 'sistema']),
  destinatario: z.string(),
  mensaje: z.string(),
  enviado_en: dateStringSchema
})

export const tareaMoraSchema = z.object({
  id: z.string(),
  asesor_id: uuidSchema,
  descripcion: z.string(),
  prioridad: z.enum(['media', 'alta', 'urgente']),
  completada: z.boolean().default(false),
  completada_en: dateStringSchema.optional().nullable()
})

export const alertaMoraSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema,
  lote_id: uuidSchema,
  propietario_id: uuidSchema.optional().nullable(),
  asesor_id: uuidSchema.optional().nullable(),
  
  nivel: nivelMoraSchema,
  dias_mora: z.number().min(0),
  
  monto_pendiente: moneySchema,
  cuotas_pendientes: z.array(z.number()).default([]),
  
  notificaciones_enviadas: z.array(notificacionMoraSchema).default([]),
  tareas_creadas: z.array(tareaMoraSchema).default([]),
  
  resuelta: z.boolean().default(false),
  resuelta_en: dateStringSchema.optional().nullable(),
  
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const tipoProductoSchema = z.enum(['digital', 'fisico', 'servicio', 'suscripcion'])

export const estadoProductoSchema = z.enum(['borrador', 'activo', 'destacado', 'agotado'])

export const productoSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema,
  
  nombre: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  descripcion: z.string().optional(),
  contenido: z.string().optional(),
  
  metodo_pago: z.enum(['coins', 'dinero', 'ambos']),
  precio_coins: z.number().min(0).optional().nullable(),
  precio_usd: moneySchema.optional().nullable(),
  
  tipo: tipoProductoSchema,
  estado: estadoProductoSchema,
  
  categoria_id: uuidSchema.optional().nullable(),
  
  imagen_principal: z.string().url().optional().nullable(),
  imagen_alt: z.string().optional(),
  galeria: z.array(z.string().url()).default([]),
  
  stock: z.number().min(0).default(0),
  stock_ilimitado: z.boolean().default(false),
  
  archivo_url: z.string().url().optional().nullable(),
  archivo_tamano: z.number().optional(),
  
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const templateTipoSchema = z.enum(['landing', 'blog', 'funnel'])

export const templateEstadoSchema = z.enum(['borrador', 'activo', 'archivado'])

export const templateSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema,
  
  tipo: templateTipoSchema,
  estado: templateEstadoSchema,
  
  nombre: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  es_principal: z.boolean().default(false),
  
  secciones: z.record(z.string(), z.any()).default({}),
  
  campana_id: uuidSchema.optional().nullable(),
  
  creado_en: dateStringSchema,
  actualizado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// LOG DE AUDITORÍA - SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const accionAuditoriaSchema = z.enum([
  'editar_precio',
  'cambiar_estado',
  'crear_lote',
  'subir_contrato',
  'crear_usuario',
  'editar_config'
])

export const entidadAuditoriaSchema = z.enum([
  'lote',
  'proyecto',
  'contrato',
  'cliente',
  'usuario',
  'config'
])

export const logAuditoriaSchema = z.object({
  id: uuidSchema,
  empresa_id: uuidSchema.optional().nullable(),
  
  usuario_id: uuidSchema,
  usuario_nombre: z.string(),
  usuario_rol: z.enum(['superadmin', 'socio_proyecto', 'asesor', 'socio', 'propietario', 'empleado']),
  
  accion: accionAuditoriaSchema,
  entidad: entidadAuditoriaSchema,
  entidad_id: z.string(),
  
  valor_antes: z.record(z.string(), z.any()),
  valor_despues: z.record(z.string(), z.any()),
  
  ip: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
  
  creado_en: dateStringSchema
})

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Valida un objeto JSONB de Supabase contra un schema Zod
 * @param data Datos a validar
 * @param schema Schema Zod a usar
 * @returns Datos validados o error
 */
export function validateJsonb<T>(data: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    throw new Error(`Validación fallida: ${result.error.message}`)
  }
  
  return result.data
}

/**
 * Valida un array JSONB de Supabase
 * @param data Array a validar
 * @param schema Schema Zod para elementos del array
 * @returns Array validado o error
 */
export function validateJsonbArray<T>(data: unknown, schema: z.ZodSchema<T>): T[] {
  if (!Array.isArray(data)) {
    return []
  }
  
  return data.map(item => validateJsonb(item, schema))
}

/**
 * Calcula el saldo final de un lote
 * @param lote Lote con pagos
 * @returns Saldo final pendiente
 */
export function calcularSaldoFinal(lote: {
  total_price: number
  initial_payments: Array<{ monto_pagado: number }>
  payments: Array<{ monto_pagado: number }>
  abonos_extraordinarios: Array<{ monto: number }>
}): number {
  const inicialPagada = lote.initial_payments.reduce((acc, p) => acc + p.monto_pagado, 0)
  const cuotasPagadas = lote.payments.reduce((acc, p) => acc + p.monto_pagado, 0)
  const abonosExtra = lote.abonos_extraordinarios.reduce((acc, p) => acc + p.monto, 0)
  
  const saldo = lote.total_price - inicialPagada - cuotasPagadas - abonosExtra
  
  return Math.max(0, saldo)
}

/**
 * Clasifica los pagos de un lote
 * @param lote Lote con pagos
 * @returns Historial de pagos clasificado
 */
export function clasificarHistorialPagos(lote: {
  initial_payments: Array<{
    id: string
    descripcion: string
    monto_pagado: number
    fecha_pagada?: string
    comprobante_url?: string
  }>
  payments: Array<{
    id: string
    mes: string
    monto_pagado: number
    fecha_pago?: string
    comprobante_url?: string
  }>
  abonos_extraordinarios: Array<{
    id: string
    concepto: string
    monto: number
    fecha: string
    saldo_antes: number
    saldo_despues: number
    comprobante_url?: string
  }>
}): Array<{
  id: string
  fecha: Date
  concepto: string
  monto: number
  tipo: 'CUOTA_REGULAR' | 'ABONO_EXTRAORDINARIO'
  saldo_antes?: number
  saldo_despues?: number
  comprobante_url?: string
}> {
  const historial: Array<{
    id: string
    fecha: Date
    concepto: string
    monto: number
    tipo: 'CUOTA_REGULAR' | 'ABONO_EXTRAORDINARIO'
    saldo_antes?: number
    saldo_despues?: number
    comprobante_url?: string
  }> = []
  
  // Pagos iniciales
  for (const pago of lote.initial_payments) {
    if (pago.monto_pagado > 0) {
      historial.push({
        id: pago.id,
        fecha: pago.fecha_pagada ? new Date(pago.fecha_pagada) : new Date(),
        concepto: pago.descripcion || 'Cuota Inicial',
        monto: pago.monto_pagado,
        tipo: 'CUOTA_REGULAR',
        comprobante_url: pago.comprobante_url
      })
    }
  }
  
  // Cuotas mensuales
  for (const cuota of lote.payments) {
    if (cuota.monto_pagado > 0) {
      historial.push({
        id: cuota.id,
        fecha: cuota.fecha_pago ? new Date(cuota.fecha_pago) : new Date(),
        concepto: `Cuota ${cuota.mes}`,
        monto: cuota.monto_pagado,
        tipo: 'CUOTA_REGULAR',
        comprobante_url: cuota.comprobante_url
      })
    }
  }
  
  // Abonos extraordinarios
  for (const abono of lote.abonos_extraordinarios) {
    historial.push({
      id: abono.id,
      fecha: new Date(abono.fecha),
      concepto: abono.concepto,
      monto: abono.monto,
      tipo: 'ABONO_EXTRAORDINARIO',
      saldo_antes: abono.saldo_antes,
      saldo_despues: abono.saldo_despues,
      comprobante_url: abono.comprobante_url
    })
  }
  
  // Ordenar por fecha descendente
  return historial.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}