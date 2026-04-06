import { useState, useEffect, useCallback } from 'react'
import type { BusinessConfig, BusinessType } from '@/lib/types/contexts'

interface BusinessConfigInput {
  enable_perishables?: boolean
  enable_serialization?: boolean
  enable_shipping?: boolean
  business_type?: BusinessType
  coins_nombre?: string
  coins_ratio_usd?: number
  recompensa_lectura_segundos?: number
  recompensa_lectura_coins?: number
  blog_premium_por_defecto?: boolean
}

export function useBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/context/business-config')
      const data = await response.json()

      if (data.success) {
        setConfig(data.data)
      } else {
        setError(data.error || 'Error al cargar configuración')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConfig = useCallback(async (updates: BusinessConfigInput) => {
    try {
      const response = await fetch('/api/context/business-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await response.json()

      if (data.success) {
        setConfig(prev => prev ? { ...prev, ...updates } : data.data)
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    // Convenience getters
    enablePerishables: config?.enable_perishables ?? true,
    enableSerialization: config?.enable_serialization ?? true,
    enableShipping: config?.enable_shipping ?? true,
    businessType: config?.business_type ?? 'physical'
  }
}

export default useBusinessConfig