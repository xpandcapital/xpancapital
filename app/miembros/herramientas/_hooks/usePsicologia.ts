"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface EvaluacionPsicologica {
  id: string
  user_id: string
  empresa_id: string | null
  fecha: string
  estado_emocional: string | null
  presiones_externas: string | null
  eventos_manana: string | null
  puntaje_flujo: number | null
  estado_emocional_tags: string[] | null
  presiones_externas_tags: string[] | null
  eventos_manana_tags: string[] | null
  perspectiva_diario: string | null
  perspectiva_4h: string | null
  perspectiva_15m: string | null
  resultado_diario: string | null
  resultado_4h: string | null
  resultado_15m: string | null
  perspectiva_correcta: string | null
  operaciones_registradas: string | null
  errores_cometidos: string | null
  es_falencia: boolean
  rendimiento_general: string | null
  creado_en: string
  actualizado_en: string
}

const FALENCIA_KEYWORDS = ['error', 'fallé', 'rompí', 'fuera de plan', 'no debí', 'equivocado', 'mal', 'perdí', 'rompi', 'falle', 'perdi', 'no cumpli']

function detectarFalencia(texto: string | null): boolean {
  if (!texto) return false
  const lower = texto.toLowerCase()
  return FALENCIA_KEYWORDS.some(k => lower.includes(k))
}

export function usePsicologia() {
  const { user } = useAuth()
  const [evaluacionHoy, setEvaluacionHoy] = useState<EvaluacionPsicologica | null>(null)
  const [historial, setHistorial] = useState<EvaluacionPsicologica[]>([])
  const [periodoStats, setPeriodoStats] = useState<EvaluacionPsicologica[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<'success' | 'error' | null>(null)
  const [lastError, setLastError] = useState('')
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
      const res = await fetch(`/api/miembros/psicologia?user_id=${user.id}&fecha=${hoy}`, {
        signal: controller.signal,
      })
      const data = await res.json()
      if (data.success) setEvaluacionHoy(data.data)
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setLastError('Error al cargar')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [user?.id, hoy])

  useEffect(() => {
    if (user?.id) fetchHoy()
    return () => { abortRef.current?.abort() }
  }, [user?.id, fetchHoy])

  const fetchPeriodo = useCallback(async (periodo: string) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/miembros/psicologia?user_id=${user.id}&periodo=${periodo}`)
      const data = await res.json()
      if (data.success) setPeriodoStats(data.data || [])
    } catch { /* silencioso */ }
  }, [user?.id])

  // Cargar últimos 30 días al inicio para la gráfica
  useEffect(() => {
    if (user?.id) fetchPeriodo('30d')
  }, [user?.id, fetchPeriodo])

  const guardarPreSesion = useCallback(async (fields: {
    estado_emocional: string; presiones_externas: string;
    eventos_manana: string; puntaje_flujo: number;
    estado_emocional_tags?: string[];
    presiones_externas_tags?: string[];
    eventos_manana_tags?: string[];
  }): Promise<boolean> => {
    if (!user?.id) return false
    setSaving(true)
    setLastSave(null)
    setLastError('')

    try {
      const res = await fetch('/api/miembros/psicologia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          fecha: hoy,
          ...fields,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setLastSave('success')
        setEvaluacionHoy(data.data)
        return true
      } else {
        setLastSave('error')
        setLastError(data.error || 'Error al guardar')
        return false
      }
    } catch (e: unknown) {
      setLastSave('error')
      setLastError(e instanceof Error ? e.message : 'Error de conexión')
      return false
    } finally {
      setSaving(false)
    }
  }, [user?.id, hoy])

  const guardarPostSesion = useCallback(async (fields: {
    perspectiva_diario: string; perspectiva_4h: string; perspectiva_15m: string;
    resultado_diario: string; resultado_4h: string; resultado_15m: string;
    perspectiva_correcta: string; operaciones_registradas: string;
    errores_cometidos: string; rendimiento_general: string;
  }): Promise<boolean> => {
    if (!user?.id || !evaluacionHoy?.id) return false
    setSaving(true)
    setLastSave(null)
    setLastError('')

    const es_falencia = detectarFalencia(fields.errores_cometidos)

    try {
      const res = await fetch('/api/miembros/psicologia', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: evaluacionHoy.id,
          ...fields,
          es_falencia,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setLastSave('success')
        setEvaluacionHoy(data.data)
        return true
      } else {
        setLastSave('error')
        setLastError(data.error || 'Error al guardar')
        return false
      }
    } catch (e: unknown) {
      setLastSave('error')
      setLastError(e instanceof Error ? e.message : 'Error de conexión')
      return false
    } finally {
      setSaving(false)
    }
  }, [user?.id, evaluacionHoy?.id])

  return {
    evaluacionHoy, loading, saving, lastSave, lastError,
    clearSaveStatus: () => setLastSave(null),
    guardarPreSesion, guardarPostSesion,
    periodoStats, fetchPeriodo,
  }
}
