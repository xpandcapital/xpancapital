import { useState, useCallback } from 'react'
import type { EmailCuenta, EmailServerConfig } from '../_types'

const CACHE_KEY = 'blis_correo_cuentas'
const ORDER_KEY = 'blis_correo_order'

function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 10000): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout: el servidor no responde')), timeoutMs)
    fetch(url, options).then(res => { clearTimeout(timer); resolve(res) }).catch(e => { clearTimeout(timer); reject(e) })
  })
}

function cacheCuentas(cuentas: EmailCuenta[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cuentas))
  } catch {}
}

function getCachedCuentas(): EmailCuenta[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useCorreoCuenta() {
  const [cuentas, setCuentas] = useState<EmailCuenta[]>(() => getCachedCuentas())
  const [cuentaActiva, setCuentaActiva] = useState<EmailCuenta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarCuentas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/api/correo/cuentas')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar cuentas')
      setCuentas(data)
      cacheCuentas(data)
      return data as EmailCuenta[]
    } catch (e: any) {
      setError(e.message)
      // Fallback a localStorage si Supabase falla
      const cached = getCachedCuentas()
      if (cached.length > 0) {
        setCuentas(cached)
        return cached as EmailCuenta[]
      }
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const conectarCuenta = useCallback(async (email: string, password: string, nombre_mostrado?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/api/correo/cuentas/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre_mostrado }),
      }, 15000)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al conectar')
      return data
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const desconectarCuenta = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/correo/cuentas?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const nuevas = cuentas.filter(c => c.id !== id)
      setCuentas(nuevas)
      cacheCuentas(nuevas)
      if (cuentaActiva?.id === id) setCuentaActiva(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [cuentaActiva, cuentas])

  const seleccionarCuenta = useCallback((cuenta: EmailCuenta) => {
    setCuentaActiva(cuenta)
  }, [])

  const getOrder = (): string[] => {
    try { const raw = localStorage.getItem(ORDER_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
  }

  const saveOrder = (ids: string[]) => {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(ids)) } catch {}
  }

  const cuentasOrdenadas = (() => {
    const order = getOrder()
    if (order.length === 0) return cuentas
    const ordered = [...cuentas].sort((a, b) => {
      const ai = order.indexOf(a.id); const bi = order.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return ordered
  })()

  const moverCuentaArriba = (id: string) => {
    const order = getOrder()
    if (order.length === 0) order.push(...cuentas.map(c => c.id))
    const idx = order.indexOf(id)
    if (idx > 0) {
      [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]]
      saveOrder(order)
      setCuentas(prev => {
        const clone = [...prev]
        const prevIdx = clone.findIndex(c => c.id === id)
        if (prevIdx > 0) [clone[prevIdx - 1], clone[prevIdx]] = [clone[prevIdx], clone[prevIdx - 1]]
        return clone
      })
    }
  }

  const moverCuentaAbajo = (id: string) => {
    const order = getOrder()
    if (order.length === 0) order.push(...cuentas.map(c => c.id))
    const idx = order.indexOf(id)
    if (idx >= 0 && idx < order.length - 1) {
      [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]]
      saveOrder(order)
      setCuentas(prev => {
        const clone = [...prev]
        const prevIdx = clone.findIndex(c => c.id === id)
        if (prevIdx >= 0 && prevIdx < clone.length - 1) [clone[prevIdx], clone[prevIdx + 1]] = [clone[prevIdx + 1], clone[prevIdx]]
        return clone
      })
    }
  }

  return {
    cuentas: cuentasOrdenadas, cuentaActiva, loading, error,
    cargarCuentas, conectarCuenta, desconectarCuenta, seleccionarCuenta,
    moverCuentaArriba, moverCuentaAbajo, setError,
  }
}
