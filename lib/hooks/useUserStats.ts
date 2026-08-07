import { useState, useCallback } from 'react'

export interface CursoActivo {
  nombre: string
  slug: string
  progreso: number
  imagen_principal?: string
}

export interface UserStats {
  productosAdquiridos: number
  cursosCompletados: number
  cursosInscritos: number
  cursoActivo: CursoActivo | null
  xpandCoins: number
  totalInvertido: number
  plusvaliaEstimada: number
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

      const totalInvertido = completedPurchases.reduce(
        (acc: number, c: { monto_usd: number }) => acc + (c.monto_usd || 0), 0
      )

      const productosIds = new Set<string>()
      completedPurchases.forEach((c: { items?: Array<{ producto_id: string }> }) =>
        (c.items || []).forEach(i => { if (i.producto_id) productosIds.add(i.producto_id) })
      )

      const productosAdquiridos = productosIds.size

      const cursosUsuario = cursosData.data || []
      const cursosInscritos = cursosUsuario.filter(
        (c: { progreso?: { progreso: number } }) => c.progreso && c.progreso.progreso > 0
      )

      const cursosCompletados = cursosInscritos.filter(
        (c: { progreso?: { progreso: number } }) => c.progreso && c.progreso.progreso >= 100
      )

      const cursoEnProgreso = cursosInscritos.find(
        (c: { progreso?: { progreso: number } }) => c.progreso && c.progreso.progreso < 100
      )

      const cursoActivo: CursoActivo | null = cursoEnProgreso ? {
        nombre: cursoEnProgreso.nombre,
        slug: cursoEnProgreso.slug,
        progreso: cursoEnProgreso.progreso?.progreso || 0,
        imagen_principal: cursoEnProgreso.imagen_principal
      } : null

      const xpandCoins = profileData?.data?.xpand_coins || 0
      const plusvaliaEstimada = totalInvertido * 10

      const userStats: UserStats = {
        productosAdquiridos,
        cursosCompletados: cursosCompletados.length,
        cursosInscritos: cursosInscritos.length,
        cursoActivo,
        xpandCoins,
        totalInvertido,
        plusvaliaEstimada
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
