import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'

export interface CustomRole {
  id?: string
  nombre: string
  label: string
  descripcion: string
  permisos: string[]
  color: string
  orden: number
  is_system?: boolean
  ruta_inicio?: string | null
}

const SYSTEM_ROLES = ['superadmin', 'admin', 'editor', 'cliente', 'usuario']

export function useRoles() {
  const { showToast } = useToast()
  const [roles, setRoles] = useState<CustomRole[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/roles')
      const data = await res.json()
      if (data.success && data.data) {
        setRoles(data.data.map((r: CustomRole) => ({
          ...r,
          is_system: SYSTEM_ROLES.includes(r.nombre),
          permisos: Array.isArray(r.permisos) ? r.permisos : [],
          orden: r.orden ?? 99,
          ruta_inicio: r.ruta_inicio || null,
        })))
      }
    } catch { showToast('Error al cargar roles', 'error') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const createRole = useCallback(async (role: Partial<CustomRole>): Promise<boolean> => {
    setSaving('create')
    try {
      const maxOrden = roles.length > 0 ? Math.max(...roles.map(r => r.orden)) : 0
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: role.nombre,
          label: role.label || role.nombre,
          descripcion: role.descripcion || '',
          permisos: role.permisos || [],
          color: role.color || '#6b7280',
          orden: maxOrden + 1,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Rol creado exitosamente', 'success')
        fetchRoles()
        return true
      }
      showToast(data.error || 'Error al crear rol', 'error')
      return false
    } catch { showToast('Error al crear rol', 'error'); return false }
    finally { setSaving(null) }
  }, [roles, fetchRoles, showToast])

  const updateRole = useCallback(async (id: string, updates: Partial<CustomRole>): Promise<boolean> => {
    setSaving(id)
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Rol actualizado', 'success')
        fetchRoles()
        return true
      }
      showToast(data.error || 'Error al actualizar', 'error')
      return false
    } catch { showToast('Error al actualizar', 'error'); return false }
    finally { setSaving(null) }
  }, [fetchRoles, showToast])

  const reorderRoles = useCallback(async (reordered: CustomRole[]): Promise<boolean> => {
    setSaving('reorder')
    setRoles(reordered)
    try {
      const updates = reordered.map((r, idx) => ({ id: r.id, orden: idx + 1 }))
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: updates }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Orden guardado', 'success')
        return true
      }
      fetchRoles()
      showToast(data.error || 'Error al reordenar', 'error')
      return false
    } catch {
      fetchRoles()
      showToast('Error al reordenar', 'error')
      return false
    }
    finally { setSaving(null) }
  }, [fetchRoles, showToast])

  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    setSaving('delete')
    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Rol eliminado', 'success')
        setRoles(prev => prev.filter(r => r.id !== id))
        return true
      }
      showToast(data.error || 'Error al eliminar', 'error')
      return false
    } catch { showToast('Error al eliminar', 'error'); return false }
    finally { setSaving(null) }
  }, [showToast])

  return { roles, loading, saving, fetchRoles, createRole, updateRole, reorderRoles, deleteRole }
}
