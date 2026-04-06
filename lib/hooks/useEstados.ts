import { useState, useEffect, useCallback } from 'react'
import type { ProductoEstado, ProductoEstadoInput } from '@/lib/types/contexts'

export function useEstados() {
  const [estados, setEstados] = useState<ProductoEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstados = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = includeInactive ? '?all=true' : ''
      const response = await fetch(`/api/context/estados${params}`)
      const data = await response.json()

      if (data.success) {
        setEstados(data.data)
      } else {
        setError(data.error || 'Error al cargar estados')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const addEstado = useCallback(async (estado: ProductoEstadoInput) => {
    try {
      const response = await fetch('/api/context/estados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estado)
      })
      const data = await response.json()

      if (data.success) {
        setEstados(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const updateEstado = useCallback(async (id: string, updates: Partial<ProductoEstado>) => {
    try {
      const response = await fetch('/api/context/estados', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      const data = await response.json()

      if (data.success) {
        setEstados(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const deleteEstado = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/context/estados?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setEstados(prev => prev.filter(e => e.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const getDefaultEstado = useCallback(() => {
    return estados.find(e => e.es_default && e.activo) || estados[0]
  }, [estados])

  useEffect(() => {
    fetchEstados()
  }, [fetchEstados])

  return {
    estados,
    loading,
    error,
    fetchEstados,
    addEstado,
    updateEstado,
    deleteEstado,
    getDefaultEstado
  }
}

export default useEstados