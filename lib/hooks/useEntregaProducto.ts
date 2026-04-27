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

export interface ProductoEntregado {
  id: string
  nombre: string
  descripcion: string | null
  descripcion_entrega: string | null
  imagen_principal: string | null
  tipo: string
  archivo_url: string | null
  categoria: { nombre: string } | null
}

export interface EntregaData {
  producto: ProductoEntregado
  videos: ProductoVideo[]
  archivos: ProductoArchivo[]
  compra_id: string
}

export function useEntregaProducto(productoId: string | null, userId: string | null) {
  const [data, setData] = useState<EntregaData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntrega = useCallback(async () => {
    if (!productoId || !userId) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/productos/${productoId}/entrega?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Error al cargar el producto')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [productoId, userId])

  useEffect(() => {
    fetchEntrega()
  }, [fetchEntrega])

  const descargarArchivo = useCallback(async (archivoId: string): Promise<string | null> => {
    if (!productoId || !userId) return null

    try {
      const response = await fetch(
        `/api/productos/${productoId}/descargar/${archivoId}?user_id=${userId}`
      )
      const result = await response.json()

      if (result.success && result.url) {
        return result.url
      } else {
        throw new Error(result.error || 'Error al obtener enlace de descarga')
      }
    } catch (err) {
      throw err
    }
  }, [productoId, userId])

  const abrirEnlace = useCallback(async (archivoId: string): Promise<void> => {
    if (!productoId || !userId) return

    window.open(
      `/api/productos/${productoId}/abrir-enlace/${archivoId}?user_id=${userId}`,
      '_blank'
    )
  }, [productoId, userId])

  const descargarZip = useCallback(async (): Promise<{ url: string; nombre: string } | null> => {
    if (!productoId || !userId) return null

    try {
      const response = await fetch(
        `/api/productos/${productoId}/descargar-zip?user_id=${userId}`
      )
      const result = await response.json()

      if (result.success && result.url) {
        return { url: result.url, nombre: result.nombre }
      } else {
        throw new Error(result.error || 'Error al crear ZIP')
      }
    } catch (err) {
      throw err
    }
  }, [productoId, userId])

  return {
    data,
    loading,
    error,
    refetch: fetchEntrega,
    descargarArchivo,
    abrirEnlace,
    descargarZip
  }
}

export default useEntregaProducto
