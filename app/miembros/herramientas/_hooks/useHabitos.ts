"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface HabitoPersonalizado {
  id: string; user_id: string; label: string; icon: string
  activo: boolean; es_personalizado: boolean; creado_en: string
}

export interface HabitosDiarios {
  id: string; user_id: string; fecha: string; habitos: string[]; creado_en: string
}

export function useHabitos() {
  const { user } = useAuth()
  const [habitosHoy, setHabitosHoy] = useState<HabitosDiarios | null>(null)
  const [historial, setHistorial] = useState<HabitosDiarios[]>([])
  const [habitosConfig, setHabitosConfig] = useState<HabitoPersonalizado[]>([])
  const [loading, setLoading] = useState(true)
  const [historialLoading, setHistorialLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const d = new Date()
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const fetchConfig = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/miembros/habitos/personalizados?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) setHabitosConfig(data.data || [])
    } catch {}
  }, [user?.id])

  const fetchHoy = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    abortRef.current?.abort()
    const controller = new AbortController(); abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(`/api/miembros/habitos?user_id=${user.id}&fecha=${hoy}`, { signal: controller.signal })
      const data = await res.json()
      if (data.success) setHabitosHoy(data.data)
    } catch {}
    finally { clearTimeout(timeout); setLoading(false) }
  }, [user?.id, hoy])

  const fetchHistorial = useCallback(async () => {
    if (!user?.id) return
    setHistorialLoading(true)
    try {
      const res = await fetch(`/api/miembros/habitos?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) setHistorial(data.data || [])
    } catch {}
    finally { setHistorialLoading(false) }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) { fetchHoy(); fetchHistorial(); fetchConfig() }
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchHoy, fetchHistorial, fetchConfig])

  const guardar = useCallback(async (habitos: string[], fechaOverride?: string): Promise<HabitosDiarios | null> => {
    if (!user?.id) return null
    setSaving(true)
    try {
      const fecha = fechaOverride || hoy
      const res = await fetch('/api/miembros/habitos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, fecha, habitos }),
      })
      const data = await res.json()
      if (data.success) {
        if (fecha === hoy) setHabitosHoy(data.data)
        setHistorial(prev => { const idx = prev.findIndex(h => h.fecha === fecha); if (idx >= 0) { const copy = [...prev]; copy[idx] = data.data; return copy } return [data.data, ...prev] })
        return data.data
      }
      return null
    } catch { return null }
    finally { setSaving(false) }
  }, [user?.id, hoy])

  return { habitosHoy, historial, loading, historialLoading, saving, guardar, habitosConfig, fetchConfig }
}
