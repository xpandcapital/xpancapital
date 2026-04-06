import { useState, useEffect, useCallback } from 'react'

export interface Referral {
  id: string
  referido_id: string
  estado: string
  codigo_referido: string
  creado_en: string
  referido?: {
    id: string
    nombre: string
    apellido: string
    avatar_url?: string
    creado_en: string
  }
}

export interface Commission {
  id: string
  referido_id: string
  monto: number
  tipo: string
  pagado: boolean
  creado_en: string
}

export interface ReferralInfo {
  referralCode: string
  referralLink: string
  totalReferrals: number
  totalEarned: number
  referrals: Referral[]
  commissions: Commission[]
}

export function useReferrals(userId: string | null) {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferralInfo = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/referidos?user_id=${userId}`)
      const data = await response.json()

      if (data.success) {
        setReferralInfo(data.data)
      } else {
        setError(data.error || 'Error al cargar información de referidos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const validateReferralCode = useCallback(async (code: string) => {
    try {
      const response = await fetch(`/api/referidos?code=${code}`, { method: 'PUT' })
      const data = await response.json()
      return data
    } catch (err) {
      return { valid: false, message: 'Error al validar código' }
    }
  }, [])

  const useReferralCode = useCallback(async (code: string) => {
    if (!userId) return { success: false, error: 'Usuario no autenticado' }

    setLoading(true)
    try {
      const response = await fetch('/api/referidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, referral_code: code })
      })
      const data = await response.json()

      if (data.success) {
        await fetchReferralInfo()
      }

      return data
    } catch (err) {
      return { success: false, error: 'Error al usar código de referido' }
    } finally {
      setLoading(false)
    }
  }, [userId, fetchReferralInfo])

  useEffect(() => {
    if (userId) {
      fetchReferralInfo()
    }
  }, [userId, fetchReferralInfo])

  return {
    referralInfo,
    loading,
    error,
    fetchReferralInfo,
    validateReferralCode,
    useReferralCode
  }
}

export default useReferrals