// ═══════════════════════════════════════════════════════════════════════════════
// XPAND CORP - TIPOS PARA CONTEXTOS
// Tipos unificados para todos los contexts de la aplicación
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProductoCategoria {
  id: string
  empresa_id: string
  nombre: string
  slug: string
  descripcion?: string
  icono?: string
  color: string
  orden: number
  sku_prefix?: string
  activo: boolean
  creado_en: string
}

export interface ProductoCategoriaInput {
  nombre: string
  slug?: string
  descripcion?: string
  icono?: string
  color?: string
  orden?: number
  sku_prefix?: string
  activo?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADOS DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProductoEstado {
  id: string
  empresa_id: string
  nombre: string
  slug: string
  color: string
  icono?: string
  descripcion?: string
  orden: number
  es_default: boolean
  activo: boolean
  creado_en: string
}

export interface ProductoEstadoInput {
  nombre: string
  slug?: string
  color?: string
  icono?: string
  descripcion?: string
  orden?: number
  es_default?: boolean
  activo?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIDADES DE MEDIDA
// ═══════════════════════════════════════════════════════════════════════════════

export type TipoUnidad = 'weight' | 'volume' | 'quantity' | 'distance' | 'other'

export interface UnidadMedida {
  id: string
  empresa_id: string
  nombre: string
  abreviatura: string
  tipo: TipoUnidad
  orden: number
  activo: boolean
  creado_en: string
}

export interface UnidadMedidaInput {
  nombre: string
  abreviatura: string
  tipo: TipoUnidad
  orden?: number
  activo?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATRONES SKU
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkuPatron {
  id: string
  empresa_id: string
  nombre: string
  prefijo: string
  descripcion?: string
  activo: boolean
  orden: number
  creado_en: string
}

export interface SkuPatronInput {
  nombre: string
  prefijo: string
  descripcion?: string
  activo?: boolean
  orden?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONAS DE ENVÍO
// ═══════════════════════════════════════════════════════════════════════════════

export type CargoType = 'document' | 'parcel' | 'heavy' | 'fragile'

export interface EnvioZona {
  id: string
  empresa_id: string
  nombre: string
  regiones: string[]
  precio_base: number
  precio_por_gramo: number
  dias_estimados: string
  activo: boolean
  orden: number
  creado_en: string
}

export type EnvioZonaInput = Omit<EnvioZona, 'id' | 'empresa_id' | 'creado_en'>

export interface ShippingSettings {
  zones: EnvioZona[]
  volumetricFactor: number
  heavyChargeFactor: number
  documentFlatRate: number
  fragileSurcharge: number
  freeShippingThreshold: number | null
  activeCarrier: string
  selectedCountry: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MONEDA
// ═══════════════════════════════════════════════════════════════════════════════

export interface Moneda {
  code: string
  symbol: string
  name: string
}

export interface MonedasConfig {
  id: string
  empresa_id: string
  moneda_base: string
  monedas_activas: string[]
  margen_seguridad: number
  multi_moneda_habilitado: boolean
  moneda_impuestos: string
  actualizar_automaticamente: boolean
  ultima_actualizacion: string | null
  creado_en: string
}

export interface TasaCambio {
  id: string
  empresa_id: string
  moneda_origen: string
  moneda_destino: string
  tasa: number
  fuente: string
  actualizado_en: string
}

export interface ExchangeRates {
  [key: string]: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE NEGOCIO
// ═══════════════════════════════════════════════════════════════════════════════

export type BusinessType = 'physical' | 'digital' | 'mixed'

export interface BusinessConfig {
  id: string
  empresa_id: string
  enable_perishables: boolean
  enable_serialization: boolean
  enable_shipping: boolean
  business_type: BusinessType
  coins_nombre?: string
  coins_ratio_usd?: number
  recompensa_lectura_segundos?: number
  recompensa_lectura_coins?: number
  blog_premium_por_defecto?: boolean
  created_at: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARRITO DE COMPRAS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CartItem {
  id: string
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
  sku?: string
  categoria?: string
  descuento: number
  tipo_descuento: 'fixed' | 'percent'
  metadata?: Record<string, any>
}

export interface Cart {
  id: string
  empresa_id: string
  user_id: string
  items: CartItem[]
  total: number
  subtotal: number
  impuesto: number
  descuento_global: number
  tipo_descuento: 'fixed' | 'percent'
  codigo_cupon?: string
  costo_envio: number
  cliente_data?: Record<string, any>
  tipo_transaccion: 'venta' | 'cotizacion'
  tipo_documento: 'ticket' | 'boleta' | 'factura'
  creado_en: string
  actualizado_en: string
}

export type TransactionType = 'venta' | 'cotizacion'
export type DocumentType = 'ticket' | 'boleta' | 'factura'

// ═══════════════════════════════════════════════════════════════════════════════
// PREFERENCIAS DE USUARIO
// ═══════════════════════════════════════════════════════════════════════════════

export interface UsuarioPreferencias {
  id: string
  user_id: string
  tema: 'light' | 'dark' | 'system'
  idioma: string
  moneda_preferida: string
  notificaciones_email: boolean
  notificaciones_push: boolean
  configuracion_etiquetas: Record<string, any>
  configuracion_pos: Record<string, any>
  creado_en: string
  actualizado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING CMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LandingSeccion {
  id: string
  empresa_id: string
  seccion: string
  contenido: Record<string, any>
  actualizado_en: string
  actualizado_por?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORIAL VENTAS POS
// ═══════════════════════════════════════════════════════════════════════════════

export interface HistorialVentaPOS {
  id: string
  empresa_id: string
  user_id?: string
  tipo: TransactionType
  tipo_documento: DocumentType
  cliente_data?: Record<string, any>
  items: CartItem[]
  subtotal: number
  impuesto: number
  descuento: number
  total: number
  metodo_pago: 'cash' | 'card' | 'xpandCoins' | 'transfer'
  estado: 'pendiente' | 'completada' | 'cancelada'
  notas?: string
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE RESPUESTA API
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
