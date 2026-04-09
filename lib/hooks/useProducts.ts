import { useState, useEffect, useCallback } from 'react'

export interface ProductoCategoria {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  icono?: string
  orden: number
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  contenido?: string
  metodo_pago: 'coins' | 'dinero' | 'ambos'
  precio_coins?: number
  precio_usd?: number
  precio_comparacion?: number
  tipo: 'digital' | 'fisico' | 'servicio' | 'suscripcion'
  categoria_id?: string
  categoria?: ProductoCategoria
  imagen_principal?: string
  galeria?: string[]
  stock: number
  stock_ilimitado: boolean
  archivo_url?: string
  activo: boolean
  destacado: boolean
  creado_en: string
  actualizado_en: string
}

export function useProducts() {
  const [products, setProducts] = useState<Producto[]>([])
  const [categories, setCategories] = useState<ProductoCategoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async (filters?: {
    categoria_id?: string
    destacado?: boolean
    limite?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.categoria_id) params.append('categoria_id', filters.categoria_id)
      if (filters?.destacado) params.append('destacado', 'true')
      if (filters?.limite) params.append('limite', filters.limite.toString())

      const response = await fetch(`/api/productos?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
      } else {
        setError(data.error || 'Error al cargar productos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProductBySlug = useCallback(async (slug: string): Promise<Producto | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/productos?slug=${slug}`)
      const data = await response.json()

      if (data.success) {
        return data.data
      }
      setError(data.error || 'Producto no encontrado')
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/productos/categorias')
      const data = await response.json()

      if (data.success) {
        setCategories(data.data)
      } else {
        setError(data.error || 'Error al cargar categorías')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const getProductsByCategory = useCallback((categoriaId: string) => {
    return products.filter(p => p.categoria_id === categoriaId)
  }, [products])

  const getFeaturedProducts = useCallback(() => {
    return products.filter(p => p.destacado)
  }, [products])

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchProductBySlug,
    fetchCategories,
    getProductsByCategory,
    getFeaturedProducts
  }
}

export default useProducts