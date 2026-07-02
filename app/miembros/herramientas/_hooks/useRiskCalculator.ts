"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'

const LOT_SIZES: Record<string, number> = {
  forex_std: 100000,
  forex_mini: 10000,
  forex_micro: 1000,
  crypto: 1,
  custom: 100000,
}

interface HistoryEntry {
  id: string
  capital: number
  entry_price: number
  stop_loss: number
  take_profit: number | null
  riesgo_pct: number
  riesgo_usd: number
  distancia_sl_pct: number
  tamano_posicion: number
  lotes: number
  tamano_lote: number
  valor_posicion: number
  apalancamiento: number | null
  ratio_rr: number | null
  distancia_tp_pct: number | null
  ganancia_potencial: number | null
  nota: string | null
  creado_en: string
}

interface CalculatorInputs {
  capital: string
  riesgoPct: string
  entryPrice: string
  stopLoss: string
  takeProfit: string
  lotType: string
  nota: string
}

const defaultInputs: CalculatorInputs = {
  capital: '10000',
  riesgoPct: '1',
  entryPrice: '50',
  stopLoss: '48.5',
  takeProfit: '',
  lotType: 'forex_std',
  nota: '',
}

function calc(inputs: CalculatorInputs, lotSize: number) {
  const capital = parseFloat(inputs.capital) || 0
  const riesgoPct = parseFloat(inputs.riesgoPct) || 0
  const entryPrice = parseFloat(inputs.entryPrice) || 0
  const stopLoss = parseFloat(inputs.stopLoss) || 0
  const takeProfit = parseFloat(inputs.takeProfit) || 0

  if (!capital || !entryPrice || !stopLoss || entryPrice === stopLoss) {
    return {
      riesgoUsd: 0,
      distanciaSlPct: 0,
      tamanoPosicion: 0,
      lotes: 0,
      valorPosicion: 0,
      apalancamiento: 0,
      ratioRr: null as number | null,
      distanciaTpPct: null as number | null,
      gananciaPotencial: null as number | null,
    }
  }

  const riesgoUsd = (capital * riesgoPct) / 100
  const distanciaSlPct = ((entryPrice - stopLoss) / entryPrice) * 100
  const tamanoPosicion = riesgoUsd / Math.abs(entryPrice - stopLoss)
  const lotes = lotSize > 0 ? tamanoPosicion / lotSize : 0
  const valorPosicion = tamanoPosicion * entryPrice
  const apalancamiento = capital > 0 ? valorPosicion / capital : 0

  let ratioRr: number | null = null
  let distanciaTpPct: number | null = null
  let gananciaPotencial: number | null = null

  if (takeProfit && takeProfit !== entryPrice) {
    distanciaTpPct = ((takeProfit - entryPrice) / entryPrice) * 100
    gananciaPotencial = tamanoPosicion * Math.abs(takeProfit - entryPrice)
    if (distanciaSlPct !== 0) {
      ratioRr = Math.abs(distanciaTpPct / distanciaSlPct)
    }
  }

  return {
    riesgoUsd,
    distanciaSlPct,
    tamanoPosicion,
    lotes,
    valorPosicion,
    apalancamiento,
    ratioRr,
    distanciaTpPct,
    gananciaPotencial,
  }
}

export function useRiskCalculator() {
  const { user } = useAuth()
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const lotSize = LOT_SIZES[inputs.lotType] || 100000
  const results = useMemo(() => calc(inputs, lotSize), [inputs, lotSize])

  const setInput = useCallback((key: keyof CalculatorInputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }, [])

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setInputs({
      capital: String(entry.capital),
      riesgoPct: String(entry.riesgo_pct),
      entryPrice: String(entry.entry_price),
      stopLoss: String(entry.stop_loss),
      takeProfit: entry.take_profit ? String(entry.take_profit) : '',
      lotType: entry.tamano_lote === 100000 ? 'forex_std' :
               entry.tamano_lote === 10000 ? 'forex_mini' :
               entry.tamano_lote === 1000 ? 'forex_micro' :
               entry.tamano_lote === 1 ? 'crypto' : 'custom',
      nota: entry.nota || '',
    })
  }, [])

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/miembros/trading-calculations?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) setHistory(data.data || [])
    } catch { /* silencioso */ }
    finally { setHistoryLoading(false) }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchHistory()
  }, [user?.id, fetchHistory])

  const saveCalculation = useCallback(async () => {
    if (!user?.id) return false
    setSaving(true)
    try {
      const res = await fetch('/api/miembros/trading-calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          capital: parseFloat(inputs.capital),
          entry_price: parseFloat(inputs.entryPrice),
          stop_loss: parseFloat(inputs.stopLoss),
          take_profit: inputs.takeProfit ? parseFloat(inputs.takeProfit) : null,
          riesgo_pct: parseFloat(inputs.riesgoPct),
          riesgo_usd: results.riesgoUsd,
          distancia_sl_pct: results.distanciaSlPct,
          tamano_posicion: results.tamanoPosicion,
          lotes: results.lotes,
          tamano_lote: lotSize,
          valor_posicion: results.valorPosicion,
          apalancamiento: results.apalancamiento,
          ratio_rr: results.ratioRr,
          distancia_tp_pct: results.distanciaTpPct,
          ganancia_potencial: results.gananciaPotencial,
          nota: inputs.nota || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchHistory()
        return true
      }
      return false
    } catch { return false }
    finally { setSaving(false) }
  }, [user?.id, inputs, results, lotSize, fetchHistory])

  const deleteCalculation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/miembros/trading-calculations?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setHistory(prev => prev.filter(h => h.id !== id))
        return true
      }
      return false
    } catch { return false }
  }, [])

  return {
    inputs,
    setInput,
    results,
    lotSize,
    lotTypes: LOT_SIZES,
    history,
    historyLoading,
    saving,
    loadFromHistory,
    saveCalculation,
    deleteCalculation,
    fetchHistory,
  }
}
