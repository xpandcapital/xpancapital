import { useState, useEffect, useCallback } from 'react'
import { Empresa, EmpresaUser } from '../_types'

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [users, setUsers] = useState<EmpresaUser[]>([])
  const [searchResults, setSearchResults] = useState<EmpresaUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [newEmpresa, setNewEmpresa] = useState({
    nombre: '', slug: '', nombre_legal: '', color_primario: '#be0b3c',
    pais_fiscal: 'PE', moneda_base: 'USD', idioma: 'es', zona_horaria: 'America/Lima', plan: 'free',
  })
  const [newUser, setNewUser] = useState({ email: '', nombre: '', apellido: '', rol: 'editor', password: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchEmpresas() }, [])

  const fetchEmpresas = useCallback(async () => {
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
    } catch {} finally { setLoading(false) }
  }, [])

  const fetchUsers = useCallback(async (empresaId: string) => {
    setLoadingUsers(true)
    try {
      const res = await fetch(`/api/admin/empresa/usuarios?empresa_id=${empresaId}`)
      const data = await res.json()
      if (data.success) setUsers(data.users || [])
    } catch {} finally { setLoadingUsers(false) }
  }, [])

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return }
    try {
      const res = await fetch(`/api/admin/empresa/usuarios?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.success) setSearchResults(data.users || [])
    } catch { setSearchResults([]) }
  }, [])

  const handleCreate = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/empresa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEmpresa) })
      const data = await res.json()
      if (data.success) {
        setNewEmpresa({ nombre: '', slug: '', nombre_legal: '', color_primario: '#be0b3c', pais_fiscal: 'PE', moneda_base: 'USD', idioma: 'es', zona_horaria: 'America/Lima', plan: 'free' })
        setShowCreate(false)
        fetchEmpresas()
        return true
      }
      return data.error || 'Error al crear'
    } catch { return 'Error al crear empresa' } finally { setSaving(false) }
  }, [newEmpresa, fetchEmpresas])

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.')) return false
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/empresa?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        if (selectedId === id) { setSelectedId(null); setShowUsers(false) }
        fetchEmpresas()
        return true
      }
      return data.error || 'Error al eliminar'
    } catch { return 'Error al eliminar' } finally { setDeleting(null) }
  }, [selectedId, fetchEmpresas])

  const handleCreateUser = useCallback(async () => {
    if (!selectedId) return 'No se seleccionó empresa'
    setSaving(true)
    try {
      const res = await fetch('/api/admin/empresa/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, empresa_id: selectedId }),
      })
      const data = await res.json()
      if (data.success) {
        setNewUser({ email: '', nombre: '', apellido: '', rol: 'editor', password: '' })
        fetchUsers(selectedId)
        fetchEmpresas()
        return true
      }
      return data.error || 'Error al crear usuario'
    } catch { return 'Error al crear usuario' } finally { setSaving(false) }
  }, [selectedId, newUser, fetchUsers, fetchEmpresas])

  const handleAssignUser = useCallback(async (userId: string, rol: string = 'editor') => {
    if (!selectedId) return
    try {
      const res = await fetch('/api/admin/empresa/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, empresa_id: selectedId, rol }),
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers(selectedId)
        fetchEmpresas()
        setSearchResults([])
        return true
      }
      return data.error || 'Error al asignar'
    } catch { return 'Error al asignar usuario' }
  }, [selectedId, fetchUsers, fetchEmpresas])

  const handleUnassignUser = useCallback(async (userId: string) => {
    if (!window.confirm('¿Desasignar este usuario de la empresa?')) return
    try {
      const res = await fetch(`/api/admin/empresa/usuarios?userId=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        if (selectedId) fetchUsers(selectedId)
        fetchEmpresas()
      }
    } catch {}
  }, [selectedId, fetchUsers, fetchEmpresas])

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const openUsers = useCallback((empresaId: string) => {
    setSelectedId(empresaId)
    setShowUsers(true)
    fetchUsers(empresaId)
  }, [fetchUsers])

  const selectedEmpresa = empresas.find(e => e.id === selectedId)

  return {
    empresas, loading, showCreate, showUsers,
    users, searchResults, loadingUsers, newEmpresa, newUser,
    saving, deleting, selectedEmpresa,
    setNewEmpresa, setNewUser, setShowCreate, setShowUsers,
    setSearchResults,
    handleCreate, handleDelete, handleCreateUser, handleAssignUser,
    handleUnassignUser, searchUsers, generateSlug,
    openUsers, fetchEmpresas,
  }
}