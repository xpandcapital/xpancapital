import { useState, useCallback } from 'react'
import type { EmailCuenta, EmailServerConfig } from '../_types'

function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 10000): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout: el servidor no responde')), timeoutMs)
    fetch(url, options).then(res => { clearTimeout(timer); resolve(res) }).catch(e => { clearTimeout(timer); reject(e) })
  })
}

export function useCorreoCuenta() {
  const [cuentas, setCuentas] = useState<EmailCuenta[]>([])
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
      return data as EmailCuenta[]
    } catch (e: any) {
      setError(e.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const conectarCuenta = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/api/correo/cuentas/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
      setCuentas(prev => prev.filter(c => c.id !== id))
      if (cuentaActiva?.id === id) setCuentaActiva(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [cuentaActiva])

  const seleccionarCuenta = useCallback((cuenta: EmailCuenta) => {
    setCuentaActiva(cuenta)
  }, [])

  return {
    cuentas,
    cuentaActiva,
    loading,
    error,
    cargarCuentas,
    conectarCuenta,
    desconectarCuenta,
    seleccionarCuenta,
    setError,
  }
}
