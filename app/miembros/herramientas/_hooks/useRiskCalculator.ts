"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface HistoryEntry {
  id: string
  account_size: number
  account_currency: string
  currency_pair: string
  risk_ratio: number
  stop_loss_pips: number
  riesgo_usd: number
  lotes: number
  nota: string | null
  creado_en: string
  capital?: number
  entry_price?: number
  stop_loss?: number
  take_profit?: number
  riesgo_pct?: number
  distancia_sl_pct?: number
  tamano_posicion?: number
  tamano_lote?: number
  valor_posicion?: number
  apalancamiento?: number
  ratio_rr?: number
  ganancia_potencial?: number
}

interface CalculatorInputs {
  accountSize: string
  accountCurrency: string
  currencyPair: string
  riskRatio: string
  stopLossPips: string
  nota: string
}

const defaultInputs: CalculatorInputs = {
  accountSize: '',
  accountCurrency: 'USD',
  currencyPair: 'EUR/USD',
  riskRatio: '',
  stopLossPips: '',
  nota: '',
}

function calc(inputs: CalculatorInputs) {
  const accountSize = parseFloat(inputs.accountSize) || 0
  const riskRatio = parseFloat(inputs.riskRatio) || 0
  const stopLossPips = parseFloat(inputs.stopLossPips) || 0

  if (!accountSize || !stopLossPips) {
    return { riesgoUsd: 0, lotes: 0 }
  }

  const riesgoUsd = (accountSize * riskRatio) / 100

  // Para pares XXX/USD: 1 pip = $10 por lote estándar (100k unidades)
  // Para pares USD/XXX: el valor varía con el tipo de cambio, simplificamos a $10
  const pipValuePerStandardLot = 10
  const lotes = riesgoUsd / (stopLossPips * pipValuePerStandardLot)

  return {
    riesgoUsd: Math.round(riesgoUsd * 100) / 100,
    lotes: Math.round(lotes * 10000) / 10000,
  }
}

export function useRiskCalculator() {
  const { user } = useAuth()
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<'success' | 'error' | null>(null)
  const [lastError, setLastError] = useState('')

  const results = useMemo(() => calc(inputs), [inputs])

  const setInput = useCallback((key: keyof CalculatorInputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
    if (lastSave) setLastSave(null)
  }, [lastSave])

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setInputs({
      accountSize: String(entry.account_size || entry.capital || ''),
      accountCurrency: entry.account_currency || 'USD',
      currencyPair: entry.currency_pair || '',
      riskRatio: String(entry.risk_ratio || entry.riesgo_pct || ''),
      stopLossPips: String(entry.stop_loss_pips || ''),
      nota: entry.nota || '',
    })
    setLastSave(null)
  }, [])

  const historyAbortRef = useRef<AbortController | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return
    historyAbortRef.current?.abort()
    const controller = new AbortController()
    historyAbortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)

    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/miembros/trading-calculations?user_id=${user.id}`, {
        signal: controller.signal
      })
      const data = await res.json()
      if (data.success) setHistory(data.data || [])
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('[RiskCalc] fetchHistory error:', e)
    } finally {
      clearTimeout(timeout)
      setHistoryLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchHistory()
    return () => { historyAbortRef.current?.abort() }
  }, [user?.id, fetchHistory])

  const saveCalculation = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setLastSave('error')
      setLastError('No has iniciado sesión')
      return false
    }

    const accountSize = parseFloat(inputs.accountSize)
    if (!accountSize || accountSize <= 0) {
      setLastSave('error')
      setLastError('El tamaño de la cuenta es requerido')
      return false
    }

    setSaving(true)
    setLastSave(null)
    setLastError('')

    try {
      const res = await fetch('/api/miembros/trading-calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          capital: accountSize,
          account_currency: inputs.accountCurrency,
          currency_pair: inputs.currencyPair,
          risk_ratio: parseFloat(inputs.riskRatio),
          stop_loss_pips: parseFloat(inputs.stopLossPips),
          riesgo_pct: parseFloat(inputs.riskRatio),
          riesgo_usd: results.riesgoUsd,
          lotes: results.lotes,
          nota: inputs.nota || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setLastSave('success')
        await fetchHistory()
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
  }, [user?.id, inputs, results, fetchHistory])

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
    history,
    historyLoading,
    saving,
    lastSave,
    lastError,
    clearSaveStatus: () => setLastSave(null),
    loadFromHistory,
    saveCalculation,
    deleteCalculation,
    fetchHistory,
  }
}
