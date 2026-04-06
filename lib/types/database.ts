// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - TIPOS DE BASE DE DATOS
// Generado automáticamente desde supabase_complete_schema.sql
// ═══════════════════════════════════════════════════════════════════════════════

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ═══════════════════════════════════════════════════════════════════════════════
// EMPRESAS (Multi-tenant)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Empresa {
  id: string
  slug: string
  nombre: string
  nombre_legal?: string
  
  // Branding
  logo_url?: string
  logo_dark_url?: string
  favicon_url?: string
  color_primario: string
  color_secundario: string
  color_acento: string
  
  // Configuración regional
  moneda_base: string
  monedas_activas: string[]
  idioma: string
  zona_horaria: string
  
  // Fiscal
  pais_fiscal: string
  ruc?: string
  razon_social?: string
  direccion_fiscal?: string
  
  // Dominios
  dominio_principal?: string
  dominios_alias: string[]
  
  // Estado
  activo: boolean
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  plan_limite_usuarios: number
  plan_limite_productos: number
  plan_limite_almacenamiento: number
  
  creado_en: string
  actualizado_en: string
}

export interface EmpresaConfig {
  id: string
  empresa_id: string
  
  // Funcionalidades
  blog_activo: boolean
  tienda_activa: boolean
  academia_activa: boolean
  referidos_activo: boolean
  bliscoins_activo: boolean
  
  // Envíos
  envios_activo: boolean
  envios_gratis_monto?: number
  
  // Gamificación
  coins_por_lectura: number
  segundos_lectura: number
  coins_registro: number
  coins_referido: number
  
  // Legal
  terminos_condiciones?: string
  politica_privacidad?: string
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// NIVELES DE CLIENTE
// ═══════════════════════════════════════════════════════════════════════════════

export interface NivelCliente {
  id: string
  empresa_id: string
  
  nombre: string
  slug: string
  color: string
  icono: string
  orden: number
  
  // Requisitos
  compras_minimas: number
  coins_minimos: number
  referidos_minimos: number
  monto_minimo: number
  
  // Beneficios
  descuento_porcentaje: number
  coins_bonus_porcentaje: number
  envio_gratis: boolean
  soporte_prioritario: boolean
  acceso_eventos: boolean
  
  // Comisión
  comision_porcentaje: number
  comision_tipo: 'porcentaje' | 'monto_fijo_coins' | 'monto_fijo_usd'
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFILES DE USUARIO
// ═══════════════════════════════════════════════════════════════════════════════

export type TipoCuenta = 'persona' | 'empresa'
export type TipoDocumento = 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte' | 'CE' | 'RUT' | 'CURP' | 'RFC' | 'NIT' | 'TI' | 'CC' | 'CPF' | 'CI'
export type RolUsuario = 'usuario' | 'cliente' | 'editor' | 'admin' | 'superadmin'
export type CourierPreferido = 'pickup' | 'home' | 'office'

export interface Profile {
  id: string
  empresa_id?: string
  
  // Datos básicos
  email: string
  nombre?: string
  apellido?: string
  avatar_url?: string
  telefono?: string
  fecha_nacimiento?: string
  
  // Tipo de cuenta
  tipo_cuenta: TipoCuenta
  
  // Datos de empresa
  empresa_nombre?: string
  empresa_razon_social?: string
  empresa_ruc?: string
  empresa_rep_legal?: string
  
  // Documento
  tipo_documento?: TipoDocumento
  numero_documento?: string
  
  // Ubicación
  pais: string
  region?: string
  ciudad?: string
  
  // Datos personales
  estado_civil?: string
  profesion?: string
  educacion?: string
  
  // Verificación
  verificado: boolean
  verificado_en?: string
  verificado_por?: string
  
  // Nivel
  nivel_id?: string
  nivel?: NivelCliente
  
  // Blis Coins
  blis_coins: number
  coins_totales_ganados: number
  coins_totales_gastados: number
  coins_expiran?: string
  
  // Permisos
  rol: RolUsuario
  ha_comprado: boolean
  
