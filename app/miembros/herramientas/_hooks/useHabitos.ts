"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface HabitosDiarios {
  id: string
  user_id: string
  fecha: string
  habitos: string[]
  creado_en: string
}

export function useHabitos() {
  const { user } = useAuth()
  const [habitosHoy, setHabitosHoy] = useState<HabitosDiarios | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<'success' | 'error' | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const hoy = new Date().toISOString().split('T')[0]

  const fetchHoy = useCallback(async () => {
    if (!user?.id) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    setLoading(true)
    try {
      const res = await fetch(`/api/miembros/habitos?user_id=${user.id}&fecha=${hoy}`, { signal: controller.signal })
      const data = await res.json()
      if (data.success) setHabitosHoy(data.data)
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {}
    } finally { clearTimeout(timeout); setLoading(false) }
  }, [user?.id, hoy])

  useEffect(() => {
    if (user?.id) fetchHoy()
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchHoy])

  const guardar = useCallback(async (habitos: string[]): Promise<boolean> => {
    if (!user?.id) return false
    setSaving(true)
    setLastSave(null)
    try {
      const res = await fetch('/api/miembros/habitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, fecha: hoy, habitos }),
      })
      const data = await res.json()
      if (data.success) { setLastSave('success'); setHabitosHoy(data.data); return true }
      setLastSave('error')
      return false
    } catch { setLastSave('error'); return false } finally { setSaving(false) }
  }, [user?.id, hoy])

  return { habitosHoy, loading, saving, lastSave, guardar, clearSaveStatus: () => setLastSave(null) }
}
