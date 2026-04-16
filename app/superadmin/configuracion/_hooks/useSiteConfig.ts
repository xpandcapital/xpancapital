'use client'

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { SiteConfig } from '../_types'
import { defaultConfig } from '../_types'

export function useSiteConfig() {
  const { showToast } = useToast()
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/configuracion')
      const data = await res.json()
      if (data.success && data.config) {
        setConfig({ ...defaultConfig, ...data.config })
      }
    } catch (error) {
      console.error('Error loading config:', error)
      showToast('Error al cargar configuración', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const saveConfig = useCallback(async (configToSave: SiteConfig) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave)
      })
      const data = await res.json()
      if (data.success) {
        showToast('Configuración guardada', 'success')
        return { success: true }
      } else {
        showToast(data.error || 'Error al guardar', 'error')
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error saving config:', error)
      showToast('Error al guardar configuración', 'error')
      return { success: false, error: 'Error al guardar' }
    } finally {
      setSaving(false)
    }
  }, [showToast])

  const updateField = useCallback(<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    setConfig,
    loading,
    saving,
    loadConfig,
    saveConfig,
    updateField
  }
}