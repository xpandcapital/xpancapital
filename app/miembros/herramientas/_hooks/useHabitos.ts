"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const HABITOS_FIJOS = [
  { id: 'player_time', label: 'Player Time', icon: '▶️' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' },
  { id: 'journal', label: 'Journal', icon: '📝' },
  { id: 'eod_markup', label: 'EOD Markup', icon: '📊' },
  { id: 'podcast', label: 'Podcast', icon: '🎧' },
  { id: 'read', label: 'Read', icon: '📖' },
  { id: 'read_bible', label: 'Read The Bible', icon: '📜' },
  { id: 'workout', label: 'Workout', icon: '🏋️' },
]

export interface HabitosDiarios {
  id: string
  user_id: string
  fecha: string
  habitos: string[]
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

export function useHabitos() {
  const { user } = useAuth()
  const [habitosHoy, setHabitosHoy] = useState<HabitosDiarios | null>(null)
  const [historial, setHistorial] = useState<HabitosDiarios[]>([])
  const [historialLoading, setHistorialLoading] = useState(false)
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
      const res = await fetch(`/api/miembros/habitos?user_id=${user.id}&fecha=${hoy}`, { signal: controller.signal })
      const data = await res.json()
      if (data.success) setHabitosHoy(data.data)
    } catch { /* silencioso */ }
    finally { clearTimeout(timeout); setLoading(false) }
  }, [user?.id, hoy])

  const fetchHistorial = useCallback(async () => {
    if (!user?.id) return
    setHistorialLoading(true)
    try {
      const res = await fetch(`/api/miembros/habitos?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) setHistorial(data.data || [])
    } catch { /* silencioso */ }
    finally { setHistorialLoading(false) }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) { fetchHoy(); fetchHistorial() }
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchHoy, fetchHistorial])

  const guardar = useCallback(async (habitos: string[], fechaOverride?: string): Promise<HabitosDiarios | null> => {
    if (!user?.id) return null
    setSaving(true)
    try {
      const fecha = fechaOverride || hoy
      const res = await fetch('/api/miembros/habitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, fecha, habitos }),
      })
      const data = await res.json()
      if (data.success) {
        if (fecha === hoy) setHabitosHoy(data.data)
        setHistorial(prev => {
          const idx = prev.findIndex(h => h.fecha === fecha)
          if (idx >= 0) {
            const copy = [...prev]
            copy[idx] = data.data
            return copy
          }
          return [data.data, ...prev]
        })
        return data.data
      }
      return null
    } catch { return null }
    finally { setSaving(false) }
  }, [user?.id, hoy])

  return { habitosHoy, historial, loading, historialLoading, saving, guardar, fetchHistorial }
}
