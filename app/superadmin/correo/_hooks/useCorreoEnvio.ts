import { useState, useCallback } from 'react'
import type { ReplyPayload } from '../_types'

export function useCorreoEnvio() {
  const [sending, setSending] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const enviarRespuesta = useCallback(async (
    uid: number,
    payload: ReplyPayload
  ) => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/correo/messages/${uid}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      return data
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setSending(false)
    }
  }, [])

  const ejecutarAccion = useCallback(async (
    cuentaId: string,
    folder: string,
    action: string,
    uids: number[]
  ) => {
    setError(null)
    try {
      const res = await fetch('/api/correo/messages/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuenta_id: cuentaId, folder, action, uids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en la acción')
      return data
    } catch (e: any) {
      setError(e.message)
      throw e
    }
  }, [])

  const redactarConIA = useCallback(async (
    originalEmail: { from?: string; subject?: string; text?: string; html?: string },
    instructions: string
  ) => {
    setDrafting(true)
    setError(null)
    try {
      const res = await fetch('/api/correo/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalEmail, instructions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al redactar')
      setDraftText(data.draft || '')
      return data.draft || ''
    } catch (e: any) {
      setError(e.message)
      return ''
    } finally {
      setDrafting(false)
    }
  }, [])

  return {
    sending,
    drafting,
    draftText,
    error,
    enviarRespuesta,
    ejecutarAccion,
    redactarConIA,
    setDraftText,
    setError,
  }
}
