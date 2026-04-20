"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, Save, X, Trash2, Plus } from 'lucide-react'
import { CustomRole, useRoles } from './_components/useRoles'
import { PERMISSIONS } from '@/lib/auth/permissions'

const ROLE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#6b7280']
const SYSTEM_ROLES = ['superadmin', 'admin', 'editor', 'cliente', 'usuario']

const PERMISSION_GROUPS: Record<string, string[]> = {
  'Dashboard': ['dashboard:ver'],
  'Proyectos': ['proyectos:ver', 'proyectos:crear', 'proyectos:editar', 'proyectos:eliminar'],
  'Lotes': ['lotes:ver', 'lotes:editar'],
  'Contratos': ['contratos:ver', 'contratos:crear', 'contratos:editar'],
  'Asesores': ['asesores:ver', 'asesores:crear', 'asesores:editar'],
  'POS': ['pos:ver'],
  'Productos': ['productos:ver', 'productos:crear', 'productos:editar', 'productos:eliminar'],
  'Clientes': ['clientes:ver', 'clientes:editar'],
  'Cursos': ['cursos:ver', 'cursos:crear', 'cursos:editar', 'cursos:eliminar'],
  'Certificados': ['certificados:ver', 'certificados:crear'],
  'Trading': ['trading:ver'],
  'Páginas': ['templates:ver', 'templates:editar'],
  'Correos': ['mails:ver', 'mails:enviar'],
  'Calendarios': ['calendarios:ver', 'calendarios:editar'],
  'Leads': ['leads:ver', 'leads:editar'],
  'Campañas': ['campanas:ver', 'campanas:crear'],
  'Blog': ['blog:ver', 'blog:crear', 'blog:editar', 'blog:eliminar'],
  'Equipo': ['equipo:ver', 'equipo:crear', 'equipo:editar'],
  'Configuración': ['configuracion:ver', 'configuracion:editar'],
  'Ajustes': ['ajustes:ver', 'ajustes:editar'],
  'Roles': ['roles:ver', 'roles:editar'],
  'Empresas': ['empresas:ver', 'empresas:editar'],
}

