import { useState, useCallback } from 'react'

export interface UserStats {
  cursosCompletados: number
  cursosInscritos: number
  documentosDescargados: number
  tiempoEstudio: number // en horas
  blisCoins: number
  nivelInversor: string
  totalCompras: number
  totalGastado: number
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const [comprasRes, cursosRes, profileRes] = await Promise.all([
        fetch(`/api/compras?user_id=${userId}`),
        fetch(`/api/cursos?user_id=${userId}`),
        fetch(`/api/profile/${userId}`)
      ])

      const comprasData = await comprasRes.json()
      const cursosData = await cursosRes.json()
      const profileData = await profileRes.json()

      const completedPurchases = (comprasData.data || []).filter(
        (c: { estado: string }) => c.estado === 'completado'
      )

      const cursosInscritos = (cursosData.data || []).filter(
        (c: { progreso?: { progreso: number } }) => c.progreso && c.progreso.progreso > 0
      )

      const cursosCompletados = cursosInscritos.filter(
        (c: { progreso?: { progreso: number } }) => c.progreso && c.progreso.progreso >= 100
      )

      const blisCoins = profileData?.data?.blis_coins || 0
      const nivelInversor = blisCoins >= 5000 ? 'Platinum' : 
                           blisCoins >= 2000 ? 'Gold' : 
                           blisCoins >= 500 ? 'Silver' : 'Bronze'

      const userStats: UserStats = {
        cursosCompletados: cursosCompletados.length,
        cursosInscritos: cursosInscritos.length,
        documentosDescargados: completedPurchases.filter(
          (p: { items?: Array<{ producto: { tipo: string } }> }) => 
            p.items?.some(i => i.producto?.tipo === 'digital')
        ).length,
        tiempoEstudio: cursosCompletados.length * 2,
        blisCoins,
        nivelInversor,
        totalCompras: profileData?.data?.total_compras || completedPurchases.length,
        totalGastado: profileData?.data?.total_gastado_usd || completedPurchases.reduce(
          (acc: number, p: { monto_usd: number }) => acc + (p.monto_usd || 0), 0
        )
      }

      setStats(userStats)
      return userStats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    error,
    fetchUserStats
  }
}

export default useUserStats