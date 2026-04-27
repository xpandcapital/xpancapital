import { useState, useEffect, useCallback } from 'react'

export interface ProductoArchivo {
  id: string
  producto_id: string
  nombre: string
  archivo_url: string
  tamano_bytes: number | null
  tipo_entrega: 'archivo' | 'enlace'
  tipo_archivo: string | null
  orden: number
}

export interface ProductoVideo {
  id: string
  producto_id: string
  titulo: string
  video_url: string
  descripcion: string | null
  duracion_min: number | null
  orden: number
}

export interface Producto {
  id: string
  nombre: string
  imagen_principal: string | null
  tipo: string
  categoria: { id: string; nombre: string } | null
}

export interface ProductoWithEntregas extends Producto {
  videos: ProductoVideo[]
  archivos: ProductoArchivo[]
  descripcion_entrega: string | null
}

export function useProductosEntregas() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/productos?tipo=digital')
      const data = await response.json()
      if (data.success) {
        setProductos(data.data || [])
      } else {
        setError(data.error || 'Error al cargar productos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  return { productos, loading, error, refetch: fetchProductos }
}

export function useProductoEntregas(productoId: string | null) {
  const [data, setData] = useState<ProductoWithEntregas | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntregas = useCallback(async () => {
    if (!productoId) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Error al cargar entregas')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [productoId])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas])

  const addVideo = useCallback(async (video: Omit<ProductoVideo, 'id' | 'producto_id' | 'created_at'>) => {
    if (!productoId) return null
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video', data: video })
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  const updateVideo = useCallback(async (videoId: string, video: Partial<ProductoVideo>) => {
    if (!productoId) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video', data: video })
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  const deleteVideo = useCallback(async (videoId: string) => {
    if (!productoId) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas/${videoId}?type=video`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  const addArchivo = useCallback(async (archivo: Omit<ProductoArchivo, 'id' | 'producto_id'>) => {
    if (!productoId) return null
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'archivo', data: archivo })
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  const updateArchivo = useCallback(async (archivoId: string, archivo: Partial<ProductoArchivo>) => {
    if (!productoId) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas/${archivoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'archivo', data: archivo })
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  const deleteArchivo = useCallback(async (archivoId: string) => {
    if (!productoId) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas/${archivoId}?type=archivo`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  const updateDescripcionEntrega = useCallback(async (descripcion: string) => {
    if (!productoId) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/productos/${productoId}/entregas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'descripcion_entrega', data: { descripcion_entrega: descripcion } })
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntregas()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }, [productoId, fetchEntregas])

  return {
    data,
    loading,
    saving,
    error,
    refetch: fetchEntregas,
    addVideo,
    updateVideo,
    deleteVideo,
    addArchivo,
    updateArchivo,
    deleteArchivo,
    updateDescripcionEntrega
  }
}
