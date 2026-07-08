import { useState, useEffect, useCallback } from 'react'
import type { RankingEntry, GamificacionConfig, GamificacionPuntos, GamificacionLogroUsuario } from '@/lib/types/database'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

interface GamificacionStats {
  puntos: number
  puntos_nivel: number
  puntos_cursos: number
  puntos_comunidad: number
  puntos_blog: number
  nivelActual: number
  nivelNombre: string
  nivelColor: string
  nivelIcono?: string
  nivelImagen?: string
  progresoNivelPct: number
  puntosParaSiguienteNivel: number
  rachaDias: number
  rankingPosicion: number | null
  rankingTotal: number
  logrosDesbloqueados: GamificacionLogroUsuario[]
}

const API = '/api/gamificacion'

export function useGamificacionStats(userId: string | undefined) {
  const [stats, setStats] = useState<GamificacionStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const res = await fetch(`${API}/stats?user_id=${userId}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) setStats(json.data)
      }
    } catch (err) {
      console.error('[useGamificacionStats] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}

export function useRanking(empresaId: string | undefined, userId?: string) {
  const [top10, setTop10] = useState<RankingEntry[]>([])
  const [vecinos, setVecinos] = useState<RankingEntry[]>([])
  const [ownEntry, setOwnEntry] = useState<RankingEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRanking = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('empresa_id', empresaId || DEFAULT_EMPRESA_ID)
      if (userId) params.set('user_id', userId)
      const res = await fetch(`${API}/ranking?${params}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setTop10(json.data.top10 || [])
          setVecinos(json.data.vecinos || [])
          setOwnEntry(json.data.own || null)
        }
      }
    } catch (err) {
      console.error('[useRanking] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, userId])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  return { top10, vecinos, ownEntry, loading, refetch: fetchRanking }
}

export function useGamificacionConfig(empresaId: string | undefined) {
  const [config, setConfig] = useState<GamificacionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    if (!empresaId) { setLoading(false); return }
    try {
      const res = await fetch(`/api/admin/gamificacion/config?empresa_id=${empresaId}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) setConfig(json.data)
      }
    } catch (err) {
      console.error('[useGamificacionConfig] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = async (updates: Partial<GamificacionConfig>) => {
    if (!config?.empresa_id) return null
    const res = await fetch('/api/admin/gamificacion/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, empresa_id: config.empresa_id }),
    })
    const json = await res.json()
    if (json.success) setConfig(json.data)
    return json
  }

  return { config, loading, updateConfig, refetch: fetchConfig }
}

export function usePuntosHistorial(userId: string | undefined, limit = 50) {
  const [puntos, setPuntos] = useState<GamificacionPuntos[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPuntos = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const res = await fetch(`${API}/puntos?user_id=${userId}&limit=${limit}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) setPuntos(json.data)
      }
    } catch (err) {
      console.error('[usePuntosHistorial] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => {
    fetchPuntos()
  }, [fetchPuntos])

  return { puntos, loading, refetch: fetchPuntos }
}
