"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Plus, Trash2, Save, Users, Crown, X, UserPlus,
  ChevronRight, Globe, Mail, Shield
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Empresa {
  id: string
  slug: string
  nombre: string
  nombre_legal: string | null
  logo_url: string | null
  color_primario: string
  color_secundario: string
  color_acento: string
  moneda_base: string
  idioma: string
  zona_horaria: string
  pais_fiscal: string
  ruc: string | null
  dominio_principal: string | null
  activo: boolean
  plan: string
  plan_limite_usuarios: number
  plan_limite_productos: number
  plan_limite_almacenamiento: number
  creado_en: string
  user_count?: number
}

interface EmpresaUser {
  id: string
  email: string
  nombre: string
  apellido: string | null
  rol: string
  avatar_url: string | null
  creado_en: string
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  cliente: 'Cliente',
  usuario: 'Usuario',
}

const ROLE_COLORS: Record<string, string> = {
  superadmin: '#be0b3c',
  admin: '#f59e0b',
  editor: '#8b5cf6',
  cliente: '#3b82f6',
  usuario: '#6b7280',
}

const PLANES = [
  { id: 'free', nombre: 'Free', usuarios: 5, productos: 50 },
  { id: 'starter', nombre: 'Starter', usuarios: 20, productos: 200 },
  { id: 'pro', nombre: 'Pro', usuarios: 100, productos: 1000 },
  { id: 'enterprise', nombre: 'Enterprise', usuarios: 500, productos: 5000 },
]

