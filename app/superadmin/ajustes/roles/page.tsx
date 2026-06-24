"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Plus } from 'lucide-react'
import { useRoles } from './_hooks'
import type { CustomRole } from './_hooks'
import { RoleCard } from './_components/RoleCard'
import { RoleForm } from './_components/RoleForm'
import { PermissionsGrid } from './_components/PermissionsGrid'
import { PERMISSIONS, buildPermission } from '@/lib/auth/permissions'
import { SYSTEM_ROLES, getAllItemPerms } from './_types'
import type { PermGroup, PermItem } from './_types'
import { useToast } from '@/components/ui/Toast'

const emptyRole = { nombre: '', label: '', descripcion: '', color: '#6b7280' }

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
  const [newRole, setNewRole] = useState(emptyRole)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const startEdit = (field: string, value: string) => { setEditingField(field); setEditValue(value) }
  const cancelEdit = () => { setEditingField(null); setEditValue('') }
  const saveField = async (role: CustomRole, field: string) => {
    if (!role.id) return
    if (await updateRole(role.id, { [field]: editValue || undefined })) setEditingField(null)
    setEditValue('')
  }
  const handleExpand = (roleId: string, permisos: string[], roleName: string) => {
    if (expandedId === roleId) { setExpandedId(null); return }
    setExpandedId(roleId)
    const allPerms = Object.keys(PERMISSIONS)
    // Para admin y superadmin: precargar todos los permisos chequeados (pero sin wildcard, permite desmarcar individuales)
    if ((roleName === 'admin' || roleName === 'superadmin') && !permisos.includes('*')) {
      setEditPermisos(allPerms)
    } else {
      setEditPermisos(permisos.includes('*') ? allPerms : [...permisos])
    }
    setExpandedGroups({ Principal: true, Ventas: true, Contenido: true, Sistema: true, 'Panel Cliente': true })
  }
  const togglePerm = (key: string, action: string) => {
    const perm = buildPermission(key, action)
    setEditPermisos(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm])
  }
  const toggleGroupAll = (group: PermGroup) => {
    const allPerms = group.items.flatMap(item => item.actions.map(a => buildPermission(item.key, a.action)))
    setEditPermisos(prev => allPerms.every(p => prev.includes(p)) ? prev.filter(p => !allPerms.includes(p)) : [...new Set([...prev, ...allPerms])])
  }
  const toggleItemAll = (item: PermItem) => {
    const allPerms = getAllItemPerms(item)
    setEditPermisos(prev => allPerms.every(p => prev.includes(p)) ? prev.filter(p => !allPerms.includes(p)) : [...new Set([...prev, ...allPerms])])
  }
  const handleSavePermisos = async (role: CustomRole) => { if (role.id) await updateRole(role.id, { permisos: editPermisos }); setExpandedId(null) }
  const handleCreate = async () => {
    if (!newRole.nombre) return
    const ok = await createRole({ nombre: newRole.nombre.toLowerCase().replace(/\s+/g, '_'), label: newRole.label || newRole.nombre, descripcion: newRole.descripcion, color: newRole.color, permisos: [] })
    if (ok) { setShowCreate(false); setNewRole(emptyRole) }
  }
  const moveRole = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= roles.length) return
    const reordered = [...roles];
    [reordered[newIndex], reordered[index]] = [reordered[index], reordered[newIndex]]
    await reorderRoles(reordered)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Roles de Usuario</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Gestiona roles, permisos y orden de visualización.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full sm:w-auto bg-blis-red text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Plus className="w-4 h-4" />Nuevo Rol
        </button>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10"><Shield className="w-6 h-6 text-blis-red" /></div>
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
            return (
              <RoleCard
                key={role.id || role.nombre} role={role} idx={idx} totalRoles={roles.length}
                isExpanded={expandedId === role.id} editingField={editingField} editValue={editValue}
                saving={saving} isSystem={isSystem} isWildcard={isWildcard} permCount={permCount}
                onSetEditValue={setEditValue} onMove={moveRole}
                onExpand={() => handleExpand(role.id || '', role.permisos || [], role.nombre)}
                onStartEdit={startEdit} onSaveField={saveField} onCancelEdit={cancelEdit}
                onSetConfirmDeleteId={setConfirmDeleteId} onUpdateRole={updateRole}
              >
                <PermissionsGrid
                  role={role} editPermisos={editPermisos} expandedGroups={expandedGroups}
                  clipboard={clipboard} saving={saving} onSetExpandedId={setExpandedId}
                  onSetEditPermisos={setEditPermisos} onSetExpandedGroups={setExpandedGroups}
                  onSetClipboard={setClipboard} onTogglePerm={togglePerm}
                  onToggleGroupAll={toggleGroupAll} onToggleItemAll={toggleItemAll}
                  onSavePermisos={handleSavePermisos} onShowToast={showToast} onUpdateRole={updateRole}
                />
              </RoleCard>
            )
          })}
        </div>
      </div>

      <RoleForm show={showCreate} newRole={newRole} saving={saving} onClose={() => setShowCreate(false)} onChange={setNewRole} onCreate={handleCreate} />

      <AnimatePresence>
        {confirmDeleteId && (() => {
          const rt = roles.find(r => r.id === confirmDeleteId)
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-2">Eliminar rol?</h3>
                <p className="text-gray-400 text-sm mb-4">Se eliminará el rol <span className="text-white font-bold">{rt?.label || rt?.nombre}</span>. Los usuarios asignados a este rol quedarán sin permisos.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-white/5 rounded-xl text-gray-300 text-sm font-bold hover:bg-white/10 transition-colors">Cancelar</button>
                  <button onClick={() => rt && (deleteRole(rt.id!), setConfirmDeleteId(null))} disabled={saving === 'delete'} className="px-4 py-2 bg-red-500 rounded-xl text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">{saving === 'delete' ? 'Eliminando...' : 'Eliminar'}</button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
