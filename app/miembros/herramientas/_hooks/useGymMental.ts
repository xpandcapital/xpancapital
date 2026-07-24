"use client"

import { useCallback, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function useGymMental() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const registrar = useCallback(async (tipo: string, score: Record<string, number> = {}) => {
    if (!user?.id) return false
    setSaving(true)
    try {
      await fetch('/api/miembros/gym-mental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, tipo, score }),
      })
      return true
    } catch { return false }
    finally { setSaving(false) }
  }, [user?.id])

  return { registrar, saving }
}
