'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Calendario } from '../_types'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export function useCalendars() {
  const [calendars, setCalendars] = useState<Calendario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendars = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/calendarios?empresa_id=${EMPRESA_ID}`)
      const data = await res.json()
      if (data.success && data.data) {
        setCalendars(data.data)
      } else {
        setError(data.error || 'Error al cargar calendarios')
      }
    } catch (err) {
      console.error('[Calendarios] Error fetching:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar calendarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendars()
  }, [fetchCalendars])

  const create = useCallback(async (calendar: Omit<Calendario, 'id' | 'creado_en' | 'actualizado_en'>) => {
    try {
      const res = await fetch('/api/calendarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendar),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setCalendars(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error || 'Error al crear calendario' }
    } catch (err) {
      console.error('[Calendarios] Error creating:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error al crear calendario' }
    }
  }, [])

  const update = useCallback(async (id: string, fields: Partial<Calendario>) => {
    try {
      const res = await fetch('/api/calendarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setCalendars(prev => prev.map(c => c.id === id ? data.data : c))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error || 'Error al actualizar calendario' }
    } catch (err) {
      console.error('[Calendarios] Error updating:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar calendario' }
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/calendarios?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCalendars(prev => prev.filter(c => c.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error || 'Error al eliminar calendario' }
    } catch (err) {
      console.error('[Calendarios] Error deleting:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error al eliminar calendario' }
    }
  }, [])

  return {
    calendars,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchCalendars,
  }
}