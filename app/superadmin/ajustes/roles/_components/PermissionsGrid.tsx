"use client"

import { useState } from 'react'
import { Home, Save, X, Copy, ClipboardPaste, ChevronDown } from 'lucide-react'
import { PERMISSIONS, AVAILABLE_ROUTES, ROLE_CONFIG, buildPermission } from '@/lib/auth/permissions'
import { getAllItemPerms, PERMISSION_TREE, ACTION_COLORS, ACTION_ICONS } from '../_types'
import type { CustomRole } from '../_hooks'
import type { PermGroup, PermItem } from '../_types'

export interface PermissionsGridProps {
  role: CustomRole
  editPermisos: string[]
  expandedGroups: Record<string, boolean>
  clipboard: string[] | null
  saving: string | null
  onSetExpandedId: (id: string | null) => void
  onSetEditPermisos: (p: string[]) => void
  onSetExpandedGroups: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  onSetClipboard: (p: string[] | null) => void
  onTogglePerm: (key: string, action: string) => void
  onToggleGroupAll: (group: PermGroup) => void
  onToggleItemAll: (item: PermItem) => void
  onSavePermisos: (role: CustomRole) => void
  onShowToast: (msg: string, type: 'success' | 'error') => void
  onUpdateRole: (id: string, updates: Partial<CustomRole>) => Promise<boolean>
}

