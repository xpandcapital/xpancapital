// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - TIPOS DE DOMINIO
// Definiciones de todas las entidades del sistema
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════════════════════════

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UUID = string

export type DateString = string

export type Money = number

// ═══════════════════════════════════════════════════════════════════════════════
// ROLES Y USUARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export type RolSistema = 'superadmin' | 'socio_proyecto' | 'asesor' | 'socio' | 'propietario' | 'empleado'

export type TipoCuenta = 'persona' | 'empresa'

export type TipoDocumento = 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte' | 'CE' | 'RUT' | 'CURP' | 'RFC' | 'NIT' | 'TI' | 'CC' | 'CPF' | 'CI'

export type CourierPreferido = 'pickup' | 'home' | 'office'

export interface User {
  id: UUID
  empresa_id?: UUID
  
  email: string
  nombre: string
  apellido?: string
  avatar_url?: string
  
  tipo_cuenta: TipoCuenta
  tipo_documento?: TipoDocumento
  numero_documento?: string
  
  phone?: string
  whatsapp?: string
  
  roles: RolSistema[]
  
  blis_coins: number
  coins_totales_ganados: number
  coins_totales_gastados: number
  
  verificado: boolean
  ha_comprado: boolean
  
  recibir_newsletter: boolean
  idioma: string
  tema: 'light' | 'dark'
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface Profile extends User {
  nivel_id?: UUID
  nivel?: NivelCliente
  
  Pais?: string
  region?: string
  ciudad?: string
  
  codigo_referido?: string
  referido_por?: UUID
  
  ultimo_login?: DateString
  total_compras: number
  total_gastado_usd: Money
  total_referidos: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-TENANCY
// ═══════════════════════════════════════════════════════════════════════════════

export interface Empresa {
  id: UUID
  slug: string
  nombre: string
  nombre_legal?: string
  
  logo_url?: string
  logo_dark_url?: string
  favicon_url?: string
  color_primario: string
  color_secundario: string
  color_acento: string
  
  moneda_base: string
  monedas_activas: string[]
  idioma: string
  zona_horaria: string
  
  Pais_fiscal: string
  ruc?: string
  razon_social?: string
  direccion_fiscal?: string
  
  dominio_principal?: string
  dominios_alias: string[]
  
  activo: boolean
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface EmpresaConfig {
  id: UUID
  empresa_id: UUID
  
  blog_activo: boolean
  tienda_activa: boolean
  academia_activa: boolean
  referidos_activo: boolean
  bliscoins_activo: boolean
  
  envios_activo: boolean
  envios_gratis_monto?: Money
  
  coins_por_lectura: number
  segundos_lectura: number
  coins_registro: number
  coins_referido: number
  
  creado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// INMOBILIARIO
// ═══════════════════════════════════════════════════════════════════════════════

export type ProjectStatus = 'EN PLANOS' | 'PREVENTA' | 'VENTA CON ESCRITURA' | 'VENTA FINALIZADA' | 'PROYECTO ENTREGADO'

export interface Project {
  id: string
  empresa_id?: UUID
  
  nombre: string
  status: ProjectStatus
  website?: string
  location?: string
  
  start_date?: DateString
  end_date?: DateString
  
  logo_url?: string
  primary_color: string
  secondary_color?: string
  
  signature_month?: DateString
  escritura_month?: DateString
  
  notion_database_id?: string
  notion_last_sync?: DateString
  
  is_active: boolean
  
  config?: {
    primary_color?: string
    secondary_color?: string
    logo_url?: string
    favicon_url?: string
    custom_css?: string
    google_analytics_id?: string
    meta_title?: string
    meta_description?: string
    meta_keywords?: string[]
    social_links?: {
      instagram?: string
      facebook?: string
      youtube?: string
      tiktok?: string
      linkedin?: string
      twitter?: string
      whatsapp?: string
    }
  }
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface LoteEstado {
  estado: 'Disponible' | 'Reservado' | 'Vendido' | 'Desistido'
}

export type LoteEstadoValue = 'Disponible' | 'Reservado' | 'Vendido' | 'Desistido'

export interface Owner {
  id: string
  name: string
  documentId: string
  email: string
  phoneCode: string
  phone: string
}

export interface PagoInicial {
  id: string
  descripcion: string
  monto_esperado: Money
  monto_pagado: Money
  fecha_esperada?: DateString
  fecha_pagada?: DateString
  comprobante_url?: string
  tipo: 'CUOTA_REGULAR'
}

export interface CuotaMensual {
  id: string
  mes: string
  monto_esperado: Money
  monto_pagado: Money
  fecha_pago?: DateString
  comprobante_url?: string
  tipo: 'CUOTA_REGULAR'
}

export interface AbonoExtraordinario {
  id: string
  lote_id: UUID
  
  monto: Money
  concepto: string
  tipo: 'ABONO_EXTRAORDINARIO'
  
  fecha: DateString
  comprobante_url?: string
  
  saldo_antes: Money
  saldo_despues: Money
  
  notificacion_enviada: boolean
  mensaje_notificacion?: string
  
  creado_en: DateString
}

export interface Conditions {
  authorizedHold: boolean
  regularPayer: boolean
}

export interface ContactoAlternativo {
  name: string
  phone: string
  phone_code: string
}

export interface Lote {
  id: UUID
  proyecto_id: string
  asesor_id?: UUID
  propietario_id?: UUID
  
  lot_number: string
  lot_area: number
  
  estado: LoteEstadoValue
  
  client_name: string
  owners: Owner[]
  
  total_price: Money
  expected_quota: Money
  initial_payment_expected: Money
  initial_payment_paid: Money
  
  initial_payments: PagoInicial[]
  payments: CuotaMensual[]
  abonos_extraordinarios: AbonoExtraordinario[]
  
  saldo_final_pendiente: Money
  saldo_calculado_en?: DateString
  
  contrato_url?: string
  contrato_plantilla_id?: UUID
  documentos: Documento[]
  
  conditions: Conditions
  special_observations?: string
  
  start_month?: DateString
  signature_month?: DateString
  escritura_month?: DateString
  
  alternate_contact: ContactoAlternativo
  
  commission_type: 'percentage' | 'fixed'
  commission_value: Money
  commission_trigger_percent: number
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface SaldoFinal {
  total_venta: Money
  inicial_total: Money
  inicial_pagada: Money
  cuotas_esperadas: Money
  cuotas_pagadas: Money
  abonos_extraordinarios: Money
  saldo_final_pendiente: Money
  progreso_porcentaje: number
}

export interface Documento {
  nombre: string
  tipo: string
  url: string
  creado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPIETARIO
// ═══════════════════════════════════════════════════════════════════════════════

export interface Propietario {
  id: UUID
  empresa_id: UUID
  
  nombre: string
  email?: string
  telefono?: string
  whatsapp?: string
  
  documento_tipo?: TipoDocumento
  documento_numero?: string
  
  asesor_id?: UUID
  
  lotes: LoteResumen[]
  
  total_pagado: Money
  saldo_pendiente: Money
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface LoteResumen {
  id: UUID
  proyecto_id: string
  proyecto_nombre: string
  lot_number: string
  estado: LoteEstadoValue
  total_price: Money
  total_pagado: Money
  saldo_pendiente: Money
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADVISOR (ASESOR)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Advisor {
  id: UUID
  
  name: string
  email?: string
  phone?: string
  phone_code: string
  document_id?: string
  
  commission_type: 'percentage' | 'fixed'
  commission_value: Money
  commission_trigger_percent: number
  
  is_active: boolean
  
  creado_en: DateString
  actualizado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// E-COMMERCE
// ═══════════════════════════════════════════════════════════════════════════════

export type TipoProducto = 'digital' | 'fisico' | 'servicio' | 'suscripcion'

export type EstadoProducto = 'borrador' | 'activo' | 'destacado' | 'agotado'

export interface Producto {
  id: UUID
  empresa_id: UUID
  
  nombre: string
  slug: string
  descripcion?: string
  contenido?: string
  
  metodo_pago: 'coins' | 'dinero' | 'ambos'
  precio_coins?: number
  precio_usd?: Money
  
  tipo: TipoProducto
  estado: EstadoProducto
  
  categoria_id?: UUID
  categoria?: ProductoCategoria
  
  imagen_principal?: string
  imagen_alt?: string
  galeria: string[]
  
  stock: number
  stock_ilimitado: boolean
  
  archivo_url?: string
  archivo_tamano?: number
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface ProductoCategoria {
  id: UUID
  empresa_id: UUID
  
  nombre: string
  slug: string
  descripcion?: string
  icono?: string
  orden: number
  
  creado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETING Y LEADS
// ═══════════════════════════════════════════════════════════════════════════════

export type LeadEstado = 'nuevo' | 'contactado' | 'calificado' | 'convertido' | 'perdido'

export interface Lead {
  id: UUID
  empresa_id: UUID
  campana_id?: UUID
  asesor_id?: UUID
  template_id?: UUID
  
  nombre: string
  email?: string
  telefono?: string
  whatsapp?: string
  
  datos: Record<string, Json>
  
  ciudad?: string
  presupuesto?: string
  interes?: string
  mensaje?: string
  
  estado: LeadEstado
  
  origen?: 'formulario' | 'manual' | 'importacion'
  producto_interes?: 'lote' | 'curso' | 'ebook' | 'asesoria' | 'otro'
  proyecto_interes?: string
  
  etiquetas: string[]
  notas?: string
  
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  
  convertido_en?: DateString
  convertido_a?: 'socio' | 'propietario'
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface Campana {
  id: UUID
  empresa_id: UUID
  asesor_id?: UUID
  
  nombre: string
  descripcion?: string
  estado: 'borrador' | 'activa' | 'pausada' | 'finalizada'
  
  notificar_email: boolean
  notificar_whatsapp: boolean
  emails_notificacion: string[]
  whatsapp_notificacion: string[]
  
  notion_database_id?: string
  notion_sync: boolean
  
  creado_en: DateString
  actualizado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

export type TemplateTipo = 'landing' | 'blog' | 'funnel'
export type TemplateEstado = 'borrador' | 'activo' | 'archivado'

export interface Template {
  id: UUID
  empresa_id: UUID
  
  tipo: TemplateTipo
  estado: TemplateEstado
  
  nombre: string
  slug: string
  es_principal: boolean
  
  secciones: Record<string, Json>
  
  campana_id?: UUID
  
  creado_en: DateString
  actualizado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export type LiveEventEstado = 'programado' | 'en_vivo' | 'pausado' | 'finalizado' | 'grabacion_disponible'
export type LiveEventTipo = 'webinar' | 'presentacion' | 'qya' | 'social' | 'entrevista'

export interface LiveEvent {
  id: UUID
  empresa_id: UUID
  
  titulo: string
  descripcion?: string
  tipo: LiveEventTipo
  
  imagen_portada?: string
  thumbnail?: string
  
  estado: LiveEventEstado
  fecha_programada: DateString
  hora_inicio?: DateString
  hora_fin?: DateString
  duracion_minutos?: number
  
  stream_url?: string
  stream_tipo: 'rtmp' | 'hls' | 'youtube' | 'vimeo' | 'meet_embed'
  
  sala_externa_url?: string
  sala_externa_tipo?: 'meet' | 'zoom' | 'teams' | 'otro'
  
  participacion_habilitada: boolean
  max_participantes?: number
  
  chat_habilitado: boolean
  chat_moderado: boolean
  
  coins_por_minuto: number
  coins_bonus_asistir?: number
  
  vistas_total: number
  participantes_unicos: number
  pico_concurrentes: number
  mensajes_chat_total: number
  
  proyecto_id?: string
  campana_id?: UUID
  
  grabacion_url?: string
  grabacion_disponible: boolean
  
  creado_por: UUID
  creado_en: DateString
  actualizado_en: DateString
}

export interface LiveEventAsistencia {
  id: UUID
  evento_id: UUID
  user_id: UUID
  
  session_id: string
  
  conectado_en: DateString
  desconectado_en?: DateString
  
  heartbeats: number
  duracion_segundos: number
  
  coins_ganados: number
  bonus_aplicado: boolean
  coins_bonus?: number
  
  participo_en_sala: boolean
  tiempo_en_sala_segundos?: number
  
  dispositivo?: 'desktop' | 'mobile' | 'tablet'
  navegador?: string
  
  creado_en: DateString
}

export type MensajeEstado = 'pendiente' | 'aprobado' | 'rechazado' | 'eliminado'

export interface LiveEventMensaje {
  id: UUID
  evento_id: UUID
  user_id: UUID
  user?: User
  
  mensaje: string
  tipo: 'texto' | 'emoji' | 'enlace' | 'imagen'
  
  estado: MensajeEstado
  moderado_por?: UUID
  moderado_en?: DateString
  
  reacciones: Array<{
    emoji: string
    usuarios: string[]
  }>
  
  respuesta_a?: UUID
  respuestas?: LiveEventMensaje[]
  
  timestamp: DateString
  editado_en?: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRATOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContratoPlantilla {
  id: UUID
  empresa_id: UUID
  proyecto_id?: string
  
  nombre: string
  version: number
  
  clausulas: ClausulaTemplate[]
  variables_disponibles: string[]
  
  activo: boolean
  creado_por: UUID
  creado_en: DateString
}

export interface ClausulaTemplate {
  id: string
  orden: number
  
  titulo: string
  contenido: string
  
  opciones?: ClausulaOpcion[]
}

export interface ClausulaOpcion {
  id: string
  titulo: string
  contenido: string
  seleccionada?: boolean
}

export interface ContratoAplicado {
  id: UUID
  lote_id: UUID
  plantilla_id: UUID
  
  clausulas_seleccionadas: Array<{
    clausula_id: string
    opcion_id: string
    contenido_renderizado: string
  }>
  
  variables_valores: Record<string, string>
  
  pdf_url?: string
  
  creado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTAS DE MORA
// ═══════════════════════════════════════════════════════════════════════════════

export type NivelMora = 'sin_mora' | 'gris_5dias' | 'rojo_30dias'

export interface AlertaMora {
  id: UUID
  empresa_id: UUID
  lote_id: UUID
  propietario_id?: UUID
  asesor_id?: UUID
  
  nivel: NivelMora
  dias_mora: number
  
  monto_pendiente: Money
  cuotas_pendientes: number[]
  
  notificaciones_enviadas: NotificacionMora[]
  tareas_creadas: TareaMora[]
  
  resuelta: boolean
  resuelta_en?: DateString
  
  creado_en: DateString
  actualizado_en: DateString
}

export interface NotificacionMora {
  id: string
  tipo: 'email' | 'whatsapp' | 'sistema'
  destinatario: string
  mensaje: string
  enviado_en: DateString
}

export interface TareaMora {
  id: string
  asesor_id: UUID
  descripcion: string
  prioridad: 'media' | 'alta' | 'urgente'
  completada: boolean
  completada_en?: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDITORÍA
// ═══════════════════════════════════════════════════════════════════════════════

export interface LogAuditoria {
  id: UUID
  empresa_id?: UUID
  
  usuario_id: UUID
  usuario_nombre: string
  usuario_rol: RolSistema
  
  accion: 'editar_precio' | 'cambiar_estado' | 'crear_lote' | 'subir_contrato' | 'crear_usuario' | 'editar_config'
  entidad: 'lote' | 'proyecto' | 'contrato' | 'cliente' | 'usuario' | 'config'
  entidad_id: string
  
  valor_antes: Record<string, Json>
  valor_despues: Record<string, Json>
  
  ip?: string
  user_agent?: string
  
  creado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORIAL DE PAGOS
// ═══════════════════════════════════════════════════════════════════════════════

export type TipoPago = 'CUOTA_REGULAR' | 'ABONO_EXTRAORDINARIO'

export interface HistorialPago {
  id: string
  fecha: DateString
  concepto: string
  monto: Money
  tipo: TipoPago
  
  saldo_antes?: Money
  saldo_despues?: Money
  
  comprobante_url?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISTA DEL CLIENTE (Portal Propietario)
// ═══════════════════════════════════════════════════════════════════════════════

export interface LoteVistaCliente {
  id: UUID
  proyecto_nombre: string
  lot_number: string
  lot_area: number
  estado: 'Reservado' | 'Vendido'
  
  owners: Owner[]
  
  total_price: Money
  progreso_porcentaje: number
  
  total_pagado: Money
  inicial_pagada: Money
  cuotas_pagadas: Money
  abonos_extraordinarios: Money
  
  saldo_final_pendiente: Money
  
  historial_pagos: HistorialPago[]
  
  proxima_cuota?: {
    mes: string
    monto: Money
    fecha_limite: DateString
  }
  
  contrato?: ContratoVistaCliente
  
  asesor_contacto?: {
    nombre: string
    telefono?: string
    email?: string
  }
}

export interface ContratoVistaCliente {
  proyecto_id: string
  proyecto_nombre: string
  
  variables: Record<string, string>
  clausulas_renderizadas: string[]
  pdf_url?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// NIVELES DE CLIENTE
// ═══════════════════════════════════════════════════════════════════════════════

export interface NivelCliente {
  id: UUID
  empresa_id: UUID
  
  nombre: string
  slug: string
  color: string
  icono: string
  orden: number
  
  compras_minimas: number
  coins_minimos: number
  referidos_minimos: number
  monto_minimo: Money
  
  descuento_porcentaje: Money
  coins_bonus_porcentaje: Money
  envio_gratis: boolean
  soporte_prioritario: boolean
  acceso_eventos: boolean
  
  comision_porcentaje: Money
  comision_tipo: 'porcentaje' | 'monto_fijo_coins' | 'monto_fijo_usd'
  
  creado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRACIONES
// ═══════════════════════════════════════════════════════════════════════════════

export type IntegracionTipo = 'whatsapp' | 'email' | 'notion' | 'zapier' | 'webhook' | 'binance'

export interface Integracion {
  id: UUID
  empresa_id: UUID
  
  tipo: IntegracionTipo
  nombre: string
  
  config: Record<string, Json>
  
  activa: boolean
  ultima_sincronizacion?: DateString
  
  creado_en: DateString
  actualizado_en: DateString
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface StatsResponse {
  total_usuarios: number
  total_productos: number
  total_posts: number
  total_ventas: Money
  total_coins_circulacion: number
}