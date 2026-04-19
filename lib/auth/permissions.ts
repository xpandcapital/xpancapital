// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - SISTEMA DE PERMISOS Y ROLES
// Define permisos granulares, roles por defecto y funciones de resolución
// ═══════════════════════════════════════════════════════════════════════════════

// Tipos de rol del sistema (coinciden con profiles.rol en la BD)
export type UserRole = 'superadmin' | 'admin' | 'editor' | 'cliente' | 'usuario'

// Permisos disponibles en el sistema
export const PERMISSIONS = {
  // Dashboard
  'dashboard:ver': 'Ver Dashboard',
  // Proyectos
  'proyectos:ver': 'Ver Proyectos',
  'proyectos:crear': 'Crear Proyectos',
  'proyectos:editar': 'Editar Proyectos',
  'proyectos:eliminar': 'Eliminar Proyectos',
  // Lotes / Gestión
  'lotes:ver': 'Ver Gestión de Lotes',
  'lotes:editar': 'Editar Lotes',
  // Contratos
  'contratos:ver': 'Ver Contratos',
  'contratos:crear': 'Crear Contratos',
  'contratos:editar': 'Editar Contratos',
  // Asesores / Equipo
  'asesores:ver': 'Ver Asesores',
  'asesores:crear': 'Crear Asesores',
  'asesores:editar': 'Editar Asesores',
  // POS
  'pos:ver': 'Ver Terminal POS',
  // Productos
  'productos:ver': 'Ver Productos',
  'productos:crear': 'Crear Productos',
  'productos:editar': 'Editar Productos',
  'productos:eliminar': 'Eliminar Productos',
  // Clientes
  'clientes:ver': 'Ver Clientes',
  'clientes:editar': 'Editar Clientes',
  // Cursos
  'cursos:ver': 'Ver Cursos',
  'cursos:crear': 'Crear Cursos',
  'cursos:editar': 'Editar Cursos',
  'cursos:eliminar': 'Eliminar Cursos',
  // Certificados
  'certificados:ver': 'Ver Certificados',
  'certificados:crear': 'Crear Certificados',
  // Trading
  'trading:ver': 'Ver Trading',
  // Templates / Páginas
  'templates:ver': 'Ver Páginas',
  'templates:editar': 'Editar Páginas',
  // Correos
  'mails:ver': 'Ver Correos',
  'mails:enviar': 'Enviar Correos',
  // Calendarios
  'calendarios:ver': 'Ver Calendarios',
  'calendarios:editar': 'Editar Calendarios',
  // Formularios
  'formularios:ver': 'Ver Formularios',
  'formularios:crear': 'Crear Formularios',
  // Leads
  'leads:ver': 'Ver Leads',
  'leads:editar': 'Editar Leads',
  // Campañas
  'campanas:ver': 'Ver Campañas',
  'campanas:crear': 'Crear Campañas',
  // Blog
  'blog:ver': 'Ver Blog',
  'blog:crear': 'Crear Entradas',
  'blog:editar': 'Editar Entradas',
  'blog:eliminar': 'Eliminar Entradas',
  // Equipo / Usuarios
  'equipo:ver': 'Ver Equipo',
  'equipo:crear': 'Crear Miembros',
  'equipo:editar': 'Editar Miembros',
  // Postulantes
  'postulantes:ver': 'Ver Postulantes',
  'postulantes:editar': 'Evaluar Postulantes',
  // Utilidades
  'utilidades:ver': 'Ver Utilidades',
  // Configuración
  'configuracion:ver': 'Ver Configuración',
  'configuracion:editar': 'Editar Configuración',
  // APIs y Nube
  'api-nube:ver': 'Ver APIs y Nube',
  // Analíticas
  'analiticas:ver': 'Ver Métricas y SEO',
  // Ajustes comercio
  'ajustes:ver': 'Ver Ajustes',
  'ajustes:editar': 'Editar Ajustes',
  // Roles y niveles
  'roles:ver': 'Ver Roles y Niveles',
  'roles:editar': 'Editar Roles y Niveles',
  // Empresas
  'empresas:ver': 'Ver Empresas',
  'empresas:editar': 'Editar Empresas',
  // Perfil
  'perfil:ver': 'Ver Perfil',
  'perfil:editar': 'Editar Perfil',
  // Miembros (panel de cliente)
  'miembros:ver': 'Ver Panel de Miembros',
  // Facturación
  'facturacion:ver': 'Ver Facturación',
} as const

