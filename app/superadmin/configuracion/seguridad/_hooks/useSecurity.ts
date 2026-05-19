'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { SecurityConfig } from '../_types'
import { defaultSecurityConfig } from '../_types'

export function useSecurity() {
  const { showToast } = useToast()
  const [config, setConfig] = useState<SecurityConfig>(defaultSecurityConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const configRef = useRef(config)
  configRef.current = config

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/seguridad')
      const data = await res.json()
      if (data.success && data.data) {
        setConfig({ ...defaultSecurityConfig, ...data.data })
      }
    } catch {
      // Silencioso - usar defaults
    } finally {
      setLoading(false)
    }
  }, [])

  const saveConfig = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seguridad', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'geobloqueo',
          config: configRef.current.geobloqueo,
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('Configuración guardada', 'success')
      } else {
        showToast(data.error || 'Error al guardar', 'error')
      }
    } catch {
      showToast('Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }, [showToast])

  const updateGeobloqueo = useCallback(
    (updates: Partial<NonNullable<SecurityConfig['geobloqueo']>>) => {
      setConfig(prev => ({
        ...prev,
        geobloqueo: { ...prev.geobloqueo!, ...updates }
      }))
    }, []
  )

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    loading,
    saving,
    loadConfig,
    saveConfig,
    updateGeobloqueo,
  }
}
