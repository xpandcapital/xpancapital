import { useState, useEffect, useCallback } from 'react'
import type { UnidadMedida, UnidadMedidaInput, TipoUnidad } from '@/lib/types/contexts'

export function useUnidades() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUnidades = useCallback(async (includeInactive = false, tipo?: TipoUnidad) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (includeInactive) params.append('all', 'true')
      if (tipo) params.append('tipo', tipo)
      
      const response = await fetch(`/api/context/unidades?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUnidades(data.data)
      } else {
        setError(data.error || 'Error al cargar unidades')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const addUnidad = useCallback(async (unidad: UnidadMedidaInput) => {
    try {
      const response = await fetch('/api/context/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unidad)
      })
      const data = await response.json()

      if (data.success) {
        setUnidades(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const updateUnidad = useCallback(async (id: string, updates: Partial<UnidadMedida>) => {
    try {
      const response = await fetch('/api/context/unidades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      const data = await response.json()

      if (data.success) {
        setUnidades(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const deleteUnidad = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/context/unidades?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setUnidades(prev => prev.filter(u => u.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const getUnidadesByTipo = useCallback((tipo: TipoUnidad) => {
    return unidades.filter(u => u.tipo === tipo && u.activo)
  }, [unidades])

  useEffect(() => {
    fetchUnidades()
  }, [fetchUnidades])

  return {
    unidades,
    loading,
    error,
    fetchUnidades,
    addUnidad,
    updateUnidad,
    deleteUnidad,
    getUnidadesByTipo
  }
}

export default useUnidades