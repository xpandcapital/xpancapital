import { useState, useEffect, useCallback } from 'react'
import type { EnvioZona, EnvioZonaInput } from '@/lib/types/contexts'

export function useEnvioZonas() {
  const [zonas, setZonas] = useState<EnvioZona[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchZonas = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = includeInactive ? '?all=true' : ''
      const response = await fetch(`/api/context/envio-zonas${params}`)
      const data = await response.json()

      if (data.success) {
        setZonas(data.data)
      } else {
        setError(data.error || 'Error al cargar zonas de envío')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const addZona = useCallback(async (zona: EnvioZonaInput) => {
    try {
      const response = await fetch('/api/context/envio-zonas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zona)
      })
      const data = await response.json()

      if (data.success) {
        setZonas(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const updateZona = useCallback(async (id: string, updates: Partial<EnvioZona>) => {
    try {
      const response = await fetch('/api/context/envio-zonas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      const data = await response.json()

      if (data.success) {
        setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const deleteZona = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/context/envio-zonas?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setZonas(prev => prev.filter(z => z.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const calculateShippingCost = useCallback((
    weightInGrams: number,
    zoneId: string
  ) => {
    const zone = zonas.find(z => z.id === zoneId)
    if (!zone) return 0

    let cost = zone.precio_base
    if (weightInGrams > 1000) {
      cost += (weightInGrams - 1000) * zone.precio_por_gramo
    }
    return cost
  }, [zonas])

  useEffect(() => {
    fetchZonas()
  }, [fetchZonas])

  return {
    zonas,
    loading,
    error,
    fetchZonas,
    addZona,
    updateZona,
    deleteZona,
    calculateShippingCost
  }
}

export default useEnvioZonas