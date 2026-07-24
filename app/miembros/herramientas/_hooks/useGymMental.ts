"use client"

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface GymLogEntry {
  id: string; user_id: string; fecha: string; tipo: string
  score: Record<string, number>; completado_en: string
}

export function useGymMental() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [hoy, setHoy] = useState<GymLogEntry[]>([])
  const [historial, setHistorial] = useState<GymLogEntry[]>([])

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/miembros/gym-mental?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setHoy(data.hoy || [])
        setHistorial(data.historial || [])
      }
    } catch { /* silencioso */ }
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const registrar = useCallback(async (tipo: string, score: Record<string, number> = {}) => {
    if (!user?.id) return false
    setSaving(true)
    try {
      const res = await fetch('/api/miembros/gym-mental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, tipo, score }),
      })
      const data = await res.json()
      if (data.success) { await fetchData(); return true }
      return false
    } catch { return false }
    finally { setSaving(false) }
  }, [user?.id, fetchData])

  return { registrar, saving, hoy, historial, fetchData }
}
