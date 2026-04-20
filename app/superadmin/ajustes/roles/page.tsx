"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, Save, X, Trash2, Plus, ArrowUp, ArrowDown, Edit2, Check, Copy, ClipboardPaste } from 'lucide-react'
import { CustomRole, useRoles } from './_components/useRoles'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { useToast } from '@/components/ui/Toast'

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
  const { showToast } = useToast()
  const { roles, loading, saving, createRole, updateRole, reorderRoles, deleteRole } = useRoles()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editPermisos, setEditPermisos] = useState<string[]>([])
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<string[] | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newRole, setNewRole] = useState({ nombre: '', label: '', descripcion: '', color: '#6b7280' })

  const startEdit = (roleId: string, field: string, value: string) => {
    setEditingField(`${roleId}__${field}`)
    setEditValue(value)
  }

  const saveField = async (role: CustomRole, field: string) => {
    if (!role.id) return
    const result = await updateRole(role.id, { [field]: editValue })
    if (result) setEditingField(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleExpand = (roleId: string, permisos: string[]) => {
    if (expandedId === roleId) {
      setExpandedId(null)
    } else {
      setExpandedId(roleId)
      setEditPermisos(permisos.includes('*') ? Object.keys(PERMISSIONS) : [...permisos])
    }
  }

  const handleSavePermisos = async (role: CustomRole) => {
    if (role.id) await updateRole(role.id, { permisos: editPermisos })
    setExpandedId(null)
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

  const moveRole = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= roles.length) return
    const reordered = [...roles]
    const temp = reordered[newIndex]
    reordered[newIndex] = reordered[index]
    reordered[index] = temp
    await reorderRoles(reordered)
  }

  const handleDelete = async (role: CustomRole) => {
    if (!role.id) return
    await deleteRole(role.id)
    setConfirmDeleteId(null)
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
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Gestiona roles, permisos y orden de visualización.</p>
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
          {roles.map((role, idx) => {
            const isSystem = SYSTEM_ROLES.includes(role.nombre)
            const isWildcard = role.permisos?.includes('*')
            const permCount = isWildcard ? Object.keys(PERMISSIONS).length : (role.permisos?.length || 0)
            const isExpanded = expandedId === role.id
            const roleId = role.id || ''
            const editingThisLabel = editingField === `${roleId}__label`
            const editingThisName = editingField === `${roleId}__nombre`
            const editingThisDesc = editingField === `${roleId}__descripcion`
            const editingThisColor = editingField === `${roleId}__color`

            return (
              <div key={roleId || role.nombre} className={`border-b border-white/5 last:border-b-0 ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
                <div className="flex items-center gap-3 p-4">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => moveRole(idx, 'up')} disabled={idx === 0 || !!saving} className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white disabled:opacity-20 transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveRole(idx, 'down')} disabled={idx === roles.length - 1 || !!saving} className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white disabled:opacity-20 transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>

                  <button onClick={() => handleExpand(roleId, role.permisos || [])} className="flex-1 flex items-center gap-4 text-left hover:bg-white/[0.02] -mx-2 px-2 py-1 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${role.color || '#6b7280'}20`, borderColor: `${role.color || '#6b7280'}50`, borderWidth: 1 }}>
                      <Shield className="w-5 h-5" style={{ color: role.color || '#6b7280' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {editingThisLabel ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveField(role, 'label'); if (e.key === 'Escape') cancelEdit() }} className="bg-black/50 border border-blis-red/50 rounded px-2 py-0.5 text-white text-sm w-36 focus:outline-none" autoFocus />
                            <button onClick={() => saveField(role, 'label')} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={cancelEdit} className="p-0.5 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-white cursor-pointer hover:text-blis-red transition-colors" onClick={e => { e.stopPropagation(); startEdit(roleId, 'label', role.label) }}>{role.label || role.nombre}</span>
                        )}
                        {editingThisName ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input type="text" value={editValue} onChange={e => setEditValue(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))} onKeyDown={e => { if (e.key === 'Enter') saveField(role, 'nombre'); if (e.key === 'Escape') cancelEdit() }} className="bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-[9px] text-gray-300 font-mono w-24 focus:outline-none focus:border-blis-red/50" autoFocus />
                            <button onClick={() => saveField(role, 'nombre')} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                            <button onClick={cancelEdit} className="p-0.5 text-gray-500 hover:text-gray-300"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${!isSystem ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`} style={{ backgroundColor: `${role.color || '#6b7280'}15`, color: role.color || '#6b7280' }} onClick={e => { e.stopPropagation(); if (!isSystem) startEdit(roleId, 'nombre', role.nombre) }}>{role.nombre} {!isSystem && <Edit2 className="w-2 h-2 inline" />}</span>
                        )}
                        {isSystem && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-bold">sistema</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingThisDesc ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveField(role, 'descripcion'); if (e.key === 'Escape') cancelEdit() }} className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-gray-300 text-[11px] w-56 focus:outline-none focus:border-blis-red/50" placeholder="Sin descripción" autoFocus />
                            <button onClick={() => saveField(role, 'descripcion')} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={cancelEdit} className="p-0.5 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-[11px] cursor-pointer hover:text-gray-300 transition-colors" onClick={e => { e.stopPropagation(); startEdit(roleId, 'descripcion', role.descripcion || '') }}>
                            {role.descripcion || 'Sin descripción'} <Edit2 className="w-2.5 h-2.5 inline" />
                          </p>
                        )}
                        <span className="text-gray-600 text-[10px]">· {isWildcard ? 'Acceso total' : `${permCount} permisos`}</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {editingThisColor ? (
                      <div className="flex items-center gap-1">
                        {ROLE_COLORS.map(c => (
                          <button key={c} onClick={() => { updateRole(role.id!, { color: c }); setEditingField(null) }} className={`w-5 h-5 rounded-md border ${role.color === c ? 'border-white ring-1 ring-white/30' : 'border-white/10'}`} style={{ backgroundColor: c }} />
                        ))}
                        <button onClick={cancelEdit} className="p-0.5 text-gray-500"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(roleId, 'color', role.color)} className="w-6 h-6 rounded-lg border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: role.color || '#6b7280' }} title="Cambiar color" />
                    )}
                    <button
                      onClick={() => isSystem ? null : setConfirmDeleteId(roleId)}
                      disabled={isSystem}
                      className={`p-1.5 rounded-lg transition-colors ${isSystem ? 'text-gray-700 cursor-not-allowed' : 'hover:bg-red-500/10 text-gray-500 hover:text-red-400'}`}
                      title={isSystem ? 'Los roles del sistema no se pueden eliminar' : 'Eliminar rol'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Permisos de <span className="text-white">{role.label || role.nombre}</span></p>
                          <div className="flex gap-2">
                            <button onClick={() => { setClipboard([...editPermisos]); showToast(`Permisos copiados (${editPermisos.length})`, 'success') }} className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-1" title="Copiar permisos de este rol">
                              <Copy className="w-3 h-3" />Copiar
                            </button>
                            {clipboard !== null && (
                              <button onClick={() => { setEditPermisos([...clipboard]); showToast(`${clipboard.length} permisos pegados`, 'success') }} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors flex items-center gap-1" title="Pegar permisos copiados">
                                <ClipboardPaste className="w-3 h-3" />Pegar ({clipboard.length})
                              </button>
                            )}
                            {!isWildcard && (
                              <button onClick={() => handleSavePermisos(role)} disabled={!!saving} className="px-3 py-1.5 bg-blis-red rounded-lg text-white text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-1 disabled:opacity-50">
                                <Save className="w-3 h-3" />{saving ? '...' : 'Guardar'}
                              </button>
                            )}
                            <button onClick={() => setExpandedId(null)} className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-1">
                              <X className="w-3 h-3" />Cerrar
                            </button>
                          </div>
                        </div>

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
                                  <div className="flex items-center gap-2 mb-2">
                                    <button
                                      onClick={() => {
                                        const allSelected = permKeys.every(p => editPermisos.includes(p))
                                        if (allSelected) {
                                          setEditPermisos(prev => prev.filter(p => !permKeys.includes(p)))
                                        } else {
                                          setEditPermisos(prev => [...new Set([...prev, ...permKeys])])
                                        }
                                      }}
                                      className={`w-4 h-4 rounded border flex items-center justify-center text-[8px] ${permKeys.every(p => editPermisos.includes(p)) ? 'bg-blis-red border-blis-red text-white' : 'border-white/20 bg-transparent'}`}
                                    >
                                      {permKeys.every(p => editPermisos.includes(p)) && '✓'}
                                    </button>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{group}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 ml-6">
                                    {permKeys.map(key => (
                                      <button
                                        key={key}
                                        onClick={() => setEditPermisos(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])}
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
                              <div className="flex items-center gap-3">
                                <button onClick={() => setEditPermisos(Object.keys(PERMISSIONS))} className="text-[10px] px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors">Seleccionar todos</button>
                                <button onClick={() => setEditPermisos([])} className="text-[10px] px-3 py-1 rounded-lg bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors">Limpiar</button>
                              </div>
                            </div>
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
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Rol (identificador) *</label>
                  <input type="text" value={newRole.nombre} onChange={e => setNewRole(prev => ({ ...prev, nombre: e.target.value, label: prev.label || e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 font-mono text-sm" placeholder="supervisor" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Etiqueta (nombre visible)</label>
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
                <button onClick={handleCreate} disabled={saving === 'create' || !newRole.nombre} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
                  {saving === 'create' ? 'Creando...' : 'Crear Rol'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {confirmDeleteId && (() => {
        const roleToDelete = roles.find(r => r.id === confirmDeleteId)
        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-2">¿Eliminar rol?</h3>
              <p className="text-gray-400 text-sm mb-4">Se eliminará el rol <span className="text-white font-bold">{roleToDelete?.label || roleToDelete?.nombre}</span>. Los usuarios asignados a este rol quedarán sin permisos.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-white/5 rounded-xl text-gray-300 text-sm font-bold hover:bg-white/10 transition-colors">Cancelar</button>
                <button onClick={() => roleToDelete && handleDelete(roleToDelete)} disabled={saving === 'delete'} className="px-4 py-2 bg-red-500 rounded-xl text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">{saving === 'delete' ? 'Eliminando...' : 'Eliminar'}</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}