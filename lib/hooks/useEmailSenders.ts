import { useState, useCallback } from 'react'

interface EmailSender {
  id: string
  nombre: string
  from_name: string
  from_email: string
  provider: 'smtp' | 'resend' | 'sendgrid'
  smtp_host?: string
  smtp_port?: number
  smtp_user?: string
  smtp_pass?: string
  api_key?: string
  is_default: boolean
  creado_en: string
  actualizado_en: string
}

export function useEmailSenders() {
  const [senders, setSenders] = useState<EmailSender[]>([])
  const [loading, setLoading] = useState(false)

  const getSenders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/email-senders')
      const data = await res.json()
      if (Array.isArray(data)) {
        setSenders(data)
        return data
      }
      return []
    } catch (e) {
      console.error('Error loading senders:', e)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSender = useCallback(async (sender: Partial<EmailSender>) => {
    setLoading(true)
    try {
      const isUpdate = !!sender.id
      const res = await fetch('/api/email-senders', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sender)
      })
      const data = await res.json()
      if (data.id) {
        await getSenders()
        return data
      }
      return null
    } catch (e) {
      console.error('Error saving sender:', e)
      return null
    } finally {
      setLoading(false)
    }
  }, [getSenders])

  const deleteSender = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/email-senders?id=${id}`, { method: 'DELETE' })
      await getSenders()
      return true
    } catch (e) {
      console.error('Error deleting sender:', e)
      return false
    } finally {
      setLoading(false)
    }
  }, [getSenders])

  return { senders, loading, getSenders, saveSender, deleteSender }
}