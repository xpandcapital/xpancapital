import { useState, useEffect, useCallback } from 'react'
import type { GamificacionNivel, GamificacionConfig, GamificacionLogro, CertificadoIntento } from '@/lib/types/database'
import type { NivelFormData, LogroFormData } from '../_types'

export function useGamificacionAdmin(empresaId: string | undefined) {
  const [config, setConfig] = useState<GamificacionConfig | null>(null)
  const [niveles, setNiveles] = useState<GamificacionNivel[]>([])
  const [logros, setLogros] = useState<GamificacionLogro[]>([])
  const [intentos, setIntentos] = useState<CertificadoIntento[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!empresaId) { setLoading(false); return }
    setLoading(true)
    try {
      const [cfgRes, nivRes, logRes] = await Promise.all([
        fetch(`/api/admin/gamificacion/config?empresa_id=${empresaId}`),
        fetch(`/api/admin/gamificacion/niveles?empresa_id=${empresaId}`),
        fetch(`/api/admin/gamificacion/logros?empresa_id=${empresaId}`),
      ])

      const [cfgJson, nivJson, logJson] = await Promise.all([cfgRes.json(), nivRes.json(), logRes.json()])

      if (cfgJson.success) setConfig(cfgJson.data)
      if (nivJson.success) setNiveles(nivJson.data || [])
      if (logJson.success) setLogros(logJson.data || [])
    } catch (err) {
      console.error('[useGamificacionAdmin] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const updateConfig = async (updates: Partial<GamificacionConfig>) => {
    const res = await fetch('/api/admin/gamificacion/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, empresa_id: empresaId }),
    })
    const json = await res.json()
    if (json.success) setConfig(json.data)
    return json
  }

  const saveNivel = async (id: string | null, data: NivelFormData) => {
    const url = '/api/admin/gamificacion/niveles'
    const method = id ? 'PUT' : 'POST'
    const body = id ? { id, ...data } : { empresa_id: empresaId, ...data }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (json.success) await fetchAll()
    return json
  }

  const deleteNivel = async (id: string) => {
    const res = await fetch(`/api/admin/gamificacion/niveles?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) setNiveles(prev => prev.filter(n => n.id !== id))
    return json
  }

  const saveLogro = async (id: string | null, data: LogroFormData) => {
    const url = '/api/admin/gamificacion/logros'
    const method = id ? 'PUT' : 'POST'
    const body = id ? { id, ...data } : { empresa_id: empresaId, ...data }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (json.success) await fetchAll()
    return json
  }

  const deleteLogro = async (id: string) => {
    const res = await fetch(`/api/admin/gamificacion/logros?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) setLogros(prev => prev.filter(l => l.id !== id))
    return json
  }

  const fetchIntentos = async (userId?: string, cursoId?: string) => {
    const params = new URLSearchParams()
    if (userId) params.set('user_id', userId)
    if (cursoId) params.set('curso_id', cursoId)
    const res = await fetch(`/api/admin/certificados/intentos?${params}`)
    const json = await res.json()
    if (json.success) setIntentos(json.data || [])
    return json
  }

  const desbloquearIntentos = async (userId: string, cursoId: string) => {
    const res = await fetch('/api/admin/certificados/intentos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desbloquear: true, user_id: userId, curso_id: cursoId }),
    })
    const json = await res.json()
    if (json.success) await fetchIntentos(userId, cursoId)
    return json
  }

  return {
    config, niveles, logros, intentos, loading,
    fetchAll, updateConfig,
    saveNivel, deleteNivel,
    saveLogro, deleteLogro,
    fetchIntentos, desbloquearIntentos,
  }
}
