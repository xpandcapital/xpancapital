"use client"

import { Shield, ChevronDown, ArrowUp, ArrowDown, Edit2, Check, X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CustomRole } from '../_hooks'
import { ROLE_COLORS, SYSTEM_ROLES } from '../_types'
import type { PermissionsGridProps } from './PermissionsGrid'

interface RoleCardProps {
  role: CustomRole
  idx: number
  totalRoles: number
  isExpanded: boolean
  editingField: string | null
  editValue: string
  saving: string | null
  isSystem: boolean
  isWildcard: boolean
  permCount: number
  onSetEditValue: (v: string) => void
  onMove: (idx: number, dir: 'up' | 'down') => void
  onExpand: () => void
  onStartEdit: (field: string, value: string) => void
  onSaveField: (role: CustomRole, field: string) => void
  onCancelEdit: () => void
  onSetConfirmDeleteId: (id: string | null) => void
  onUpdateRole: (id: string, updates: Partial<CustomRole>) => Promise<boolean>
  children: React.ReactNode
}

export function RoleCard({
  role, idx, totalRoles, isExpanded, editingField, editValue, saving,
  isSystem, isWildcard, permCount,
  onSetEditValue, onMove, onExpand, onStartEdit, onSaveField, onCancelEdit,
  onSetConfirmDeleteId, onUpdateRole, children
}: RoleCardProps) {
  const roleId = role.id || ''
  const editingThisLabel = editingField === `${roleId}__label`
  const editingThisName = editingField === `${roleId}__nombre`
  const editingThisDesc = editingField === `${roleId}__descripcion`
  const editingThisColor = editingField === `${roleId}__color`

  return (
    <div className={`border-b border-white/5 last:border-b-0 ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={() => onMove(idx, 'up')} disabled={idx === 0 || !!saving} className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white disabled:opacity-20 transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
          <button onClick={() => onMove(idx, 'down')} disabled={idx === totalRoles - 1 || !!saving} className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white disabled:opacity-20 transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
        </div>

        <button onClick={onExpand} className="flex-1 flex items-center gap-4 text-left hover:bg-white/[0.02] -mx-2 px-2 py-1 rounded-lg transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${role.color || '#6b7280'}20`, borderColor: `${role.color || '#6b7280'}50`, borderWidth: 1 }}>
            <Shield className="w-5 h-5" style={{ color: role.color || '#6b7280' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {editingThisLabel ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input type="text" value={editValue} onChange={e => onSetEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSaveField(role, 'label'); if (e.key === 'Escape') onCancelEdit() }} className="bg-black/50 border border-blis-red/50 rounded px-2 py-0.5 text-white text-sm w-36 focus:outline-none" autoFocus />
                  <button onClick={() => onSaveField(role, 'label')} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={onCancelEdit} className="p-0.5 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <span className="text-sm font-bold text-white cursor-pointer hover:text-blis-red transition-colors" onClick={e => { e.stopPropagation(); onStartEdit(`${roleId}__label`, role.label) }}>{role.label || role.nombre}</span>
              )}
              {editingThisName ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input type="text" value={editValue} onChange={e => onSetEditValue(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))} onKeyDown={e => { if (e.key === 'Enter') onSaveField(role, 'nombre'); if (e.key === 'Escape') onCancelEdit() }} className="bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-[9px] text-gray-300 font-mono w-24 focus:outline-none focus:border-blis-red/50" autoFocus />
                  <button onClick={() => onSaveField(role, 'nombre')} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                  <button onClick={onCancelEdit} className="p-0.5 text-gray-500 hover:text-gray-300"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${!isSystem ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`} style={{ backgroundColor: `${role.color || '#6b7280'}15`, color: role.color || '#6b7280' }} onClick={e => { e.stopPropagation(); if (!isSystem) onStartEdit(`${roleId}__nombre`, role.nombre) }}>{role.nombre} {!isSystem && <Edit2 className="w-2 h-2 inline" />}</span>
              )}
              {isSystem && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-bold">sistema</span>}
            </div>
            <div className="flex items-center gap-2">
              {editingThisDesc ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input type="text" value={editValue} onChange={e => onSetEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSaveField(role, 'descripcion'); if (e.key === 'Escape') onCancelEdit() }} className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-gray-300 text-[11px] w-56 focus:outline-none focus:border-blis-red/50" placeholder="Sin descripción" autoFocus />
                  <button onClick={() => onSaveField(role, 'descripcion')} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={onCancelEdit} className="p-0.5 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <p className="text-gray-500 text-[11px] cursor-pointer hover:text-gray-300 transition-colors" onClick={e => { e.stopPropagation(); onStartEdit(`${roleId}__descripcion`, role.descripcion || '') }}>
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
                <button key={c} onClick={() => { onUpdateRole(role.id!, { color: c }); onCancelEdit() }} className={`w-5 h-5 rounded-md border ${role.color === c ? 'border-white ring-1 ring-white/30' : 'border-white/10'}`} style={{ backgroundColor: c }} />
              ))}
              <button onClick={onCancelEdit} className="p-0.5 text-gray-500"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <button onClick={() => onStartEdit(`${roleId}__color`, role.color)} className="w-6 h-6 rounded-lg border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: role.color || '#6b7280' }} title="Cambiar color" />
          )}
          <button
            onClick={() => isSystem ? null : onSetConfirmDeleteId(roleId)}
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
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
