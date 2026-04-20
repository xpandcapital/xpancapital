"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, UserPlus, Trash2, Search, UserCheck } from 'lucide-react'
import { Empresa, EmpresaUser, ROLE_LABELS, ROLE_COLORS } from '../_types'
import { useToast } from '@/components/ui/Toast'

interface Props {
  empresa: Empresa | undefined
  users: EmpresaUser[]
  loadingUsers: boolean
  searchResults: EmpresaUser[]
  newUser: { email: string; nombre: string; apellido: string; rol: string; password: string }
  saving: boolean
  setNewUser: React.Dispatch<React.SetStateAction<typeof newUser>>
  onCreateUser: () => Promise<boolean | string>
  onAssignUser: (userId: string, rol?: string) => Promise<boolean | string>
  onUnassignUser: (userId: string) => void
  onSearch: (query: string) => void
  onClose: () => void
}

export function UsersModal({ empresa, users, loadingUsers, searchResults, newUser, saving, setNewUser, onCreateUser, onAssignUser, onUnassignUser, onSearch, onClose }: Props) {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [assignRole, setAssignRole] = useState('editor')
  const [activeTab, setActiveTab] = useState<'assigned' | 'assign' | 'create'>('assigned')
  const [localSaving, setLocalSaving] = useState(false)

  if (!empresa) return null

  const handleCreate = async () => {
    setLocalSaving(true)
    const result = await onCreateUser()
    setLocalSaving(false)
    if (result === true) {
      showToast('Usuario creado exitosamente', 'success')
    } else {
      showToast(typeof result === 'string' ? result : 'Error al crear usuario', 'error')
    }
  }

  const handleAssign = async (userId: string) => {
    setLocalSaving(true)
    const result = await onAssignUser(userId, assignRole)
    setLocalSaving(false)
    if (result === true) {
      showToast('Usuario asignado exitosamente', 'success')
      setSearchQuery('')
    } else {
      showToast(typeof result === 'string' ? result : 'Error al asignar', 'error')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const isUserAssigned = (userId: string) => users.some(u => u.id === userId)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: empresa.color_primario }}>{empresa.nombre.charAt(0)}</div>
            <div>
              <h2 className="text-lg font-black text-white">{empresa.nombre}</h2>
              <p className="text-xs text-gray-500">/{empresa.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-1 mb-4 shrink-0 bg-white/5 rounded-lg p-1">
          {(['assigned', 'assign', 'create'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-blis-red text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab === 'assigned' ? `Asignados (${users.length})` : tab === 'assign' ? 'Buscar' : 'Nuevo'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'assigned' && (
            <div className="space-y-3">
              {loadingUsers ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">No hay usuarios asignados a esta empresa</div>
              ) : (
                users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ROLE_COLORS[user.rol] || '#6b7280' }}>
                        {(user.nombre?.charAt(0) || '').toUpperCase()}{(user.apellido?.charAt(0) || '').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{user.nombre} {user.apellido || ''}</p>
                        <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${ROLE_COLORS[user.rol] || '#6b7280'}20`, color: ROLE_COLORS[user.rol] || '#6b7280' }}>{ROLE_LABELS[user.rol] || user.rol}</span>
                      <button onClick={() => onUnassignUser(user.id)} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-colors" title="Desasignar de la empresa">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'assign' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Buscar usuario por email o nombre</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="buscar@correo.com..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Rol al asignar</label>
                <select value={assignRole} onChange={e => setAssignRole(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 appearance-none">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {searchQuery.length >= 2 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Resultados ({searchResults.length})</p>
                  {searchResults.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-4">No se encontraron usuarios</p>
                  ) : (
                    searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-zinc-800">
                            {(user.nombre?.charAt(0) || '').toUpperCase()}{(user.apellido?.charAt(0) || '').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user.nombre} {user.apellido || ''}</p>
                            <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                          </div>
                        </div>
                        {isUserAssigned(user.id) ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-1"><UserCheck className="w-3 h-3" />Asignado</span>
                        ) : (
                          <button onClick={() => handleAssign(user.id)} className="px-3 py-1.5 rounded-lg bg-blis-red/10 text-blis-red text-[11px] font-bold hover:bg-blis-red hover:text-white transition-colors">
                            Asignar
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Nombre *</label><input type="text" value={newUser.nombre} onChange={e => setNewUser(prev => ({ ...prev, nombre: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" /></div>
                <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Apellido</label><input type="text" value={newUser.apellido} onChange={e => setNewUser(prev => ({ ...prev, apellido: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" /></div>
              </div>
              <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Email *</label><input type="email" value={newUser.email} onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" placeholder="correo@empresa.com" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Contraseña</label><input type="password" value={newUser.password} onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" placeholder="Auto-generada" /></div>
                <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Rol</label><select value={newUser.rol} onChange={e => setNewUser(prev => ({ ...prev, rol: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50 appearance-none">{Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              </div>
              <button onClick={handleCreate} disabled={localSaving || !newUser.email || !newUser.nombre} className="w-full bg-blis-red text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />{localSaving ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}