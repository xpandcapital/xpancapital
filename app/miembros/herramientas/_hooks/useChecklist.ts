"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface ChecklistPersonalizado {
  id: string; user_id: string; label: string; seccion: string; icon: string
  activo: boolean; es_personalizado: boolean; creado_en: string
}

export interface ChecklistData {
  id: string; user_id: string; fecha: string; items: Record<string, boolean>; score_cumplimiento: number; creado_en: string
}

export function useChecklist() {
  const { user } = useAuth()
  const [checklistHoy, setChecklistHoy] = useState<ChecklistData | null>(null)
  const [historial, setHistorial] = useState<ChecklistData[]>([])
  const [config, setConfig] = useState<ChecklistPersonalizado[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const d = new Date()
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const fetchConfig = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/miembros/checklist/personalizado?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) setConfig(data.data || [])
    } catch {}
  }, [user?.id])

  const fetchHoy = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    abortRef.current?.abort()
    const controller = new AbortController(); abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(`/api/miembros/checklist?user_id=${user.id}&fecha=${hoy}`, { signal: controller.signal })
      const data = await res.json()
      if (data.success) setChecklistHoy(data.data)
    } catch {}
    finally { clearTimeout(timeout); setLoading(false) }
  }, [user?.id, hoy])

  const fetchHistorial = useCallback(async (periodo: string) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/miembros/checklist?user_id=${user.id}&periodo=${periodo}`)
      const data = await res.json()
      if (data.success) setHistorial(data.data || [])
    } catch {}
  }, [user?.id])

  useEffect(() => {
    if (user?.id) { fetchHoy(); fetchHistorial('30d'); fetchConfig() }
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchHoy, fetchHistorial, fetchConfig])

  const toggleItem = useCallback(async (itemId: string) => {
    if (!user?.id) return
    setSaving(true)
    const items = { ...(checklistHoy?.items || {}) }
    items[itemId] = !items[itemId]
    const completados = Object.values(items).filter(v => v === true).length
    const totalActivos = config.filter(c => c.activo).length || 17
    const score = Math.round((completados / totalActivos) * 100)
    setChecklistHoy(prev => prev ? { ...prev, items, score_cumplimiento: score } : null)
    try {
      const res = await fetch('/api/miembros/checklist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, fecha: hoy, items }),
      })
      const data = await res.json()
      if (data.success) { setChecklistHoy(data.data); fetchHistorial('30d') }
    } catch { fetchHoy() }
    finally { setSaving(false) }
  }, [user?.id, hoy, checklistHoy, config, fetchHoy, fetchHistorial])

  return { checklistHoy, historial, loading, saving, toggleItem, fetchHistorial, config, fetchConfig }
}