export type Permission = keyof typeof PERMISSIONS

// Permisos por defecto para cada rol
export const ROLE_DEFAULTS: Record<UserRole, Permission[]> = {
  superadmin: ['*'] as unknown as Permission[],
  admin: ['*'] as unknown as Permission[],
  editor: [
    'dashboard:ver',
    'proyectos:ver', 'lotes:ver', 'contratos:ver',
    'asesores:ver',
    'productos:ver', 'productos:editar',
    'clientes:ver',
    'cursos:ver', 'cursos:editar',
    'leads:ver',
    'blog:ver', 'blog:crear',
    'equipo:ver',
    'perfil:ver', 'perfil:editar',
  ],
  cliente: [
    'miembros:ver',
    'productos:ver',
    'cursos:ver',
    'certificados:ver',
    'perfil:ver', 'perfil:editar',
    'facturacion:ver',
  ],
  usuario: [
    'miembros:ver',
    'productos:ver',
    'perfil:ver', 'perfil:editar',
  ],
}

// Mapeo de sección de sidebar a permiso requerido
// La key es el path relativo dentro de /superadmin/
export const SECTION_PERMISSIONS: Record<string, Permission> = {
  '': 'dashboard:ver',
  'proyectos': 'proyectos:ver',
  'gestion-lotes': 'lotes:ver',
  'contratos': 'contratos:ver',
  'asesores': 'asesores:ver',
  'pos': 'pos:ver',
  'productos': 'productos:ver',
  'clientes': 'clientes:ver',
  'cursos': 'cursos:ver',
  'certificados': 'certificados:ver',
  'trading': 'trading:ver',
  'templates': 'templates:ver',
  'mails': 'mails:ver',
  'calendarios': 'calendarios:ver',
  'formularios': 'formularios:ver',
  'leads': 'leads:ver',
  'campanas': 'campanas:ver',
  'blog': 'blog:ver',
  'usuarios': 'equipo:ver',
  'postulantes': 'postulantes:ver',
  'utilidades': 'utilidades:ver',
  'configuracion': 'configuracion:ver',
  'api-nube': 'api-nube:ver',
  'analiticas': 'analiticas:ver',
  'ajustes/comercio': 'ajustes:ver',
  'ajustes/roles': 'roles:ver',
  'ajustes/empresas': 'empresas:ver',
  'perfil': 'perfil:ver',
  'dashboard': 'dashboard:ver',
}

// Colores y labels para cada rol
export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  superadmin: { label: 'Super Admin', color: 'text-white', bgColor: 'bg-blis-red' },
  admin: { label: 'Admin', color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30' },
  editor: { label: 'Editor', color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/30' },
  cliente: { label: 'Cliente', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30' },
  usuario: { label: 'Usuario', color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30' },
}

// Permisos adicionales por usuario (overrides)
export interface PermisosAdicionales {
  extra?: string[]
  denied?: string[]
}

// Calcula los permisos efectivos de un usuario combinando:
// 1. Permisos por defecto del rol
// 2. Permisos extra individuales (overrides que agregan acceso)
// 3. Permisos denegados individualmente (quitan acceso del rol)
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

// Verifica si un conjunto de permisos incluye un permiso específico
// Soporta el wildcard '*' (superadmin/admin tienen acceso total)
export function hasPermission(
  permissions: Set<string>,
  permission: string
): boolean {
  return permissions.has('*') || permissions.has(permission)
}

// Verifica si un usuario puede acceder a una sección del sidebar
export function canAccessSection(
  permissions: Set<string>,
  sectionPath: string
): boolean {
  const required = SECTION_PERMISSIONS[sectionPath]
  if (!required) return true // Si no hay permiso definido, permitir acceso
  return hasPermission(permissions, required)
}

// Determina la ruta de destino según el rol después del login
export function getDefaultRouteForRole(rol: string): string {
  const normalizedRol = (rol || 'usuario') as UserRole
  switch (normalizedRol) {
    case 'superadmin':
    case 'admin':
    case 'editor':
      return '/superadmin'
    case 'cliente':
    case 'usuario':
    default:
      return '/miembros'
  }
}

// Verifica si un rol tiene acceso al panel de administración
export function isAdminRole(rol: string): boolean {
  return ['superadmin', 'admin', 'editor'].includes(rol)
}