export default function EmpresasPage() {
  const { showToast } = useToast()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [users, setUsers] = useState<EmpresaUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [newEmpresa, setNewEmpresa] = useState({ nombre: '', slug: '', nombre_legal: '', color_primario: '#be0b3c', pais_fiscal: 'PE', moneda_base: 'USD', idioma: 'es', zona_horaria: 'America/Lima', plan: 'free' })
  const [newUser, setNewUser] = useState({ email: '', nombre: '', apellido: '', rol: 'editor', password: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchEmpresas() }, [])

  const fetchEmpresas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/empresa?list=all')
      const data = await res.json()
      if (data.success) {
        const empresaList = data.empresas || []
        const withCounts = await Promise.all(empresaList.map(async (e: Empresa) => {
          try {
            const uRes = await fetch(`/api/admin/empresa/usuarios?empresa_id=${e.id}`)
            const uData = await uRes.json()
            return { ...e, user_count: uData.users?.length || 0 }
          } catch { return { ...e, user_count: 0 } }
        }))
        setEmpresas(withCounts)
      }
    } catch { showToast('Error al cargar empresas', 'error') }
    finally { setLoading(false) }
  }

  const fetchUsers = async (empresaId: string) => {
    setLoadingUsers(true)
    try {
      const res = await fetch(`/api/admin/empresa/usuarios?empresa_id=${empresaId}`)
      const data = await res.json()
      if (data.success) setUsers(data.users || [])
    } catch { showToast('Error al cargar usuarios', 'error') }
    finally { setLoadingUsers(false) }
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/empresa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEmpresa) })
      const data = await res.json()
      if (data.success) {
        showToast('Empresa creada exitosamente', 'success')
        setShowCreate(false)
        setNewEmpresa({ nombre: '', slug: '', nombre_legal: '', color_primario: '#be0b3c', pais_fiscal: 'PE', moneda_base: 'USD', idioma: 'es', zona_horaria: 'America/Lima', plan: 'free' })
        fetchEmpresas()
      } else { showToast(data.error || 'Error al crear', 'error') }
    } catch { showToast('Error al crear empresa', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/empresa?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Empresa eliminada', 'success')
        if (selectedId === id) { setSelectedId(null); setShowUsers(false) }
        fetchEmpresas()
      } else { showToast(data.error || 'Error al eliminar', 'error') }
    } catch { showToast('Error al eliminar', 'error') }
    finally { setDeleting(null) }
  }

  const handleCreateUser = async () => {
    const selectedEmpresa = empresas.find(e => e.id === selectedId)
    if (!selectedEmpresa) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/empresa/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, empresa_id: selectedEmpresa.id }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Usuario creado exitosamente', 'success')
        setNewUser({ email: '', nombre: '', apellido: '', rol: 'editor', password: '' })
        fetchUsers(selectedEmpresa.id)
        fetchEmpresas()
      } else { showToast(data.error || 'Error al crear usuario', 'error') }
    } catch { showToast('Error al crear usuario', 'error') }
    finally { setSaving(false) }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm('¿Eliminar este usuario de la empresa?')) return
    try {
      const res = await fetch(`/api/admin/empresa/usuarios?userId=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Usuario eliminado', 'success')
        if (selectedId) fetchUsers(selectedId)
      } else { showToast(data.error || 'Error al eliminar', 'error') }
    } catch { showToast('Error al eliminar usuario', 'error') }
  }

  const handleViewUsers = (empresaId: string) => {
    setSelectedId(empresaId)
    setShowUsers(true)
    fetchUsers(empresaId)
  }

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const selectedEmpresa = empresas.find(e => e.id === selectedId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Empresas</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Gestiona las empresas del sistema. Cada empresa tiene sus propias API keys, usuarios y configuración.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full sm:w-auto bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Plus className="w-4 h-4" />Nueva Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empresas.map(empresa => (
          <motion.div key={empresa.id} layout className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden hover:border-blis-red/30 transition-all group">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: empresa.color_primario || '#be0b3c' }}>
                    {empresa.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{empresa.nombre}</h3>
                    <p className="text-gray-500 text-[10px] font-mono">/{empresa.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${empresa.activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {empresa.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                  <div className="text-white font-bold text-sm">{empresa.user_count || 0}</div>
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider">Usuarios</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                  <div className="text-white font-bold text-sm capitalize">{PLANES.find(p => p.id === empresa.plan)?.nombre || empresa.plan}</div>
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider">Plan</div>
                </div>
              </div>

              {empresa.pais_fiscal && (
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
                  <Globe className="w-3 h-3" />
                  <span>{empresa.pais_fiscal} · {empresa.moneda_base} · {empresa.idioma?.toUpperCase()}</span>
                </div>
              )}

              {empresa.dominio_principal && (
                <div className="text-[11px] text-gray-500 mb-3 truncate">{empresa.dominio_principal}</div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button onClick={() => handleViewUsers(empresa.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-bold transition-colors">
                  <Users className="w-3.5 h-3.5" />Usuarios
                </button>
                <a href={`/superadmin/ajustes/empresas?id=${empresa.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-bold transition-colors">
                  <Save className="w-3.5 h-3.5" />Configurar
                </a>
                {empresa.id !== '6186f014-c8c7-4027-9f08-8acf2bae3eae' && (
                  <button onClick={() => handleDelete(empresa.id)} disabled={deleting === empresa.id} className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-wide">Nueva Empresa</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre Comercial *</label><input type="text" value={newEmpresa.nombre} onChange={e => setNewEmpresa(prev => ({ ...prev, nombre: e.target.value, slug: generateSlug(e.target.value) }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" placeholder="Mi Empresa" /></div>
                <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Slug (URL) *</label><input type="text" value={newEmpresa.slug} onChange={e => setNewEmpresa(prev => ({ ...prev, slug: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-blis-red/50" placeholder="mi-empresa" /></div>
                <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Color Primario</label><div className="flex items-center gap-3"><input type="color" value={newEmpresa.color_primario} onChange={e => setNewEmpresa(prev => ({ ...prev, color_primario: e.target.value }))} className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer" /><input type="text" value={newEmpresa.color_primario} onChange={e => setNewEmpresa(prev => ({ ...prev, color_primario: e.target.value }))} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blis-red/50" /></div></div>
                <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Plan</label><select value={newEmpresa.plan} onChange={e => setNewEmpresa(prev => ({ ...prev, plan: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 appearance-none">{PLANES.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.usuarios} users)</option>)}</select></div>
                <button onClick={handleCreate} disabled={saving || !newEmpresa.nombre || !newEmpresa.slug} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">{saving ? 'Creando...' : 'Crear Empresa'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUsers && selectedEmpresa && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowUsers(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: selectedEmpresa.color_primario }}>{selectedEmpresa.nombre.charAt(0)}</div>
                  <div>
                    <h2 className="text-lg font-black text-white">{selectedEmpresa.nombre}</h2>
                    <p className="text-xs text-gray-500">/{selectedEmpresa.slug}</p>
                  </div>
                </div>
                <button onClick={() => setShowUsers(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Usuarios asignados ({users.length})</h3>
                {loadingUsers ? (
                  <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm">No hay usuarios asignados a esta empresa</div>
                ) : (
                  users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ROLE_COLORS[user.rol] || '#6b7280' }}>{(user.nombre?.charAt(0) || '').toUpperCase()}{(user.apellido?.charAt(0) || '').toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{user.nombre} {user.apellido || ''}</p>
                          <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${ROLE_COLORS[user.rol] || '#6b7280'}20`, color: ROLE_COLORS[user.rol] || '#6b7280' }}>{ROLE_LABELS[user.rol] || user.rol}</span>
                        <button onClick={() => handleRemoveUser(user.id)} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Agregar usuario</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Nombre</label><input type="text" value={newUser.nombre} onChange={e => setNewUser(prev => ({ ...prev, nombre: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" /></div>
                    <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Apellido</label><input type="text" value={newUser.apellido} onChange={e => setNewUser(prev => ({ ...prev, apellido: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" /></div>
                  </div>
                  <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Email *</label><input type="email" value={newUser.email} onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" placeholder="correo@empresa.com" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Contraseña</label><input type="password" value={newUser.password} onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" placeholder="Auto-generada" /></div>
                    <div><label className="text-[9px] text-gray-600 uppercase tracking-wider mb-1 block">Rol</label><select value={newUser.rol} onChange={e => setNewUser(prev => ({ ...prev, rol: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50 appearance-none">{Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  </div>
                  <button onClick={handleCreateUser} disabled={saving || !newUser.email || !newUser.nombre} className="w-full bg-blis-red text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />{saving ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}