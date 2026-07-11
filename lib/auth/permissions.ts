// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - SISTEMA DE PERMISOS Y ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export type UserRole = 'superadmin' | 'admin' | 'editor' | 'empleado' | 'cliente' | 'usuario'

export const PERMISSIONS = {
  // Dashboard
  'dashboard:ver': 'Ver Dashboard',
  // Principal
  'proyectos:ver': 'Ver Proyectos',
  'proyectos:crear': 'Crear Proyectos',
  'proyectos:editar': 'Editar Proyectos',
  'proyectos:eliminar': 'Eliminar Proyectos',
  'lotes:ver': 'Ver Gestión de Lotes',
  'lotes:editar': 'Editar Lotes',
  'contratos:ver': 'Ver Contratos',
  'contratos:crear': 'Crear Contratos',
  'contratos:editar': 'Editar Contratos',
  'asesores:ver': 'Ver Asesores',
  'asesores:crear': 'Crear Asesores',
  'asesores:editar': 'Editar Asesores',
  // Ventas
  'pos:ver': 'Ver Terminal POS',
  'pos:crear': 'Crear en Terminal POS',
  'pos:editar': 'Editar en Terminal POS',
  'pos:eliminar': 'Eliminar en Terminal POS',
  'ventas:ver': 'Ver Historial de Ventas',
  'ventas:crear': 'Registrar Ventas',
  'ventas:editar': 'Editar Ventas',
  'ventas:eliminar': 'Eliminar Ventas',
  'formasdepago:ver': 'Ver Formas de Pago',
  'formasdepago:editar': 'Configurar Formas de Pago',
  'productos:ver': 'Ver Productos',
  'productos:crear': 'Crear Productos',
  'productos:editar': 'Editar Productos',
  'productos:eliminar': 'Eliminar Productos',
  'clientes:ver': 'Ver Clientes',
  'clientes:crear': 'Crear Clientes',
  'clientes:editar': 'Editar Clientes',
  'ajustes:ver': 'Ver Ajustes del Comercio',
  'ajustes:crear': 'Crear Ajustes del Comercio',
  'ajustes:editar': 'Editar Ajustes del Comercio',
  'ajustes:eliminar': 'Eliminar Ajustes del Comercio',
  'cursos:ver': 'Ver Cursos',
  'cursos:crear': 'Crear Cursos',
  'cursos:editar': 'Editar Cursos',
  'cursos:eliminar': 'Eliminar Cursos',
  'capacitaciones:ver': 'Ver Capacitaciones',
  'capacitaciones:crear': 'Crear Capacitaciones',
  'capacitaciones:editar': 'Editar Capacitaciones',
  'capacitaciones:eliminar': 'Eliminar Capacitaciones',
  'certificados:ver': 'Ver Certificados',
  'certificados:crear': 'Crear Certificados',
  'certificados:editar': 'Editar Certificados',
  'certificados:eliminar': 'Eliminar Certificados',
  'trading:ver': 'Ver Trading',
  'biblioteca:ver': 'Ver Biblioteca',
  'biblioteca:crear': 'Crear Biblioteca',
  'biblioteca:editar': 'Editar Biblioteca',
  'biblioteca:eliminar': 'Eliminar Biblioteca',
  // Chat
  'chat:ver': 'Ver Chat',
  'chat:configurar': 'Configurar Chat',
  // Contenido
  'templates:ver': 'Ver Páginas',
  'correo:ver': 'Ver Correo IMAP',
  'correo:crear': 'Crear Correo IMAP',
  'correo:editar': 'Editar Correo IMAP',
  'correo:eliminar': 'Eliminar Correo IMAP',

  'templates:crear': 'Crear Páginas',
  'templates:editar': 'Editar Páginas',
  'templates:eliminar': 'Eliminar Páginas',
  'mails:ver': 'Ver Correos',
  'mails:crear': 'Crear Correos',
  'mails:editar': 'Editar Correos',
  'mails:eliminar': 'Eliminar Correos',
  'calendarios:ver': 'Ver Calendarios',
  'calendarios:crear': 'Crear Calendarios',
  'calendarios:editar': 'Editar Calendarios',
  'calendarios:eliminar': 'Eliminar Calendarios',
  'formularios:ver': 'Ver Formularios',
  'formularios:crear': 'Crear Formularios',
  'formularios:editar': 'Editar Formularios',
  'formularios:eliminar': 'Eliminar Formularios',
  'leads:ver': 'Ver Leads',
  'leads:crear': 'Crear Leads',
  'leads:editar': 'Editar Leads',
  'leads:eliminar': 'Eliminar Leads',
  'campanas:ver': 'Ver Campañas',
  'campanas:crear': 'Crear Campañas',
  'campanas:editar': 'Editar Campañas',
  'campanas:eliminar': 'Eliminar Campañas',
  'notificaciones:ver': 'Ver Notificaciones',
  'notificaciones:enviar': 'Enviar Notificaciones',
  'transmisiones:ver': 'Ver Transmisiones',
  'transmisiones:crear': 'Crear Transmisiones',
  'transmisiones:editar': 'Editar Transmisiones',
  'transmisiones:eliminar': 'Eliminar Transmisiones',
  'blog:ver': 'Ver Blog',
  'blog:crear': 'Crear Blog',
  'blog:editar': 'Editar Blog',
  'blog:eliminar': 'Eliminar Blog',
  // Sistema
  'equipo:ver': 'Ver Personal',
  'equipo:crear': 'Crear Miembros del Equipo',
  'equipo:editar': 'Editar Miembros del Equipo',
  'equipo:eliminar': 'Eliminar Miembros del Equipo',
  'postulantes:ver': 'Ver Postulantes',
  'postulantes:crear': 'Crear Postulantes',
  'postulantes:editar': 'Editar Postulantes',
  'postulantes:eliminar': 'Eliminar Postulantes',
  'puestos:ver': 'Ver Puestos',
  'puestos:crear': 'Crear Puestos',
  'puestos:editar': 'Editar Puestos',
  'puestos:eliminar': 'Eliminar Puestos',
  'preguntas:ver': 'Ver Preguntas',
  'preguntas:crear': 'Crear Preguntas',
  'preguntas:editar': 'Editar Preguntas',
  'preguntas:eliminar': 'Eliminar Preguntas',
  'utilidades:ver': 'Ver Utilidades',
  'utilidades:crear': 'Crear Utilidades',
  'utilidades:editar': 'Editar Utilidades',
  'utilidades:eliminar': 'Eliminar Utilidades',
  'configuracion:ver': 'Ver Configuración',
  'configuracion:crear': 'Crear Configuración',
  'configuracion:editar': 'Editar Configuración',
  'configuracion:eliminar': 'Eliminar Configuración',
  'api-nube:ver': 'Ver APIs y Nube',
  'api-nube:crear': 'Crear APIs y Nube',
  'api-nube:editar': 'Editar APIs y Nube',
  'api-nube:eliminar': 'Eliminar APIs y Nube',
  'analiticas:ver': 'Ver Métricas y SEO',
  'analiticas:crear': 'Crear Métricas y SEO',
  'analiticas:editar': 'Editar Métricas y SEO',
  'analiticas:eliminar': 'Eliminar Métricas y SEO',
  'roles:ver': 'Ver Roles y Niveles',
  'roles:crear': 'Crear Roles y Niveles',
  'roles:editar': 'Editar Roles y Niveles',
  'roles:eliminar': 'Eliminar Roles y Niveles',
  'perfil:ver': 'Ver Perfil',
  'perfil:editar': 'Editar Perfil',
  // Panel Cliente
  'miembros:ver': 'Ver Miembros',
  'facturacion:ver': 'Ver Facturación',
} as const