export default function RolesPage() {
  const { roles, loading, saving, createRole, updateRole, deleteRole } = useRoles()
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [editPermisos, setEditPermisos] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newRole, setNewRole] = useState({ nombre: '', label: '', descripcion: '', color: '#6b7280' })

  const handleTogglePermiso = (permiso: string) => {
    setEditPermisos(prev => prev.includes(permiso) ? prev.filter(p => p !== permiso) : [...prev, permiso])
  }

  const handleExpand = (roleName: string, permisos: string[]) => {
    if (expandedRole === roleName) {
      setExpandedRole(null)
    } else {
      setExpandedRole(roleName)
      setEditPermisos(permisos.includes('*') ? Object.keys(PERMISSIONS) : [...permisos])
    }
  }

  const handleSave = async (role: CustomRole) => {
    if (role.id) {
      await updateRole(role.id, { permisos: editPermisos })
    } else {
      await createRole({ nombre: role.nombre, permisos: editPermisos })
    }
    setExpandedRole(null)
  }

  const handleCreate = async () => {
    if (!newRole.nombre) return
    const ok = await createRole({
      nombre: newRole.nombre.toLowerCase().replace(/\s+/g, '_'),
      label: newRole.label || newRole.nombre,
      descripcion: newRole.descripcion,
      color: newRole.color,
      permisos: [],
    })
    if (ok) {
      setShowCreate(false)
      setNewRole({ nombre: '', label: '', descripcion: '', color: '#6b7280' })
    }
  }

  const handleDelete = async (role: CustomRole) => {
    if (!role.id) return
    if (!window.confirm(`¿Eliminar el rol "${role.label}"? Los usuarios con este rol quedarán sin permisos.`)) return
    await deleteRole(role.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Roles de Usuario</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Gestiona los roles del sistema y sus permisos. Puedes crear roles personalizados.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full sm:w-auto bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Plus className="w-4 h-4" />Nuevo Rol
        </button>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-6 h-6 text-blis-red" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">Roles del Sistema</h2>
            <p className="text-gray-500 text-sm">{roles.length} roles configurados</p>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {roles.map(role => {
            const isSystem = SYSTEM_ROLES.includes(role.nombre)
            const isWildcard = role.permisos?.includes('*')
            const permCount = isWildcard ? Object.keys(PERMISSIONS).length : (role.permisos?.length || 0)
            const isExpanded = expandedRole === role.nombre

            return (
              <div key={role.nombre} className="border-b border-white/5 last:border-b-0">
                <button onClick={() => handleExpand(role.nombre, role.permisos || [])} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${role.color || '#6b7280'}20`, borderColor: `${role.color || '#6b7280'}50`, borderWidth: 1 }}>
                      <Shield className="w-5 h-5" style={{ color: role.color || '#6b7280' }} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{role.label || role.nombre}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ backgroundColor: `${role.color || '#6b7280'}15`, color: role.color || '#6b7280' }}>{role.nombre}</span>
                        {isSystem && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-bold">sistema</span>}
                      </div>
                      <p className="text-gray-500 text-xs">{isWildcard ? 'Acceso total' : `${permCount} permisos`}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Permisos de <span className="text-white">{role.label || role.nombre}</span></p>
                          <div className="flex gap-2">
                            <button onClick={() => setExpandedRole(null)} className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-1">
                              <X className="w-3 h-3" />Cancelar
                            </button>
                            {!isWildcard && (
                              <button onClick={() => handleSave(role)} disabled={saving} className="px-3 py-1.5 bg-blis-red rounded-lg text-white text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-1 disabled:opacity-50">
                                <Save className="w-3 h-3" />{saving ? '...' : 'Guardar'}
                              </button>
                            )}
                          </div>
                        </div>

                        {role.descripcion && (
                          <p className="text-gray-400 text-xs mb-3 italic">{role.descripcion}</p>
                        )}

                        {isWildcard ? (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <p className="text-emerald-400 font-bold text-sm">Acceso Total</p>
                            <p className="text-emerald-400/60 text-[11px]">Este rol tiene acceso a todas las secciones del sistema</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.entries(PERMISSION_GROUPS).map(([group, permKeys]) => {
                              const groupChecked = permKeys.filter(p => editPermisos.includes(p))
                              if (groupChecked.length === 0 && permKeys.length > 2) return null
                              return (
                                <div key={group}>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">{group}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {permKeys.map(key => (
                                      <button
                                        key={key}
                                        onClick={() => handleTogglePermiso(key)}
                                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${editPermisos.includes(key) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:border-white/20'}`}
                                      >
                                        {PERMISSIONS[key as keyof typeof PERMISSIONS] || key}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                            <div className="pt-2 border-t border-white/5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Todos los permisos</p>
                              <div className="flex items-center gap-3">
                                <button onClick={() => setEditPermisos(Object.keys(PERMISSIONS))} className="text-[10px] px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors">Seleccionar todos</button>
                                <button onClick={() => setEditPermisos([])} className="text-[10px] px-3 py-1 rounded-lg bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors">Limpiar</button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!isSystem && role.id && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <button onClick={() => handleDelete(role)} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />Eliminar Rol
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-wide">Nuevo Rol</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Rol *</label>
                  <input type="text" value={newRole.nombre} onChange={e => setNewRole(prev => ({ ...prev, nombre: e.target.value, label: prev.label || e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" placeholder="ej: supervisor" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Etiqueta (visible)</label>
                  <input type="text" value={newRole.label} onChange={e => setNewRole(prev => ({ ...prev, label: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" placeholder="Supervisor" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea value={newRole.descripcion} onChange={e => setNewRole(prev => ({ ...prev, descripcion: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 resize-none" rows={2} placeholder="Rol con acceso limitado a ventas y reportes" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {ROLE_COLORS.map(color => (
                      <button key={color} onClick={() => setNewRole(prev => ({ ...prev, color }))} className={`w-10 h-10 rounded-xl border-2 transition-all ${newRole.color === color ? 'border-white scale-110' : 'border-transparent hover:border-white/30'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <button onClick={handleCreate} disabled={saving || !newRole.nombre} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
                  {saving ? 'Creando...' : 'Crear Rol'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}