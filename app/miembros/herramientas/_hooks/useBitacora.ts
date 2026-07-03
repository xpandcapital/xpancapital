"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface BitacoraEntry {
  id: string
  user_id: string
  fecha_inicio: string
  fecha_fin: string | null
  hora: string | null
  accion: string
  divisa_1: string | null
  divisa_2: string | null
  riesgo_beneficio: string | null
  lotaje: number | null
  perdidas_pips: number | null
  ganancias_pips: number | null
  tipo_cierre: string | null
  resultado_usd: number | null
  emociones: string | null
  plan_trading: boolean | null
  observacion: string | null
  creado_en: string
}

export function useBitacora() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<'success' | 'error' | null>(null)
  const [lastError, setLastError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!user?.id) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)

    setLoading(true)
    try {
      const res = await fetch(`/api/miembros/bitacora?user_id=${user.id}`, {
        signal: controller.signal,
      })
      const data = await res.json()
      if (data.success) setEntries(data.data || [])
    } catch (e: any) {
      if (e.name !== 'AbortError') setLastError('Error al cargar')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchEntries()
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchEntries])

  const saveEntry = useCallback(async (entry: Partial<BitacoraEntry> & { user_id: string }): Promise<boolean> => {
    setSaving(true)
    setLastSave(null)
    setLastError('')
    try {
      const isUpdate = !!entry.id
      const method = isUpdate ? 'PUT' : 'POST'
      const url = isUpdate ? '/api/miembros/bitacora' : '/api/miembros/bitacora'
      const body = isUpdate ? { ...entry, id: entry.id } : entry

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setLastSave('success')
        await fetchEntries()
        return true
      } else {
        setLastSave('error')
        setLastError(data.error || 'Error al guardar')
        return false
      }
    } catch (e: any) {
      setLastSave('error')
      setLastError(e.message || 'Error de conexión')
      return false
    } finally {
      setSaving(false)
    }
  }, [fetchEntries])

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/miembros/bitacora?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setEntries(prev => prev.filter(e => e.id !== id))
        return true
      }
      return false
    } catch { return false }
  }, [])

  return {
    entries, loading, saving, lastSave, lastError,
    clearSaveStatus: () => setLastSave(null),
    saveEntry, deleteEntry, fetchEntries,
  }
}