export type Permission = keyof typeof PERMISSIONS

export const ROLE_DEFAULTS: Record<UserRole, Permission[]> = {
  superadmin: ['*'] as unknown as Permission[],
  admin: ['*'] as unknown as Permission[],
  editor: [
    'dashboard:ver',
    'proyectos:ver', 'proyectos:crear', 'proyectos:editar',
    'lotes:ver', 'lotes:editar',
    'contratos:ver', 'contratos:crear', 'contratos:editar',
    'asesores:ver', 'asesores:crear', 'asesores:editar',
    'pos:ver', 'pos:crear', 'pos:editar',
    'productos:ver', 'productos:crear', 'productos:editar',
    'clientes:ver', 'clientes:crear', 'clientes:editar',
    'ajustes:ver', 'ajustes:crear', 'ajustes:editar',
    'cursos:ver', 'cursos:crear', 'cursos:editar',
    'capacitaciones:ver', 'capacitaciones:crear', 'capacitaciones:editar',
    'certificados:ver', 'certificados:crear', 'certificados:editar',
    'trading:ver',
    'ventas:ver', 'ventas:crear', 'ventas:editar',
    'formasdepago:ver', 'formasdepago:editar',
    'biblioteca:ver', 'biblioteca:crear', 'biblioteca:editar',
    'correo:ver', 'correo:crear', 'correo:editar',
    'chat:ver', 'chat:configurar',
    'templates:ver', 'templates:crear', 'templates:editar',
    'mails:ver', 'mails:crear', 'mails:editar',
    'calendarios:ver', 'calendarios:crear', 'calendarios:editar',
    'formularios:ver', 'formularios:crear', 'formularios:editar',
    'leads:ver', 'leads:crear', 'leads:editar',
    'campanas:ver', 'campanas:crear', 'campanas:editar',
    'notificaciones:ver', 'notificaciones:enviar',
    'transmisiones:ver', 'transmisiones:crear', 'transmisiones:editar',
    'blog:ver', 'blog:crear', 'blog:editar',
    'equipo:ver', 'equipo:crear', 'equipo:editar',
    'postulantes:ver', 'postulantes:crear', 'postulantes:editar',
    'configuracion:ver', 'configuracion:crear', 'configuracion:editar',
    'roles:ver', 'roles:crear', 'roles:editar',
    'perfil:ver', 'perfil:editar',
  ],
  empleado: [
    'dashboard:ver',
    'proyectos:ver',
    'lotes:ver',
    'asesores:ver',
    'pos:ver',
    'ventas:ver',
    'formasdepago:ver',
    'productos:ver',
    'clientes:ver',
    'ajustes:ver',
    'biblioteca:ver',
    'cursos:ver',
    'capacitaciones:ver',
    'certificados:ver',
    'chat:ver',
    'templates:ver',
    'mails:ver',
    'correo:ver',
    'leads:ver',
    'notificaciones:ver',
    'transmisiones:ver',
    'blog:ver',
    'equipo:ver',
    'postulantes:ver',
    'perfil:ver', 'perfil:editar',
  ],
  cliente: [
    'miembros:ver',
    'facturacion:ver',
    'perfil:ver', 'perfil:editar',
  ],
  usuario: [
    'miembros:ver',
    'perfil:ver', 'perfil:editar',
  ],
}

