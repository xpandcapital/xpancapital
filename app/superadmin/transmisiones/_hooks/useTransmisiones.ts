"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Transmision, TransmisionFormData } from '../_types'

export function useTransmisiones(empresaId: string) {
  const [transmisionActiva, setTransmisionActiva] = useState<Transmision | null>(null)
  const [historial, setHistorial] = useState<Transmision[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchEstado = useCallback(async () => {
    try {
      const res = await fetch(`/api/transmisiones?empresa_id=${empresaId}`)
      const data = await res.json()
      if (data.success) {
        setTransmisionActiva(data.data || null)
      }
    } catch {
      // Silencioso
    }
  }, [empresaId])

  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('transmisiones')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('creado_en', { ascending: false })
        .limit(50)

      if (!error && data) {
        setHistorial(data as Transmision[])
      }
    } catch {
      // Silencioso
    }
    setLoading(false)
  }, [empresaId])

  useEffect(() => {
    fetchEstado()
    fetchHistorial()
  }, [fetchEstado, fetchHistorial])

  // Realtime subscription
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('transmisiones-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transmisiones',
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => {
          fetchEstado()
          fetchHistorial()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [empresaId, fetchEstado, fetchHistorial])

  const iniciarTransmision = async (form: TransmisionFormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/transmisiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data as Transmision
    } finally {
      setSaving(false)
    }
  }

  const extenderTransmision = async (id: string, minutos: number) => {
    try {
      const res = await fetch('/api/transmisiones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, extender_minutos: minutos }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
    } catch (e) {
      throw e
    }
  }

  const cancelarTransmision = async (id: string) => {
    try {
      const res = await fetch('/api/transmisiones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cancelar: true }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
    } catch (e) {
      throw e
    }
  }

  const eliminarTransmision = async (id: string) => {
    try {
      const res = await fetch(`/api/transmisiones?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setHistorial((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      throw e
    }
  }

  return {
    transmisionActiva,
    historial,
    loading,
    saving,
    iniciarTransmision,
    extenderTransmision,
    cancelarTransmision,
    eliminarTransmision,
  }
}
