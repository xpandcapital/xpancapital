'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { SiteConfig } from '../_types'
import { defaultConfig } from '../_types'

export function useSiteConfig() {
  const { showToast } = useToast()
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [keywordsInput, setKeywordsInput] = useState('')
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    setKeywordsInput((config.meta_keywords || []).join(', '))
  }, [config.meta_keywords])

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/site-config')
      const data = await res.json()
      if (data.success && data.data) {
        setConfig({ ...defaultConfig, ...data.data })
      }
    } catch (error) {
      console.error('Error loading config:', error)
      showToast('Error al cargar configuración', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const saveConfig = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configRef.current)
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

  const updateField = useCallback(<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    loading,
    saving,
    keywordsInput,
    setKeywordsInput,
    loadConfig,
    saveConfig,
    updateField
  }
}
