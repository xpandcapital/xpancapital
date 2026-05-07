import { Eye, PlusCircle, Pencil, Trash } from 'lucide-react'
import { buildPermission } from '@/lib/auth/permissions'

export type ActionDef = { action: string; label: string }

export type PermItem = {
  key: string
  label: string
  actions: ActionDef[]
  subItems?: PermItem[]
}

export type PermGroup = {
  title: string
  items: PermItem[]
}

export const ROLE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#6b7280']
export const SYSTEM_ROLES = ['superadmin', 'admin', 'editor', 'cliente', 'usuario']

export const V: ActionDef = { action: 'ver', label: 'Ver' }
export const C: ActionDef = { action: 'crear', label: 'Crear' }
export const E: ActionDef = { action: 'editar', label: 'Editar' }
export const D: ActionDef = { action: 'eliminar', label: 'Eliminar' }
export const VE = [V, E]
export const VCE = [V, C, E]
export const VCED = [V, C, E, D]

export const ACTION_COLORS: Record<string, { active: string; border: string; inactive: string }> = {
  ver: { active: 'bg-blue-500/20', border: 'border-blue-500/40', inactive: 'text-blue-400' },
  crear: { active: 'bg-emerald-500/20', border: 'border-emerald-500/40', inactive: 'text-emerald-400' },
  editar: { active: 'bg-amber-500/20', border: 'border-amber-500/40', inactive: 'text-amber-400' },
  eliminar: { active: 'bg-red-500/20', border: 'border-red-500/40', inactive: 'text-red-400' },
}

export const ACTION_ICONS: Record<string, React.FC<{ className?: string }>> = {
  ver: Eye,
  crear: PlusCircle,
  editar: Pencil,
  eliminar: Trash,
}

export function getAllItemPerms(item: PermItem): string[] {
  const own = item.actions.map(a => buildPermission(item.key, a.action))
  const subs = item.subItems ? item.subItems.flatMap(sub => getAllItemPerms(sub)) : []
  return [...own, ...subs]
}

export const PERMISSION_TREE: PermGroup[] = [
  {
    title: 'Principal',
    items: [
      { key: 'dashboard', label: 'Dashboard', actions: [V] },
      {
        key: 'proyectos', label: 'Proyectos', actions: VCED,
        subItems: [
          { key: 'proyectos', label: 'Todos los Proyectos', actions: VCED },
          { key: 'lotes', label: 'Gestión de Lotes', actions: VE },
          { key: 'contratos', label: 'Contratos', actions: VCE },
          { key: 'asesores', label: 'Asesores', actions: VCE },
        ]
      },
    ]
  },
  {
    title: 'Ventas',
    items: [
      {
        key: 'pos', label: 'Punto de Venta', actions: VCED,
        subItems: [
          { key: 'pos', label: 'Terminal POS', actions: VCED },
          { key: 'productos', label: 'Productos', actions: VCED },
          { key: 'clientes', label: 'Clientes', actions: VCE },
          { key: 'ajustes', label: 'Ajustes del Comercio', actions: VCED },
        ]
      },
      {
        key: 'cursos', label: 'Academia', actions: VCED,
        subItems: [
          { key: 'cursos', label: 'Cursos', actions: VCED },
          { key: 'capacitaciones', label: 'Capacitaciones', actions: VCED },
          { key: 'certificados', label: 'Certificados', actions: VCED },
        ]
      },
      { key: 'trading', label: 'Trading', actions: [V] },
    ]
  },
  {
    title: 'Contenido',
    items: [
      {
        key: 'templates', label: 'Páginas', actions: VCED,
        subItems: [
          { key: 'templates', label: 'Todas las Páginas', actions: VCED },
        ]
      },
      {
        key: 'mails', label: 'Comunicación', actions: VCED,
        subItems: [
          { key: 'mails', label: 'Correos', actions: VCED },
          { key: 'calendarios', label: 'Calendarios', actions: VCED },
          { key: 'formularios', label: 'Formularios', actions: VCED },
          { key: 'leads', label: 'Leads', actions: VCED },
          { key: 'campanas', label: 'Campañas', actions: VCED },
        ]
      },
      {
        key: 'blog', label: 'Blog', actions: VCED,
        subItems: [
          { key: 'blog', label: 'Entradas', actions: VCED },
          { key: 'blog', label: 'Rutas', actions: VCED },
        ]
      },
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        key: 'equipo', label: 'Personal', actions: VCED,
        subItems: [
          { key: 'equipo', label: 'Equipo', actions: VCED },
          { key: 'postulantes', label: 'Postulantes', actions: VCED },
          { key: 'puestos', label: 'Puestos', actions: VCED },
          { key: 'preguntas', label: 'Preguntas', actions: VCED },
        ]
      },
      { key: 'utilidades', label: 'Utilidades', actions: VCED },
      {
        key: 'configuracion', label: 'Configuración', actions: VCED,
        subItems: [
          { key: 'configuracion', label: 'Sitio y Branding', actions: VCED },
          { key: 'api-nube', label: 'APIs y Nube', actions: VCED },
          { key: 'analiticas', label: 'Métricas y SEO', actions: VCED },
          { key: 'ajustes', label: 'Comercio', actions: VCED },
          { key: 'roles', label: 'Roles y Niveles', actions: VCED },
          { key: 'empresas', label: 'Empresas', actions: VCED },
        ]
      },
      { key: 'perfil', label: 'Mi Perfil', actions: VE },
    ]
  },
  {
    title: 'Panel Cliente',
    items: [
      { key: 'miembros', label: 'Miembros', actions: [V] },
      { key: 'facturacion', label: 'Facturación', actions: [V] },
    ]
  },
]
