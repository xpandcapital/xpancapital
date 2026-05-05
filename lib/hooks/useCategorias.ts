import { useState, useEffect, useCallback } from 'react'
import type { ProductoCategoria, ProductoCategoriaInput } from '@/lib/types/contexts'

export function useCategorias() {
  const [categorias, setCategorias] = useState<ProductoCategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategorias = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = includeInactive ? '?all=true' : ''
      const response = await fetch(`/api/context/categorias${params}`)
      const data = await response.json()

      if (data.success) {
        setCategorias(data.data)
      } else {
        setError(data.error || 'Error al cargar categorías')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const addCategoria = useCallback(async (categoria: ProductoCategoriaInput) => {
    try {
      const response = await fetch('/api/context/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      })
      const data = await response.json()

      if (data.success) {
        setCategorias(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const updateCategoria = useCallback(async (id: string, updates: Partial<ProductoCategoria>) => {
    try {
      const response = await fetch('/api/context/categorias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      const data = await response.json()

      if (data.success) {
        setCategorias(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const deleteCategoria = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/context/categorias?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setCategorias(prev => prev.filter(c => c.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const reorderCategorias = useCallback(async (newOrder: ProductoCategoria[]) => {
    const updates = newOrder.map((cat, index) => ({ id: cat.id, orden: index }))
    
    try {
      await Promise.all(
        updates.map(u => 
          fetch('/api/context/categorias', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
          })
        )
      )
      setCategorias(newOrder)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  return {
    categorias,
    loading,
    error,
    fetchCategorias,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    reorderCategorias
  }
}

export default useCategorias