import { useState, useEffect, useCallback } from 'react'

export interface Compra {
  id: string
  user_id: string
  producto_id: string
  metodo_pago: string
  monto_coins: number
  monto_usd: number
  estado: 'pendiente' | 'completado' | 'cancelado' | 'reembolsado'
  creado_en: string
  producto?: {
    id: string
    nombre: string
    imagen_principal?: string
  }
}

export interface CompraWithItems extends Compra {
  items?: Array<{
    cantidad: number
    precio_unitario: number
    product_type?: string
    producto: {
      id: string
      nombre: string
      imagen_principal?: string
      tipo?: string
      archivo_url?: string
      categoria?: { nombre: string }
    }
  }>
}

export function useCompras() {
  const [compras, setCompras] = useState<CompraWithItems[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserPurchases = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/compras?user_id=${userId}`)
      const data = await response.json()
      if (data.success) {
        setCompras(data.data || [])
      } else {
        setError(data.error || 'Error al cargar compras')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserProducts = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/compras?user_id=${userId}&estado=completado`)
      const data = await response.json()
      if (data.success) {
        const completedPurchases = (data.data || []).filter(
          (c: CompraWithItems) => c.estado === 'completado'
        )
        return completedPurchases.flatMap((c: CompraWithItems) => 
          (c.items || []).map(item => ({
            ...item.producto,
            compra_id: c.id,
            fecha_compra: c.creado_en,
            cantidad: item.cantidad,
            precio_pagado: item.precio_unitario
          }))
        )
      }
      return []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    compras,
    loading,
    error,
    fetchUserPurchases,
    fetchUserProducts
  }
}

export default useCompras