export function PermissionsGrid({
  role,
  editPermisos,
  expandedGroups,
  clipboard,
  saving,
  onSetExpandedId,
  onSetEditPermisos,
  onSetExpandedGroups,
  onSetClipboard,
  onTogglePerm,
  onToggleGroupAll,
  onToggleItemAll,
  onSavePermisos,
  onShowToast,
  onUpdateRole,
}: PermissionsGridProps) {
  const isWildcard = role.permisos?.includes('*')
  const isAdminOrSuperadmin = role.nombre === 'admin' || role.nombre === 'superadmin'
  // Admin y superadmin siempre muestran el árbol (con todo chequeado), no el banner "Acceso Total"
  const showWildcardBanner = isWildcard && !isAdminOrSuperadmin

  const getAvailableRoutesForRole = (r: CustomRole) => {
    const isWc = r.permisos?.includes('*')
    if (isWc) return AVAILABLE_ROUTES
    return AVAILABLE_ROUTES.filter(route => {
      if (route.section === 'dashboard') return true
      if (r.permisos?.some(p => p.startsWith(route.section + ':'))) return true
      return false
    })
  }

  return (
    <div className="px-4 pb-6 pt-2 border-t border-white/5">
      <div className="mb-5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-3.5 h-3.5 text-blis-red" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Página de inicio al iniciar sesión</p>
        </div>
        <select
          value={role.ruta_inicio || ''}
          onChange={async (e) => {
            const val = e.target.value || null
            await onUpdateRole(role.id!, { ruta_inicio: val })
          }}
          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blis-red/50 appearance-none cursor-pointer"
        >
          <option value="">Default del rol ({ROLE_CONFIG[role.nombre as keyof typeof ROLE_CONFIG]?.defaultRoute || '/superadmin'})</option>
          {getAvailableRoutesForRole(role).map(route => (
            <option key={route.path} value={route.path}>{route.label} ({route.path})</option>
          ))}
        </select>
        <p className="text-[9px] text-gray-600 mt-1.5">Al iniciar sesión, este rol será redirigido a esta página.</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Permisos de <span className="text-white">{role.label || role.nombre}</span></p>
        <div className="flex gap-2">
          <button onClick={() => { onSetClipboard([...editPermisos]); onShowToast(`Permisos copiados (${editPermisos.length})`, 'success') }} className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-1" title="Copiar permisos">
            <Copy className="w-3 h-3" />Copiar
          </button>
          {clipboard !== null && (
            <button onClick={() => { onSetEditPermisos([...clipboard]); onShowToast(`${clipboard.length} permisos pegados`, 'success') }} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors flex items-center gap-1" title="Pegar permisos copiados">
              <ClipboardPaste className="w-3 h-3" />Pegar ({clipboard.length})
            </button>
          )}
          {!showWildcardBanner && (
            <button onClick={() => onSavePermisos(role)} disabled={!!saving} className="px-3 py-1.5 bg-blis-red rounded-lg text-white text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-1 disabled:opacity-50">
              <Save className="w-3 h-3" />{saving ? '...' : 'Guardar'}
            </button>
          )}
          <button onClick={() => onSetExpandedId(null)} className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-1">
            <X className="w-3 h-3" />Cerrar
          </button>
        </div>
      </div>

      {showWildcardBanner ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-emerald-400 font-bold text-sm">Acceso Total</p>
          <p className="text-emerald-400/60 text-[11px]">Este rol tiene acceso a todas las secciones del sistema</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <button onClick={() => onSetEditPermisos(Object.keys(PERMISSIONS))} className="text-[10px] px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors">Seleccionar todos</button>
            <button onClick={() => onSetEditPermisos([])} className="text-[10px] px-3 py-1 rounded-lg bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors">Limpiar</button>
          </div>

          {PERMISSION_TREE.map(group => {
            const groupOpen = expandedGroups[group.title] !== false
            const allGroupPerms = group.items.flatMap(item => getAllItemPerms(item))
            const groupSelectedCount = allGroupPerms.filter(p => editPermisos.includes(p)).length

            return (
              <div key={group.title} className="rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => onSetExpandedGroups(prev => ({ ...prev, [group.title]: !prev[group.title] }))}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform shrink-0 ${groupOpen ? '' : '-rotate-90'}`} />
                  <span className="text-[10px] text-gray-300 uppercase tracking-[0.15em] font-black flex-1 text-left">{group.title}</span>
                  <span className="text-[9px] text-gray-600 font-bold">{groupSelectedCount}/{allGroupPerms.length}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleGroupAll(group) }}
                    className={`text-[9px] px-2 py-0.5 rounded-md border transition-all ${allGroupPerms.every(p => editPermisos.includes(p)) ? 'bg-blis-red/10 border-blis-red/30 text-blis-red' : 'border-white/10 text-gray-600 hover:text-gray-400'}`}
                  >
                    {allGroupPerms.every(p => editPermisos.includes(p)) ? '✓' : 'Todo'}
                  </button>
                </button>

                {groupOpen && (
                  <div className="divide-y divide-white/[0.03]">
                    {group.items.map(item => {
                      const hasSubItems = item.subItems && item.subItems.length > 0
                      const itemAllPerms = getAllItemPerms(item)
                      const itemOwnPerms = item.actions.map(a => buildPermission(item.key, a.action))
                      const itemSelectedCount = itemAllPerms.filter(p => editPermisos.includes(p)).length
                      const ownSelectedCount = itemOwnPerms.filter(p => editPermisos.includes(p)).length

                      return (
                        <div key={item.label} className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              onClick={() => onToggleItemAll(item)}
                              className={`w-4 h-4 rounded border flex items-center justify-center text-[8px] shrink-0 ${itemAllPerms.every(p => editPermisos.includes(p)) ? 'bg-blis-red border-blis-red text-white' : itemSelectedCount > 0 ? 'bg-blis-red/20 border-blis-red/40 text-blis-red' : 'border-white/15 bg-transparent'}`}
                            >
                              {itemAllPerms.every(p => editPermisos.includes(p)) ? '✓' : itemSelectedCount > 0 ? '−' : ''}
                            </button>
                            <span className="text-xs text-white font-bold truncate">{item.label}</span>
                            <span className="text-[9px] text-gray-600 shrink-0">{itemSelectedCount}/{itemAllPerms.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 ml-6">
                            {item.actions.map(actionDef => {
                              const perm = buildPermission(item.key, actionDef.action)
                              const isActive = editPermisos.includes(perm)
                              const colors = ACTION_COLORS[actionDef.action] || ACTION_COLORS.ver
                              const IconComp = ACTION_ICONS[actionDef.action]
                              return (
                                <button
                                  key={actionDef.action}
                                  onClick={() => onTogglePerm(item.key, actionDef.action)}
                                  className={`text-[9px] px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${isActive ? `${colors.active} ${colors.border}` : `${colors.inactive} border-white/5 hover:border-white/15`}`}
                                >
                                  {IconComp && <IconComp className="w-2.5 h-2.5" />}
                                  {actionDef.label}
                                </button>
                              )
                            })}
                          </div>
                          {hasSubItems && (
                            <div className="ml-6 mt-3 space-y-2 border-l border-white/10 pl-4">
                              {item.subItems!.map(sub => {
                                const subPerms = sub.actions.map(a => buildPermission(sub.key, a.action))
                                const subSelectedCount = subPerms.filter(p => editPermisos.includes(p)).length
                                return (
                                  <div key={sub.label}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <button
                                        onClick={() => onToggleItemAll(sub)}
                                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[7px] shrink-0 ${subPerms.every(p => editPermisos.includes(p)) ? 'bg-blis-red border-blis-red text-white' : subSelectedCount > 0 ? 'bg-blis-red/20 border-blis-red/40 text-blis-red' : 'border-white/10 bg-transparent'}`}
                                      >
                                        {subPerms.every(p => editPermisos.includes(p)) ? '✓' : subSelectedCount > 0 ? '−' : ''}
                                      </button>
                                      <span className="text-[11px] text-gray-300 font-bold truncate">{sub.label}</span>
                                      <span className="text-[8px] text-gray-600 shrink-0">{subSelectedCount}/{sub.actions.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 ml-5">
                                      {sub.actions.map(actionDef => {
                                        const perm = buildPermission(sub.key, actionDef.action)
                                        const isActive = editPermisos.includes(perm)
                                        const colors = ACTION_COLORS[actionDef.action] || ACTION_COLORS.ver
                                        const IconComp = ACTION_ICONS[actionDef.action]
                                        return (
                                          <button
                                            key={actionDef.action}
                                            onClick={() => onTogglePerm(sub.key, actionDef.action)}
                                            className={`text-[8px] px-1.5 py-0.5 rounded-md border transition-all flex items-center gap-0.5 ${isActive ? `${colors.active} ${colors.border}` : `${colors.inactive} border-white/5 hover:border-white/15`}`}
                                          >
                                            {IconComp && <IconComp className="w-2 h-2" />}
                                            {actionDef.label}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
