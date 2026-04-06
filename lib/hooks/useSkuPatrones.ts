import { useState, useEffect, useCallback } from 'react'
import type { SkuPatron, SkuPatronInput } from '@/lib/types/contexts'

export function useSkuPatrones() {
  const [patrones, setPatrones] = useState<SkuPatron[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatrones = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = includeInactive ? '?all=true' : ''
      const response = await fetch(`/api/context/sku-patrones${params}`)
      const data = await response.json()

      if (data.success) {
        setPatrones(data.data)
      } else {
        setError(data.error || 'Error al cargar patrones SKU')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const addPatron = useCallback(async (patron: SkuPatronInput) => {
    try {
      const response = await fetch('/api/context/sku-patrones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patron)
      })
      const data = await response.json()

      if (data.success) {
        setPatrones(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const updatePatron = useCallback(async (id: string, updates: Partial<SkuPatron>) => {
    try {
      const response = await fetch('/api/context/sku-patrones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      const data = await response.json()

      if (data.success) {
        setPatrones(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const deletePatron = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/context/sku-patrones?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setPatrones(prev => prev.filter(p => p.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  useEffect(() => {
    fetchPatrones()
  }, [fetchPatrones])

  return {
    patrones,
    loading,
    error,
    fetchPatrones,
    addPatron,
    updatePatron,
    deletePatron
  }
}

export default useSkuPatrones