"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface ChecklistData {
  id: string
  user_id: string
  fecha: string
  items: Record<string, boolean>
  score_cumplimiento: number
  creado_en: string
}

function getHoyLocal(zona?: string): string {
  try {
    const d = new Date()
    return d.toLocaleDateString('en-CA', { timeZone: zona || 'America/Bogota' })
  } catch {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
}

export function useChecklist() {
  const { user } = useAuth()
  const [checklistHoy, setChecklistHoy] = useState<ChecklistData | null>(null)
  const [historial, setHistorial] = useState<ChecklistData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const hoy = getHoyLocal((user as any)?.zona_horaria || user?.zona_horaria)

  const fetchHoy = useCallback(async () => {
    if (!user?.id) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    setLoading(true)
    try {
      const res = await fetch(`/api/miembros/checklist?user_id=${user.id}&fecha=${hoy}`, { signal: controller.signal })
      const data = await res.json()
      if (data.success) setChecklistHoy(data.data)
    } catch { /* silencioso */ }
    finally { clearTimeout(timeout); setLoading(false) }
  }, [user?.id, hoy])

  const fetchHistorial = useCallback(async (periodo: string) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/miembros/checklist?user_id=${user.id}&periodo=${periodo}`)
      const data = await res.json()
      if (data.success) setHistorial(data.data || [])
    } catch { /* silencioso */ }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) { fetchHoy(); fetchHistorial('30d') }
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchHoy, fetchHistorial])

  const toggleItem = useCallback(async (itemId: string) => {
    if (!user?.id) return
    setSaving(true)
    const items = { ...(checklistHoy?.items || {}) }
    items[itemId] = !items[itemId]

    // Optimistic update
    const completados = Object.values(items).filter(v => v === true).length
    const score = Math.round((completados / 17) * 100)
    setChecklistHoy(prev => prev ? { ...prev, items, score_cumplimiento: score } : null)

    try {
      const res = await fetch('/api/miembros/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, fecha: hoy, items }),
      })
      const data = await res.json()
      if (data.success) { setChecklistHoy(data.data); fetchHistorial('30d') }
    } catch { fetchHoy() }
    finally { setSaving(false) }
  }, [user?.id, hoy, checklistHoy, fetchHoy, fetchHistorial])

  return { checklistHoy, historial, loading, saving, toggleItem, fetchHistorial }
}