  // Preferencias
  recibir_newsletter: boolean
  recibir_push: boolean
  idioma: string
  tema: string
  courier_preferido: CourierPreferido
  
  // Referidos
  codigo_referido?: string
  referido_por?: string
  
  // Notas
  notas_internas?: string
  es_caso_dificil: boolean
  
  // Automatizaciones
  cumpleanos_auto_regalo: boolean
  recordatorio_inactividad: boolean
  
  // Estado
  cuenta_congelada: boolean
  cuenta_fusionada_con?: string
  
  // Métricas
  ultimo_login?: string
  total_compras: number
  total_gastado_usd: number
  total_referidos: number
  
  creado_en: string
  actualizado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECCIONES
// ═══════════════════════════════════════════════════════════════════════════════

export type TipoDireccion = 'envio' | 'facturacion' | 'oficina' | 'otra'

export interface Direccion {
  id: string
  user_id: string
  
  tipo: TipoDireccion
  etiqueta?: string
  es_principal: boolean
  
  // Ubicación
  direccion: string
  direccion2?: string
  ciudad: string
  region?: string
  codigo_postal?: string
  pais: string
  
  // Coordenadas
  latitud?: number
  longitud?: number
  
  // Envío
  instrucciones?: string
  acceso_dificil: boolean
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENVÍOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EnvioZona {
  id: string
  empresa_id: string
  
  nombre: string
  regiones: string[]
  precio: number
  moneda: string
  dias_estimados: number
  
  activo: boolean
  orden: number
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG
// ═══════════════════════════════════════════════════════════════════════════════

export type EstadoPost = 'borrador' | 'publicado' | 'archivado'
export type MetodoPagoPost = 'coins' | 'dinero' | 'ambos'

export interface BlogCategoria {
  id: string
  empresa_id: string
  
  nombre: string
  slug: string
  descripcion?: string
  icono: string
  color: string
  orden: number
  
  creado_en: string
}

export interface BlogTag {
  id: string
  empresa_id: string
  
  nombre: string
  slug: string
  
  creado_en: string
}

export interface BlogPost {
  id: string
  empresa_id: string
  
  titulo: string
  slug: string
  contenido: string
  extracto?: string
  seo_title?: string
  seo_description?: string
  
  // Imagen
  imagen_portada?: string
  imagen_alt?: string
  
  // Relaciones
  categoria_id?: string
  categoria?: BlogCategoria
  autor_id?: string
  autor?: Profile
  tags?: BlogTag[]
  
  // Estado
  estado: EstadoPost
  publicado_en?: string
  
  // Configuración de pago
  es_premium: boolean
  metodo_pago: MetodoPagoPost
  precio_coins: number
  precio_usd: number
  
  // Gamificación
  recompensa_segundos: number
  recompensa_coins: number
  
  // Métricas
  vistas: number
  tiempo_lectura_minutos: number
  
  creado_en: string
  actualizado_en: string
}

export interface BlogLectura {
  id: string
  empresa_id: string
  user_id: string
  post_id: string
  
  tiempo_segundos: number
  porcentaje_scroll: number
  
  recompensa_otorgada: boolean
  coins_ganados: number
  
  creado_en: string
}

export type EstadoComment = 'activo' | 'oculto' | 'spam'

export interface BlogComment {
  id: string
  empresa_id: string
  post_id: string
  user_id: string
  user?: Profile
  
  contenido: string
  padre_id?: string
  respuestas?: BlogComment[]
  
  estado: EstadoComment
  
  creado_en: string
  actualizado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

export type MetodoPagoProducto = 'coins' | 'dinero' | 'ambos'
export type TipoProducto = 'digital' | 'fisico' | 'servicio' | 'suscripcion'
export type ComisionTipo = 'porcentaje' | 'monto_fijo_coins' | 'monto_fijo_usd'

export interface ProductoCategoria {
  id: string
  empresa_id: string
  
  nombre: string
  slug: string
  descripcion?: string
  icono?: string
  orden: number
  
  creado_en: string
}

export interface Producto {
  id: string
  empresa_id: string
  
  nombre: string
  slug: string
  descripcion?: string
  contenido?: string
  
  // Configuración de pago
  metodo_pago: MetodoPagoProducto
  precio_coins?: number
  precio_usd?: number
  
  // Sistema de referidos
  comision_activo: boolean
  comision_tipo: ComisionTipo
  comision_valor: number
  comision_duracion: number
  comision_nivel_min: number
  
  // Tipo
  tipo: TipoProducto
  
  // Categoría
  categoria_id?: string
  categoria?: ProductoCategoria
  
  // Media
  imagen_principal?: string
  imagen_alt?: string
  galeria: string[]
  
  // Inventario
  stock: number
  stock_ilimitado: boolean
  
  // Dimensiones (físicos)
  peso_kg?: number
  dimensiones?: {
    largo: number
    ancho: number
    alto: number
  }
  
  // Digital
  archivo_url?: string
  archivo_tamano?: number
  
  // Estado
  activo: boolean
  destacado: boolean
  
  creado_en: string
  actualizado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERIDOS
// ═══════════════════════════════════════════════════════════════════════════════

export type EstadoReferido = 'pendiente' | 'registrado' | 'activo' | 'inactivo'

export interface Referido {
  id: string
  empresa_id: string
  
  referidor_id: string
  referidor?: Profile
  invitado_id: string
  invitado?: Profile
  
  codigo_referido?: string
  
  estado: EstadoReferido
  
  bonus_registro: number
  bonus_registro_otorgado: boolean
  
  creado_en: string
}

export type EstadoComision = 'pendiente' | 'pagada' | 'cancelada'

export interface ReferidoComision {
  id: string
  empresa_id: string
  
  referidor_id: string
  referidor?: Profile
  invitado_id: string
  invitado?: Profile
  compra_id?: string
  
  // Comisión
  monto_coins: number
  monto_usd: number
  
  // Configuración aplicada
  comision_tipo?: string
  comision_valor?: number
  compra_numero: number
  
  // Estado
  estado: EstadoComision
  pagada_en?: string
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPRAS
// ═══════════════════════════════════════════════════════════════════════════════

export type MetodoPagoCompra = 'coins' | 'stripe' | 'paypal' | 'manual'
export type EstadoCompra = 'pendiente' | 'completado' | 'cancelado' | 'reembolsado'

export interface Compra {
  id: string
  empresa_id: string
  user_id: string
  user?: Profile
  producto_id?: string
  producto?: Producto
  
  // Método
  metodo_pago: MetodoPagoCompra
  
  // Montos
  monto_coins: number
  monto_usd: number
  moneda: string
  tipo_cambio?: number
  
  // Referido
  referido_por?: string
  comision_generada: number
  comision_estado: string
  
  // Transacción
  transaction_id?: string
  
  // Estado
  estado: EstadoCompra
  
  // Envío
  direccion_envio_id?: string
  direccion_envio?: Direccion
  codigo_seguimiento?: string
  
  // Metadata
  notas?: string
  metadata: Record<string, any>
  
  creado_en: string
  actualizado_en: string
}

export interface CarritoAbandonado {
  id: string
  empresa_id: string
  user_id: string
  
  items: Array<{
    producto_id: string
    cantidad: number
    precio: number
  }>
  total_usd: number
  
  cupon_enviado: boolean
  cupon_enviado_en?: string
  
  creado_en: string
  actualizado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLIS COINS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoinsPaquete {
  id: string
  empresa_id: string
  
  nombre: string
  descripcion?: string
  cantidad: number
  precio_usd: number
  moneda: string
  
  bonus: number
  destacado: boolean
  activo: boolean
  orden: number
  
  creado_en: string
}

export type TipoTransaccion =
  | 'lectura_blog'
  | 'compra_producto'
  | 'compra_coins'
  | 'bonus_registro'
  | 'bonus_referido'
  | 'admin_credito'
  | 'admin_debito'
  | 'reembolso'
  | 'expiracion'

export interface BovedaTransaccion {
  id: string
  empresa_id: string
  user_id: string
  user?: Profile
  
  tipo: TipoTransaccion
  
  referencia_tipo?: string
  referencia_id?: string
  
  monto: number
  balance_antes: number
  balance_despues: number
  
  descripcion?: string
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURSOS Y CERTIFICADOS
// ═══════════════════════════════════════════════════════════════════════════════

export type EstadoExamen = 'pendiente' | 'aprobado' | 'reprobado' | 'bloqueado'

export interface Curso {
  id: string
  empresa_id: string
  
  nombre: string
  slug: string
  descripcion?: string
  
  modulos: Array<{
    id: string
    titulo: string
    lecciones: Array<{
      id: string
      titulo: string
      contenido: string
      duracion: number
    }>
  }>
  
  precio_coins: number
  precio_usd: number
  
  max_intentos: number
  nota_aprobacion: number
  
  certificado_template?: string
  
  activo: boolean
  
  creado_en: string
}

export interface CursoProgreso {
  id: string
  user_id: string
  user?: Profile
  curso_id: string
  curso?: Curso
  
  progreso: number
  nota_final?: number
  intentos: number
  examen_estado: EstadoExamen
  examen_liberado_en?: string
  
  creado_en: string
  actualizado_en: string
}

export interface Certificado {
  id: string
  user_id: string
  user?: Profile
  curso_id?: string
  curso?: Curso
  
  nombre: string
  fecha_emision: string
  codigo_verificacion: string
  archivo_url?: string
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Evento {
  id: string
  empresa_id: string
  
  nombre: string
  descripcion?: string
  fecha?: string
  lugar?: string
  
  solo_niveles: string[]
  cupo?: number
  
  creado_en: string
}

export type EstadoInvitacion = 'pendiente' | 'confirmado' | 'rechazado'

export interface EventoInvitacion {
  id: string
  evento_id: string
  evento?: Evento
  user_id: string
  user?: Profile
  
  estado: EstadoInvitacion
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════

export type TipoNotificacion =
  | 'lectura_completada'
  | 'coins_ganados'
  | 'coins_comprados'
  | 'nuevo_articulo'
  | 'compra_exitosa'
  | 'comentario_respuesta'
  | 'referido_registro'
  | 'comision_recibida'
  | 'evento_invitacion'
  | 'nivel_subido'
  | 'sistema'

export interface Notificacion {
  id: string
  empresa_id: string
  user_id: string
  
  tipo: TipoNotificacion
  
  titulo: string
  mensaje: string
  link?: string
  
  leida: boolean
  leida_en?: string
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDITORÍA
// ═══════════════════════════════════════════════════════════════════════════════

export interface AuditoriaLog {
  id: string
  empresa_id?: string
  
  user_id?: string
  accion: string
  tabla?: string
  registro_id?: string
  datos_anteriores?: Record<string, any>
  datos_nuevos?: Record<string, any>
  ip?: string
  user_agent?: string
  
  creado_en: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE RESPUESTA
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
  total_ventas: number
  total_coins_circulacion: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SelectOption {
  value: string
  label: string
}

export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: string
  children?: MenuItem[]
}

export interface Breadcrumb {
  label: string
  href?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE TYPE FOR SUPABASE
// ═══════════════════════════════════════════════════════════════════════════════

export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: Empresa
        Insert: Omit<Empresa, 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Omit<Empresa, 'id' | 'creado_en'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Omit<Profile, 'id' | 'creado_en'>>
      }
      blog_posts: {
        Row: BlogPost
        Insert: Omit<BlogPost, 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Omit<BlogPost, 'id' | 'creado_en'>>
      }
      productos: {
        Row: Producto
        Insert: Omit<Producto, 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Omit<Producto, 'id' | 'creado_en'>>
      }
      compras: {
        Row: Compra
        Insert: Omit<Compra, 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Omit<Compra, 'id' | 'creado_en'>>
      }
      boveda_transacciones: {
        Row: BovedaTransaccion
        Insert: Omit<BovedaTransaccion, 'id' | 'creado_en'>
        Update: Partial<Omit<BovedaTransaccion, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tipo_cuenta: TipoCuenta
      tipo_documento: TipoDocumento
      rol_usuario: RolUsuario
      estado_post: EstadoPost
      estado_compra: EstadoCompra
    }
  }
}