// Mapeo de rutas a permisos requeridos
export const SECTION_PERMISSIONS: Record<string, Permission> = {
  '': 'dashboard:ver',
  'dashboard': 'dashboard:ver',
  'proyectos': 'proyectos:ver',
  'gestion-lotes': 'lotes:ver',
  'contratos': 'contratos:ver',
  'asesores': 'asesores:ver',
  'pos': 'pos:ver',
  'ventas': 'ventas:ver',
  'formasdepago': 'formasdepago:ver',
  'productos': 'productos:ver',
  'productos/entregas': 'productos:ver',
  'clientes': 'clientes:ver',
  'ajustes/comercio': 'ajustes:ver',
  'cursos': 'cursos:ver',
  'biblioteca': 'biblioteca:ver',
  'certificados': 'certificados:ver',
  'trading': 'trading:ver',
  'chat': 'chat:ver',
  'templates': 'templates:ver',
  'mails': 'mails:ver',
  'correo': 'correo:ver',
  'calendarios': 'calendarios:ver',
  'formularios': 'formularios:ver',
  'leads': 'leads:ver',
  'campanas': 'campanas:ver',
  'notificaciones': 'notificaciones:ver',
  'transmisiones': 'transmisiones:ver',
  'blog': 'blog:ver',
  'blog/rutas': 'blog:ver',
  'usuarios': 'equipo:ver',
  'postulantes': 'postulantes:ver',
  'postulantes/puestos': 'puestos:ver',
  'postulantes/preguntas': 'preguntas:ver',
  'mis-capacitaciones': 'capacitaciones:ver',
  'utilidades': 'utilidades:ver',
  'configuracion': 'configuracion:ver',
  'api-nube': 'api-nube:ver',
  'analiticas': 'analiticas:ver',
  'ajustes/roles': 'roles:ver',
  'perfil': 'perfil:ver',
}

