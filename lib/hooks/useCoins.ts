import { useState, useCallback } from 'react'

export interface CoinTransaction {
  id: string
  user_id: string
  tipo: 'compra' | 'lectura' | 'referido' | 'comision' | 'canje' | 'bonificacion'
  monto: number
  descripcion?: string
  referencia_id?: string
  referencia_tipo?: string
  creado_en: string
}

export interface CoinBalance {
  balance: number
  pendiente: number
  total_ganado: number
  total_gastado: number
}

export function useCoins(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/coins/balance?user_id=${userId}`)
      const data = await response.json()

      if (data.success) {
        setBalance(data.data.balance)
      } else {
        setError(data.error || 'Error al obtener balance')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchTransactions = useCallback(async (limit = 20, offset = 0) => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/coins/transactions?user_id=${userId}&limit=${limit}&offset=${offset}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data)
      } else {
        setError(data.error || 'Error al obtener transacciones')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const addCoins = useCallback(async (amount: number, tipo: CoinTransaction['tipo'], descripcion?: string, referenciaId?: string) => {
    if (!userId) return { success: false, error: 'Usuario no autenticado' }

    try {
      const response = await fetch('/api/coins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          monto: amount,
          tipo,
          descripcion,
          referencia_id: referenciaId
        })
      })

      const data = await response.json()

      if (data.success) {
        setBalance(prev => prev + amount)
        return { success: true, balance: data.data.balance }
      }

      return { success: false, error: data.error || 'Error al agregar coins' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [userId])

  const spendCoins = useCallback(async (amount: number, tipo: 'canje', descripcion?: string, referenciaId?: string) => {
    if (!userId) return { success: false, error: 'Usuario no autenticado' }

    if (balance < amount) {
      return { success: false, error: 'Saldo insuficiente' }
    }

    try {
      const response = await fetch('/api/coins/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          monto: -amount,
          tipo,
          descripcion,
          referencia_id: referenciaId
        })
      })

      const data = await response.json()

      if (data.success) {
        setBalance(prev => prev - amount)
        return { success: true, balance: data.data.balance }
      }

      return { success: false, error: data.error || 'Error al gastar coins' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [userId, balance])

  return {
    balance,
    transactions,
    loading,
    error,
    fetchBalance,
    fetchTransactions,
    addCoins,
    spendCoins
  }
}

export default useCoins