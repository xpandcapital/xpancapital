import { useState, useCallback } from 'react'
import type { EmailMessageFull, EmailTranslateResult } from '../_types'

export function useCorreoMensaje() {
  const [mensaje, setMensaje] = useState<EmailMessageFull | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [traduccion, setTraduccion] = useState<EmailTranslateResult | null>(null)
  const [traduciendo, setTraduciendo] = useState(false)
  const [mostrarTraduccion, setMostrarTraduccion] = useState(false)

  const cargarMensaje = useCallback(async (
    cuentaId: string,
    uid: number,
    folder?: string
  ) => {
    const cacheKey = `blis_correo_full_${cuentaId}_${uid}`
    let gotCache = false

    // Si es un mensaje nuevo (diferente UID), limpiar el anterior y mostrar skeleton
    setMensaje(prev => {
      if (prev && prev.uid !== uid) return null
      return prev
    })

    // Mostrar cache al instante (sin loading si ya tenemos algo)
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.uid === uid) {
          setMensaje(parsed)
          setMostrarTraduccion(false)
          setTraduccion(null)
          gotCache = true
        }
      }
    } catch {}

    // Solo mostrar spinner si no hay cache
    if (!gotCache) setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        cuenta_id: cuentaId,
        folder: folder || 'INBOX',
      })
      const res = await fetch(`/api/correo/messages/${uid}?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar mensaje')
      setMensaje(data)

      // Guardar en cache local
      try { localStorage.setItem(cacheKey, JSON.stringify(data)) } catch {}
      return data as EmailMessageFull
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const marcarComoLeido = useCallback(async (
    cuentaId: string,
    uid: number,
    folder?: string
  ) => {
    try {
      await fetch(`/api/correo/messages/${uid}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuenta_id: cuentaId, folder: folder || 'INBOX' }),
      })
    } catch {}
  }, [])

  const traducirMensaje = useCallback(async (
    html?: string,
    text?: string
  ) => {
    if (!html && !text) return null

    setTraduciendo(true)
    try {
      const res = await fetch('/api/correo/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: html || '',
          text: text || '',
          targetLang: 'es',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al traducir')

      setTraduccion(data)
      setMostrarTraduccion(true)
      return data as EmailTranslateResult
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setTraduciendo(false)
    }
  }, [])

  const toggleTraduccion = useCallback(() => {
    if (mostrarTraduccion) {
      setMostrarTraduccion(false)
    } else if (traduccion) {
      setMostrarTraduccion(true)
    } else {
      traducirMensaje(mensaje?.html, mensaje?.text)
    }
  }, [mostrarTraduccion, traduccion, traducirMensaje, mensaje])

  const verOriginal = useCallback(() => {
    setMostrarTraduccion(false)
  }, [])

  return {
    mensaje, loading, error, traduccion, traduciendo, mostrarTraduccion,
    cargarMensaje, marcarComoLeido, traducirMensaje, toggleTraduccion, verOriginal, setError,
    setMensaje,
  }
}