// Acciones disponibles para cada permiso
export const PERMISSION_ACTIONS: Record<string, { action: string; label: string; icon: string }[]> = {
  'dashboard': [{ action: 'ver', label: 'Ver', icon: 'eye' }],
  'chat': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'configurar', label: 'Configurar', icon: 'settings' },
  ],
  'proyectos': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'lotes': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
  ],
  'contratos': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
  ],
  'asesores': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
  ],
  'pos': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'productos': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'clientes': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
  ],
  'ajustes': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'cursos': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'capacitaciones': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'certificados': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'trading': [{ action: 'ver', label: 'Ver', icon: 'eye' }],
  'ventas': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'formasdepago': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
  ],
  'biblioteca': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'correo': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'templates': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'mails': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'calendarios': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'formularios': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'leads': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'campanas': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'notificaciones': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'enviar', label: 'Enviar', icon: 'send' },
  ],
  'transmisiones': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'blog': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'equipo': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'postulantes': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'puestos': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'preguntas': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'utilidades': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'configuracion': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'api-nube': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'analiticas': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'roles': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'crear', label: 'Crear', icon: 'plus' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
    { action: 'eliminar', label: 'Eliminar', icon: 'trash' },
  ],
  'perfil': [
    { action: 'ver', label: 'Ver', icon: 'eye' },
    { action: 'editar', label: 'Editar', icon: 'pencil' },
  ],
  'miembros': [{ action: 'ver', label: 'Ver', icon: 'eye' }],
  'facturacion': [{ action: 'ver', label: 'Ver', icon: 'eye' }],
}

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string; defaultRoute: string }> = {
  superadmin: { label: 'Super Admin', color: 'text-white', bgColor: 'bg-blis-red', defaultRoute: '/superadmin' },
  admin: { label: 'Admin', color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30', defaultRoute: '/superadmin' },
  editor: { label: 'Editor', color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/30', defaultRoute: '/superadmin' },
  empleado: { label: 'Empleado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30', defaultRoute: '/superadmin/mis-capacitaciones' },
  cliente: { label: 'Cliente', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30', defaultRoute: '/miembros' },
  usuario: { label: 'Usuario', color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30', defaultRoute: '/miembros' },
}

export interface PermisosAdicionales {
  extra?: string[]
  denied?: string[]
}

export function getEffectivePermissions(
  rol: string,
  permisosAdicionales?: PermisosAdicionales | null
): Set<string> {
  const normalizedRol = (rol || 'usuario') as UserRole
  const defaults = ROLE_DEFAULTS[normalizedRol] || ROLE_DEFAULTS.usuario
  const base = new Set<string>(defaults)

  if (permisosAdicionales?.extra) {
    permisosAdicionales.extra.forEach(p => base.add(p))
  }

  if (permisosAdicionales?.denied) {
    permisosAdicionales.denied.forEach(p => base.delete(p))
  }

  return base
}

export function hasPermission(
  permissions: Set<string>,
  permission: string
): boolean {
  return permissions.has('*') || permissions.has(permission)
}

export function canAccessSection(
  permissions: Set<string>,
  sectionPath: string
): boolean {
  const required = SECTION_PERMISSIONS[sectionPath]
  if (!required) return true
  return hasPermission(permissions, required)
}

export const AVAILABLE_ROUTES: { path: string; label: string; section: string }[] = [
  { path: '/superadmin', label: 'Dashboard', section: 'dashboard' },
  { path: '/superadmin/proyectos', label: 'Proyectos', section: 'proyectos' },
  { path: '/superadmin/mis-capacitaciones', label: 'Mis Capacitaciones', section: 'capacitaciones' },
  { path: '/superadmin/productos', label: 'Productos', section: 'productos' },
  { path: '/superadmin/clientes', label: 'Clientes', section: 'clientes' },
  { path: '/superadmin/cursos', label: 'Cursos', section: 'cursos' },
  { path: '/superadmin/leads', label: 'Leads', section: 'leads' },
  { path: '/superadmin/asesores', label: 'Asesores', section: 'asesores' },
  { path: '/superadmin/postulantes', label: 'Postulantes', section: 'postulantes' },
  { path: '/superadmin/campanas', label: 'Campañas', section: 'campanas' },
  { path: '/superadmin/notificaciones', label: 'Notificaciones', section: 'notificaciones' },
  { path: '/superadmin/blog', label: 'Blog', section: 'blog' },
  { path: '/superadmin/certificados', label: 'Certificados', section: 'certificados' },
  { path: '/superadmin/templates', label: 'Páginas', section: 'templates' },
  { path: '/superadmin/utilidades', label: 'Utilidades', section: 'utilidades' },
  { path: '/superadmin/api-nube', label: 'APIs y Nube', section: 'api-nube' },
  { path: '/superadmin/analiticas', label: 'Analíticas', section: 'analiticas' },
  { path: '/superadmin/ajustes', label: 'Ajustes', section: 'ajustes' },
  { path: '/miembros', label: 'Área de Miembros', section: 'miembros' },
  { path: '/superadmin/perfil', label: 'Perfil', section: 'perfil' },
]

export function getDefaultRouteForRole(rol: string, customRoute?: string | null): string {
  if (customRoute) return customRoute
  const normalizedRol = (rol || 'usuario') as UserRole
  return ROLE_CONFIG[normalizedRol]?.defaultRoute || ROLE_CONFIG.usuario.defaultRoute
}

export function isAdminRole(rol: string): boolean {
  return ['superadmin', 'admin', 'editor', 'empleado'].includes(rol)
}

// Construir llave de permiso
export function buildPermission(section: string, action: string): string {
  return `${section}:${action}`
}

// Verificar si un set de permisos contiene una acción específica
export function hasActionPermission(permissions: Set<string>, section: string, action: string): boolean {
  const permission = buildPermission(section, action)
  return permissions.has('*') || permissions.has(permission)
}