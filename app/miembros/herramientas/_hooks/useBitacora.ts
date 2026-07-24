"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface BitacoraEntry {
  id: string; user_id: string
  fecha_inicio: string; fecha_fin: string | null; hora: string | null
  accion: string; divisa_1: string | null; divisa_2: string | null
  riesgo_beneficio: string | null; lotaje: number | null
  perdidas_pips: number | null; ganancias_pips: number | null
  tipo_cierre: string | null; resultado_usd: number | null
  emociones: string | null; plan_trading: boolean | null; observacion: string | null
  creado_en: string
}

export interface BitacoraAnalytics {
  saldoActual: number; pnlTotal: number; pnlPct: number
  drawdown: number; drawdownPct: number
  totalTrades: number; winRate: number
  equityCurve: { fecha: string; saldo: number }[]
  paresOperados: { par: string; count: number }[]
  pnlPorPar: { par: string; pnl: number }[]
}

export function useBitacora() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<'success' | 'error' | null>(null)
  const [lastError, setLastError] = useState('')
  const [saldoInicial, setSaldoInicial] = useState(10000)
  const [saldoLoading, setSaldoLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const fetchSaldo = useCallback(async () => {
    if (!user?.id) return
    setSaldoLoading(true)
    try {
      const res = await fetch(`/api/miembros/bitacora/config?user_id=${user.id}`)
      const data = await res.json()
      if (data.success && data.data) setSaldoInicial(Number(data.data.saldo_inicial) || 10000)
    } catch { /* usar default */ }
    finally { setSaldoLoading(false) }
  }, [user?.id])

  const fetchEntries = useCallback(async () => {
    if (!user?.id) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    setLoading(true)
    try {
      const res = await fetch(`/api/miembros/bitacora?user_id=${user.id}`, { signal: controller.signal })
      const data = await res.json()
      if (data.success) setEntries(data.data || [])
    } catch (e: any) { if (e.name !== 'AbortError') setLastError('Error al cargar') }
    finally { clearTimeout(timeout); setLoading(false) }
  }, [user?.id])

  useEffect(() => { if (user?.id) { fetchEntries(); fetchSaldo() } return () => { abortRef.current?.abort() } }, [user?.id, fetchEntries, fetchSaldo])

  const saveEntry = useCallback(async (entry: Partial<BitacoraEntry> & { user_id: string }): Promise<boolean> => {
    setSaving(true); setLastSave(null); setLastError('')
    try {
      const isUpdate = !!entry.id
      const res = await fetch('/api/miembros/bitacora', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUpdate ? { ...entry, id: entry.id } : entry),
      })
      const data = await res.json()
      if (data.success) { setLastSave('success'); await fetchEntries(); return true }
      setLastSave('error'); setLastError(data.error || 'Error al guardar'); return false
    } catch (e: any) { setLastSave('error'); setLastError(e.message || 'Error de conexión'); return false }
    finally { setSaving(false) }
  }, [fetchEntries])

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/miembros/bitacora?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { setEntries(prev => prev.filter(e => e.id !== id)); return true }
      return false
    } catch { return false }
  }, [])

  const actualizarSaldo = useCallback(async (nuevoSaldo: number) => {
    if (!user?.id) return false
    try {
      const res = await fetch('/api/miembros/bitacora/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, saldo_inicial: nuevoSaldo }),
      })
      const data = await res.json()
      if (data.success) { setSaldoInicial(nuevoSaldo); return true }
      return false
    } catch { return false }
  }, [user?.id])

  // ===== ANALYTICS (todo calculado en frontend) =====
  const analytics = useMemo((): BitacoraAnalytics | null => {
    if (entries.length === 0) return null

    const sorted = [...entries].sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
    let saldo = saldoInicial
    let peak = saldoInicial
    let maxDD = 0
    const equityCurve: { fecha: string; saldo: number }[] = [{ fecha: 'Inicio', saldo: saldoInicial }]

    for (const e of sorted) {
      saldo += (e.resultado_usd || 0)
      equityCurve.push({ fecha: e.fecha_inicio, saldo: Math.round(saldo * 100) / 100 })
      if (saldo > peak) peak = saldo
      const dd = peak - saldo
      if (dd > maxDD) maxDD = dd
    }

    const saldoActual = Math.round(saldo * 100) / 100
    const pnlTotal = Math.round((saldoActual - saldoInicial) * 100) / 100
    const pnlPct = Math.round((pnlTotal / saldoInicial) * 10000) / 100
    const wins = entries.filter(e => (e.resultado_usd || 0) > 0).length
    const winRate = Math.round((wins / entries.length) * 100)

    // Pares operados
    const paresMap = new Map<string, number>()
    const pnlMap = new Map<string, number>()
    for (const e of entries) {
      const par = e.divisa_1 && e.divisa_2 ? `${e.divisa_1}/${e.divisa_2}` : '?'
      paresMap.set(par, (paresMap.get(par) || 0) + 1)
      pnlMap.set(par, Math.round(((pnlMap.get(par) || 0) + (e.resultado_usd || 0)) * 100) / 100)
    }
    const paresOperados = [...paresMap.entries()].map(([par, count]) => ({ par, count })).sort((a, b) => b.count - a.count)
    const pnlPorPar = [...pnlMap.entries()].map(([par, pnl]) => ({ par, pnl })).sort((a, b) => b.pnl - a.pnl)

    return {
      saldoActual, pnlTotal, pnlPct,
      drawdown: Math.round(maxDD * 100) / 100,
      drawdownPct: peak > 0 ? Math.round((maxDD / peak) * 10000) / 100 : 0,
      totalTrades: entries.length, winRate,
      equityCurve, paresOperados, pnlPorPar,
    }
  }, [entries, saldoInicial])

  return {
    entries, loading, saving, lastSave, lastError,
    clearSaveStatus: () => setLastSave(null),
    saveEntry, deleteEntry, fetchEntries,
    saldoInicial, saldoLoading, actualizarSaldo,
    analytics,
  }
}
